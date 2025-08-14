from fastapi import FastAPI, APIRouter, Request
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime

# Import routes
from routes.admin_auth import router as admin_auth_router
from routes.admin_promotions import router as admin_promotions_router
from routes.admin_brands import router as admin_brands_router
from routes.admin_content import router as admin_content_router
from routes.admin_upload import router as admin_upload_router
from routes.public_api import router as public_api_router
from routes.admin_system import router as admin_system_router
from scheduler import start_scheduler

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for FastAPI app"""
    # Startup
    logger.info("Starting Óptica Villalba API...")
    
    # Initialize auth service with database
    from auth import set_database
    set_database(db)
    
    # Start the promotion scheduler
    await start_scheduler(db)
    
    logger.info("API startup complete")
    
    yield
    
    # Shutdown
    from scheduler import stop_scheduler
    await stop_scheduler()
    client.close()
    logger.info("API shutdown complete")

# Security/config flags
ENVIRONMENT = os.environ.get("ENVIRONMENT", os.environ.get("ENV", "development")).lower()
FORCE_HTTPS = os.environ.get("FORCE_HTTPS", "false").lower() in {"1", "true", "yes"}

# Create the main app without a prefix
app = FastAPI(title="Óptica Villalba API", version="1.0.0", lifespan=lifespan)

# Create a router with the /api prefix for existing endpoints
api_router = APIRouter(prefix="/api")

# Define Models (keeping existing ones)
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Add existing routes to the router
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include all routers
app.include_router(api_router)  # Existing routes
app.include_router(admin_auth_router)  # Admin authentication
app.include_router(admin_promotions_router)  # Admin promotions
app.include_router(admin_brands_router)  # Admin brands
app.include_router(admin_content_router)  # Admin content management
app.include_router(admin_upload_router)  # Admin file uploads
app.include_router(public_api_router)  # Public API endpoints
app.include_router(admin_system_router)  # Admin system (logs, backups)

# Create uploads directory and serve static files
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS configuration from env (comma-separated)
raw_origins = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:3001"
)
ALLOWED_ORIGINS = [o.strip() for o in raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Optionally force HTTPS (useful behind reverse proxy)
if FORCE_HTTPS or ENVIRONMENT == "production":
    app.add_middleware(HTTPSRedirectMiddleware)

@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    # Basic hardening headers
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    # Apply HSTS only if https
    if (request.url.scheme or "").lower() == "https":
        response.headers.setdefault("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
    # Minimal CSP (relaxed for dev); tighten in production as needed
    if ENVIRONMENT == "production":
        response.headers.setdefault("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'")
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8001, reload=False)
