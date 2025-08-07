from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from typing import List, Optional
from datetime import datetime

from models.promotion import Promotion, PromotionCreate, PromotionUpdate
from auth import get_current_user
from server import db
import uuid
import os
import shutil
from pathlib import Path

router = APIRouter(prefix="/api/admin/promotions", tags=["Admin Promotions"])

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads/promotions")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.get("/", response_model=List[Promotion])
async def get_all_promotions(current_user: dict = Depends(get_current_user)):
    """Get all promotions (active and inactive)"""
    promotions = await db.promotions.find().sort("created_at", -1).to_list(100)
    return [Promotion(**promo) for promo in promotions]

@router.get("/active", response_model=List[Promotion])
async def get_active_promotions(current_user: dict = Depends(get_current_user)):
    """Get only active promotions within date range"""
    now = datetime.utcnow()
    query = {
        "is_active": True,
        "start_date": {"$lte": now},
        "end_date": {"$gte": now}
    }
    promotions = await db.promotions.find(query).sort("created_at", -1).to_list(100)
    return [Promotion(**promo) for promo in promotions]

@router.get("/{promotion_id}", response_model=Promotion)
async def get_promotion(promotion_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific promotion"""
    promotion = await db.promotions.find_one({"id": promotion_id})
    if not promotion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Promotion not found"
        )
    return Promotion(**promotion)

@router.post("/", response_model=Promotion)
async def create_promotion(
    promotion: PromotionCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create new promotion"""
    promotion_dict = promotion.dict()
    promotion_dict["id"] = str(uuid.uuid4())
    promotion_dict["created_at"] = datetime.utcnow()
    promotion_dict["updated_at"] = datetime.utcnow()
    
    # Validate dates
    if promotion_dict["start_date"] >= promotion_dict["end_date"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start date must be before end date"
        )
    
    promotion_obj = Promotion(**promotion_dict)
    result = await db.promotions.insert_one(promotion_obj.dict())
    
    # Log the action
    await db.admin_logs.insert_one({
        "username": current_user["username"],
        "action": "create_promotion",
        "resource_id": promotion_obj.id,
        "details": {"title": promotion_obj.title},
        "timestamp": datetime.utcnow()
    })
    
    return promotion_obj

@router.put("/{promotion_id}", response_model=Promotion)
async def update_promotion(
    promotion_id: str,
    promotion_update: PromotionUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update existing promotion"""
    # Check if promotion exists
    existing_promotion = await db.promotions.find_one({"id": promotion_id})
    if not existing_promotion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Promotion not found"
        )
    
    # Prepare update data
    update_data = {k: v for k, v in promotion_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    # Validate dates if provided
    start_date = update_data.get("start_date", existing_promotion["start_date"])
    end_date = update_data.get("end_date", existing_promotion["end_date"])
    if start_date >= end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start date must be before end date"
        )
    
    # Update promotion
    await db.promotions.update_one(
        {"id": promotion_id},
        {"$set": update_data}
    )
    
    # Get updated promotion
    updated_promotion = await db.promotions.find_one({"id": promotion_id})
    
    # Log the action
    await db.admin_logs.insert_one({
        "username": current_user["username"],
        "action": "update_promotion",
        "resource_id": promotion_id,
        "details": {"changes": list(update_data.keys())},
        "timestamp": datetime.utcnow()
    })
    
    return Promotion(**updated_promotion)

@router.delete("/{promotion_id}")
async def delete_promotion(
    promotion_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete promotion"""
    promotion = await db.promotions.find_one({"id": promotion_id})
    if not promotion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Promotion not found"
        )
    
    # Delete associated image file if exists
    if promotion.get("image_url"):
        try:
            image_path = Path(promotion["image_url"].replace("/uploads/", "uploads/"))
            if image_path.exists():
                image_path.unlink()
        except Exception as e:
            print(f"Error deleting image file: {e}")
    
    # Delete from database
    await db.promotions.delete_one({"id": promotion_id})
    
    # Log the action
    await db.admin_logs.insert_one({
        "username": current_user["username"],
        "action": "delete_promotion",
        "resource_id": promotion_id,
        "details": {"title": promotion.get("title")},
        "timestamp": datetime.utcnow()
    })
    
    return {"message": "Promotion deleted successfully"}

@router.post("/{promotion_id}/upload-image")
async def upload_promotion_image(
    promotion_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload image for promotion"""
    # Check if promotion exists
    promotion = await db.promotions.find_one({"id": promotion_id})
    if not promotion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Promotion not found"
        )
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only JPEG, PNG, and WebP are allowed."
        )
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    filename = f"{promotion_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.{file_extension}"
    file_path = UPLOAD_DIR / filename
    
    # Delete old image if exists
    if promotion.get("image_url"):
        try:
            old_image_path = Path(promotion["image_url"].replace("/uploads/", "uploads/"))
            if old_image_path.exists():
                old_image_path.unlink()
        except Exception as e:
            print(f"Error deleting old image: {e}")
    
    # Save new image
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving file: {str(e)}"
        )
    
    # Update promotion with image URL
    image_url = f"/uploads/promotions/{filename}"
    await db.promotions.update_one(
        {"id": promotion_id},
        {"$set": {"image_url": image_url, "updated_at": datetime.utcnow()}}
    )
    
    # Log the action
    await db.admin_logs.insert_one({
        "username": current_user["username"],
        "action": "upload_promotion_image",
        "resource_id": promotion_id,
        "details": {"filename": filename},
        "timestamp": datetime.utcnow()
    })
    
    return {
        "message": "Image uploaded successfully",
        "image_url": image_url,
        "filename": filename
    }

@router.post("/bulk-activate")
async def bulk_activate_promotions(
    promotion_ids: List[str],
    current_user: dict = Depends(get_current_user)
):
    """Activate multiple promotions"""
    result = await db.promotions.update_many(
        {"id": {"$in": promotion_ids}},
        {"$set": {"is_active": True, "updated_at": datetime.utcnow()}}
    )
    
    # Log the action
    await db.admin_logs.insert_one({
        "username": current_user["username"],
        "action": "bulk_activate_promotions",
        "details": {"count": result.modified_count, "ids": promotion_ids},
        "timestamp": datetime.utcnow()
    })
    
    return {"message": f"Activated {result.modified_count} promotions"}

@router.post("/bulk-deactivate")
async def bulk_deactivate_promotions(
    promotion_ids: List[str],
    current_user: dict = Depends(get_current_user)
):
    """Deactivate multiple promotions"""
    result = await db.promotions.update_many(
        {"id": {"$in": promotion_ids}},
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )
    
    # Log the action
    await db.admin_logs.insert_one({
        "username": current_user["username"],
        "action": "bulk_deactivate_promotions",
        "details": {"count": result.modified_count, "ids": promotion_ids},
        "timestamp": datetime.utcnow()
    })
    
    return {"message": f"Deactivated {result.modified_count} promotions"}