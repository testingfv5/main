from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import List, Optional
from datetime import datetime
import os
import shutil
from pathlib import Path
import uuid
from PIL import Image
import io

from auth import get_current_user, get_database

router = APIRouter(prefix="/api/admin/upload", tags=["Admin File Upload"])

# Configuration
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Create subdirectories
(UPLOAD_DIR / "promotions").mkdir(exist_ok=True)
(UPLOAD_DIR / "brands").mkdir(exist_ok=True)
(UPLOAD_DIR / "general").mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_DIMENSION = 2048  # Max width/height in pixels

def validate_image_metadata(file: UploadFile) -> bool:
    """Validate uploaded image basic metadata (extension only)."""
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        return False
    return True

def validate_mime_type(file: UploadFile) -> bool:
    """Validate request-declared MIME and real image open."""
    try:
        if file.content_type not in ALLOWED_MIME:
            return False
        return True
    except Exception:
        return False

def optimize_image(image_content: bytes, max_width: int = 1200, quality: int = 85) -> bytes:
    """Optimize image for web use"""
    try:
        # Open image
        image = Image.open(io.BytesIO(image_content))
        
        # Convert RGBA to RGB if necessary
        if image.mode == "RGBA":
            background = Image.new("RGB", image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[-1])
            image = background
        elif image.mode not in ["RGB", "L"]:
            image = image.convert("RGB")
        
        # Resize if too large
        if image.width > max_width:
            ratio = max_width / image.width
            new_height = int(image.height * ratio)
            image = image.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
        # Save optimized image
        output = io.BytesIO()
        image.save(output, format="JPEG", quality=quality, optimize=True)
        return output.getvalue()
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error optimizing image: {str(e)}"
        )

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    category: str = Form("general"),  # promotions, brands, general
    optimize: bool = Form(True),
    current_user: dict = Depends(get_current_user)
):
    """Upload and optimize image file"""
    
    # Validate file metadata (extension) and MIME
    if not validate_image_metadata(file) or not validate_mime_type(file):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file. Allowed: {', '.join(ALLOWED_EXTENSIONS)}. Max size: 5MB"
        )
    
    try:
        # Read file content
        content = await file.read()

        # Enforce max size after read
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File too large. Max size is 5MB"
            )
        
        # Optimize image if requested
        if optimize:
            content = optimize_image(content)
            file_ext = ".jpg"  # Always save optimized as JPEG
        else:
            file_ext = Path(file.filename).suffix.lower()
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = UPLOAD_DIR / category / unique_filename
        
        # Ensure category directory exists
        file_path.parent.mkdir(exist_ok=True)
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Create URL for frontend access
        file_url = f"/uploads/{category}/{unique_filename}"
        
        # Log upload
        db = get_database()
        await db.admin_logs.insert_one({
            "username": current_user["username"],
            "action": "upload_image",
            "details": {
                "filename": file.filename,
                "saved_as": unique_filename,
                "category": category,
                "size": len(content),
                "optimized": optimize
            },
            "timestamp": datetime.utcnow()
        })
        
        return {
            "success": True,
            "filename": unique_filename,
            "original_name": file.filename,
            "url": file_url,
            "size": len(content),
            "category": category,
            "optimized": optimize
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}"
        )

@router.post("/images/bulk")
async def upload_multiple_images(
    files: List[UploadFile] = File(...),
    category: str = Form("general"),
    optimize: bool = Form(True),
    current_user: dict = Depends(get_current_user)
):
    """Upload multiple images at once"""
    
    if len(files) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 files allowed per request"
        )
    
    results = []
    errors = []
    
    for file in files:
        try:
            if not validate_image_metadata(file) or not validate_mime_type(file):
                errors.append({
                    "filename": file.filename,
                    "error": f"Invalid file format or size"
                })
                continue
            
            # Read and process file
            content = await file.read()
            if len(content) > MAX_FILE_SIZE:
                errors.append({
                    "filename": file.filename,
                    "error": "File too large. Max size is 5MB"
                })
                continue
            
            if optimize:
                content = optimize_image(content)
                file_ext = ".jpg"
            else:
                file_ext = Path(file.filename).suffix.lower()
            
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            file_path = UPLOAD_DIR / category / unique_filename
            file_path.parent.mkdir(exist_ok=True)
            
            with open(file_path, "wb") as f:
                f.write(content)
            
            file_url = f"/uploads/{category}/{unique_filename}"
            
            results.append({
                "filename": unique_filename,
                "original_name": file.filename,
                "url": file_url,
                "size": len(content),
                "category": category
            })
            
        except Exception as e:
            errors.append({
                "filename": file.filename,
                "error": str(e)
            })
    
    # Log bulk upload
    db = get_database()
    await db.admin_logs.insert_one({
        "username": current_user["username"],
        "action": "bulk_upload_images",
        "details": {
            "total_files": len(files),
            "successful": len(results),
            "failed": len(errors),
            "category": category
        },
        "timestamp": datetime.utcnow()
    })
    
    return {
        "success": len(results),
        "failed": len(errors),
        "results": results,
        "errors": errors
    }

@router.delete("/image/{filename}")
async def delete_image(
    filename: str,
    category: str = "general",
    current_user: dict = Depends(get_current_user)
):
    """Delete an uploaded image"""
    
    file_path = UPLOAD_DIR / category / filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    try:
        file_path.unlink()  # Delete file
        
        # Log deletion
        db = get_database()
        await db.admin_logs.insert_one({
            "username": current_user["username"],
            "action": "delete_image",
            "details": {
                "filename": filename,
                "category": category
            },
            "timestamp": datetime.utcnow()
        })
        
        return {"success": True, "message": "File deleted successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting file: {str(e)}"
        )

@router.get("/images/{category}")
async def list_images(
    category: str = "general",
    current_user: dict = Depends(get_current_user)
):
    """List all uploaded images in a category"""
    
    category_path = UPLOAD_DIR / category
    if not category_path.exists():
        return {"images": []}
    
    images = []
    for file_path in category_path.iterdir():
        if file_path.is_file() and file_path.suffix.lower() in ALLOWED_EXTENSIONS:
            stat = file_path.stat()
            images.append({
                "filename": file_path.name,
                "url": f"/uploads/{category}/{file_path.name}",
                "size": stat.st_size,
                "created_at": datetime.fromtimestamp(stat.st_ctime),
                "modified_at": datetime.fromtimestamp(stat.st_mtime)
            })
    
    # Sort by creation time (newest first)
    images.sort(key=lambda x: x["created_at"], reverse=True)
    
    return {"images": images, "count": len(images)}

@router.get("/storage/stats")
async def get_storage_stats(current_user: dict = Depends(get_current_user)):
    """Get storage statistics"""
    
    stats = {
        "categories": {},
        "total_files": 0,
        "total_size": 0
    }
    
    for category in ["promotions", "brands", "general"]:
        category_path = UPLOAD_DIR / category
        if category_path.exists():
            files = list(category_path.glob("*"))
            file_count = len([f for f in files if f.is_file()])
            total_size = sum(f.stat().st_size for f in files if f.is_file())
            
            stats["categories"][category] = {
                "files": file_count,
                "size": total_size,
                "size_mb": round(total_size / (1024 * 1024), 2)
            }
            
            stats["total_files"] += file_count
            stats["total_size"] += total_size
    
    stats["total_size_mb"] = round(stats["total_size"] / (1024 * 1024), 2)
    
    return stats