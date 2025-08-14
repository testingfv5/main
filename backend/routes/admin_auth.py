from fastapi import APIRouter, HTTPException, status, Request, Depends
from fastapi.responses import JSONResponse
from typing import Dict, Any
from datetime import datetime, timedelta
import uuid

from models.user import UserLogin, UserMFA, Token, UserCreate
from auth import (
    AuthService, 
    check_rate_limit, 
    record_login_attempt, 
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_database
)

router = APIRouter(prefix="/api/admin/auth", tags=["Admin Authentication"])

@router.post("/login", response_model=Dict[str, Any])
async def login_step1(user_login: UserLogin, request: Request):
    """First step of login - verify username and password"""
    
    # Rate limiting by IP and IP+username combo
    client_ip = request.client.host
    identifier = f"{client_ip}:{user_login.username.lower()}"
    if not check_rate_limit(client_ip) or not check_rate_limit(identifier):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later."
        )
    
    # Get user
    user = await AuthService.get_user_by_username(user_login.username)
    if not user:
        # record both IP and combo
        record_login_attempt(client_ip)
        record_login_attempt(identifier)
        await AuthService.log_user_login(user_login.username, client_ip, False)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Verify password
    if not AuthService.verify_password(user_login.password, user["password_hash"]):
        record_login_attempt(client_ip)
        record_login_attempt(identifier)
        await AuthService.log_user_login(user_login.username, client_ip, False)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Check if user is active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is disabled"
        )
    
    # Check MFA status
    if not user.get("mfa_enabled", False):
        # Require MFA setup for all users (no bypass in production)
        return {
            "requires_mfa_setup": True,
            "username": user_login.username,
            "message": "MFA setup required"
        }
    
    return {
        "requires_mfa": True,
        "username": user_login.username,
        "message": "Please provide MFA code"
    }

@router.post("/setup-mfa")
async def setup_mfa(request: Dict[str, str]):
    """Setup MFA for user"""
    username = request.get("username")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username required"
        )
    
    user = await AuthService.get_user_by_username(username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Generate MFA secret
    secret = AuthService.generate_mfa_secret()
    qr_code = AuthService.generate_qr_code(secret, username)
    
    return {
        "secret": secret,
        "qr_code": qr_code,
        "manual_entry_key": secret,
        "instructions": f"Scan the QR code with Google Authenticator or similar app, then verify with a 6-digit code"
    }

@router.post("/verify-mfa-setup")
async def verify_mfa_setup(request: Dict[str, str]):
    """Verify MFA setup with first code"""
    username = request.get("username")
    secret = request.get("secret")
    mfa_code = request.get("mfa_code")
    
    if not all([username, secret, mfa_code]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username, secret, and MFA code required"
        )
    
    # Verify the code
    if not AuthService.verify_mfa_token(secret, mfa_code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid MFA code"
        )
    
    # Enable MFA for user
    await AuthService.update_user_mfa(username, secret, True)
    
    # Create token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = AuthService.create_access_token(
        data={"sub": username}, expires_delta=access_token_expires
    )
    
    # Log successful login
    await AuthService.log_user_login(username, success=True)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "message": "MFA setup completed successfully"
    }

@router.post("/verify-mfa", response_model=Token)
async def verify_mfa(user_mfa: UserMFA, request: Request):
    """Verify MFA code and return JWT token"""
    
    client_ip = request.client.host
    identifier = f"{client_ip}:{user_mfa.username.lower()}"

    # Rate limiting check for MFA step as well
    if not check_rate_limit(client_ip) or not check_rate_limit(identifier):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later."
        )
    
    # Get user
    user = await AuthService.get_user_by_username(user_mfa.username)
    if not user or not user.get("mfa_enabled", False):
        record_login_attempt(client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="MFA not enabled for this user"
        )
    
    # Verify MFA code (track attempts by IP+username composite)
    if not AuthService.verify_mfa_token(user["mfa_secret"], user_mfa.mfa_code):
        record_login_attempt(client_ip)
        record_login_attempt(identifier)
        await AuthService.log_user_login(user_mfa.username, client_ip, False)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid MFA code"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = AuthService.create_access_token(
        data={"sub": user_mfa.username}, expires_delta=access_token_expires
    )
    
    # Update last login
    await AuthService.log_user_login(user_mfa.username, client_ip, True)
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

@router.post("/refresh")
async def refresh_token(current_user: dict = Depends(get_current_user)):
    """Refresh JWT token"""
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = AuthService.create_access_token(
        data={"sub": current_user["username"]}, expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return {
        "username": current_user["username"],
        "email": current_user.get("email"),
        "mfa_enabled": current_user.get("mfa_enabled", False),
        "last_login": current_user.get("last_login"),
        "created_at": current_user.get("created_at")
    }

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout user (client should discard token)"""
    # Log logout action
    await AuthService.log_user_login(current_user["username"], success=True)
    return {"message": "Logged out successfully"}

# Initial admin user creation (only for development)
@router.post("/create-initial-admin")
async def create_initial_admin():
    """Create initial admin user - should be used only once in development"""
    
    # Check if any admin users exist
    existing_admin = await AuthService.get_user_by_username("admin")
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Initial admin already exists"
        )
    
    # Create initial admin
    admin_data = {
        "id": str(uuid.uuid4()),
        "username": "admin",
        "email": "admin@opticavillalba.com",
        "password": "AdminPass123!",  # Should be changed after first login
        "is_active": True,
        "mfa_enabled": False
    }
    
    user_id = await AuthService.create_user(admin_data)
    
    return {
        "message": "Initial admin user created successfully",
        "username": "admin",
        "note": "Please setup MFA on first login and change password"
    }

@router.post("/setup-admin-mfa")
async def setup_admin_mfa():
    """Setup MFA for admin user automatically - for development only"""
    
    # Get admin user
    user = await AuthService.get_user_by_username("admin")
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin user not found"
        )
    
    # Check if MFA is already enabled
    if user.get("mfa_enabled", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA already enabled for admin user"
        )
    
    # Generate MFA secret
    secret = AuthService.generate_mfa_secret()
    qr_code = AuthService.generate_qr_code(secret, "admin")
    
    # Update user with MFA secret (but not enabled yet)
    await AuthService.update_user_mfa("admin", secret, enabled=False)
    
    return {
        "secret": secret,
        "qr_code": qr_code,
        "manual_entry_key": secret,
        "instructions": f"Scan the QR code with Google Authenticator or similar app, then verify with a 6-digit code"
    }

@router.post("/verify-admin-mfa-setup")
async def verify_admin_mfa_setup(request: Dict[str, str]):
    """Verify MFA setup for admin user and enable it"""
    mfa_code = request.get("mfa_code")
    
    if not mfa_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA code required"
        )
    
    # Get admin user
    user = await AuthService.get_user_by_username("admin")
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin user not found"
        )
    
    # Verify the code
    if not AuthService.verify_mfa_token(user["mfa_secret"], mfa_code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid MFA code"
        )
    
    # Enable MFA for admin user
    await AuthService.update_user_mfa("admin", user["mfa_secret"], enabled=True)
    
    return {
        "message": "MFA setup completed successfully for admin user",
        "username": "admin"
    }