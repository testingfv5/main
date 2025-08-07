import jwt
import bcrypt
import pyotp
import qrcode
from io import BytesIO
import base64
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from motor.motor_asyncio import AsyncIOMotorClient

# Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-jwt-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
MFA_COMPANY_NAME = "Óptica Villalba Admin"

security = HTTPBearer()

# MongoDB connection (using existing from server.py)
from server import db

class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password with bcrypt"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire, "iat": datetime.utcnow()})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> dict:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    
    @staticmethod
    def generate_mfa_secret() -> str:
        """Generate MFA secret for user"""
        return pyotp.random_base32()
    
    @staticmethod
    def generate_qr_code(secret: str, username: str) -> str:
        """Generate QR code for MFA setup"""
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=username,
            issuer_name=MFA_COMPANY_NAME
        )
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(totp_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        # Convert to base64 for frontend display
        qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()
        return f"data:image/png;base64,{qr_code_base64}"
    
    @staticmethod
    def verify_mfa_token(secret: str, token: str) -> bool:
        """Verify MFA token"""
        totp = pyotp.TOTP(secret)
        return totp.verify(token, valid_window=1)  # Allow 1 window tolerance
    
    @staticmethod
    async def get_user_by_username(username: str):
        """Get user from database by username"""
        user = await db.admin_users.find_one({"username": username})
        return user
    
    @staticmethod
    async def create_user(user_data: dict):
        """Create new admin user"""
        # Check if user already exists
        existing_user = await db.admin_users.find_one({"username": user_data["username"]})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
        
        # Hash password
        user_data["password_hash"] = AuthService.hash_password(user_data.pop("password"))
        user_data["created_at"] = datetime.utcnow()
        user_data["updated_at"] = datetime.utcnow()
        
        result = await db.admin_users.insert_one(user_data)
        return str(result.inserted_id)
    
    @staticmethod
    async def update_user_mfa(username: str, secret: str, enabled: bool = True):
        """Update user MFA settings"""
        await db.admin_users.update_one(
            {"username": username},
            {
                "$set": {
                    "mfa_secret": secret,
                    "mfa_enabled": enabled,
                    "updated_at": datetime.utcnow()
                }
            }
        )
    
    @staticmethod
    async def log_user_login(username: str, ip_address: str = None, success: bool = True):
        """Log user login attempt"""
        log_entry = {
            "username": username,
            "ip_address": ip_address,
            "success": success,
            "timestamp": datetime.utcnow(),
            "action": "login_attempt"
        }
        await db.admin_logs.insert_one(log_entry)

# Dependency to verify authentication
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to get current authenticated user"""
    try:
        token = credentials.credentials
        payload = AuthService.verify_token(token)
        username = payload.get("sub")
        
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        user = await AuthService.get_user_by_username(username)
        if user is None or not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        return user
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

# Rate limiting helper (simple in-memory implementation)
login_attempts = {}
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION = 300  # 5 minutes

def check_rate_limit(identifier: str) -> bool:
    """Check if identifier (IP/username) has exceeded rate limit"""
    now = datetime.utcnow()
    
    if identifier not in login_attempts:
        login_attempts[identifier] = []
    
    # Clean old attempts
    login_attempts[identifier] = [
        attempt for attempt in login_attempts[identifier]
        if (now - attempt).seconds < LOCKOUT_DURATION
    ]
    
    return len(login_attempts[identifier]) < MAX_LOGIN_ATTEMPTS

def record_login_attempt(identifier: str):
    """Record a login attempt"""
    now = datetime.utcnow()
    if identifier not in login_attempts:
        login_attempts[identifier] = []
    login_attempts[identifier].append(now)