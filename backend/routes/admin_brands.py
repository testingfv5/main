from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import datetime

from models.brand import Brand, BrandCreate, BrandUpdate
from auth import get_current_user
from server import db
import uuid

router = APIRouter(prefix="/api/admin/brands", tags=["Admin Brands"])

@router.get("/", response_model=List[Brand])
async def get_all_brands(current_user: dict = Depends(get_current_user)):
    """Get all brands ordered by order field"""
    brands = await db.brands.find().sort("order", 1).to_list(100)
    return [Brand(**brand) for brand in brands]

@router.get("/active", response_model=List[Brand])
async def get_active_brands(current_user: dict = Depends(get_current_user)):
    """Get only active brands"""
    brands = await db.brands.find({"is_active": True}).sort("order", 1).to_list(100)
    return [Brand(**brand) for brand in brands]

@router.get("/{brand_id}", response_model=Brand)
async def get_brand(brand_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific brand"""
    brand = await db.brands.find_one({"id": brand_id})
    if not brand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Brand not found"
        )
    return Brand(**brand)

@router.post("/", response_model=Brand)
async def create_brand(
    brand: BrandCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create new brand"""
    brand_dict = brand.dict()
    brand_dict["id"] = str(uuid.uuid4())
    brand_dict["created_at"] = datetime.utcnow()
    brand_dict["updated_at"] = datetime.utcnow()
    
    brand_obj = Brand(**brand_dict)
    await db.brands.insert_one(brand_obj.dict())
    
    # Log the action
    await db.admin_logs.insert_one({
        "username": current_user["username"],
        "action": "create_brand",
        "resource_id": brand_obj.id,
        "details": {"name": brand_obj.name},
        "timestamp": datetime.utcnow()
    })
    
    return brand_obj

@router.put("/{brand_id}", response_model=Brand)
async def update_brand(
    brand_id: str,
    brand_update: BrandUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update existing brand"""
    # Check if brand exists
    existing_brand = await db.brands.find_one({"id": brand_id})
    if not existing_brand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Brand not found"
        )
    
    # Prepare update data
    update_data = {k: v for k, v in brand_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    # Update brand
    await db.brands.update_one(
        {"id": brand_id},
        {"$set": update_data}
    )
    
    # Get updated brand
    updated_brand = await db.brands.find_one({"id": brand_id})
    
    # Log the action
    await db.admin_logs.insert_one({
        "username": current_user["username"],
        "action": "update_brand",
        "resource_id": brand_id,
        "details": {"changes": list(update_data.keys())},
        "timestamp": datetime.utcnow()
    })
    
    return Brand(**updated_brand)

@router.delete("/{brand_id}")
async def delete_brand(
    brand_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete brand"""
    brand = await db.brands.find_one({"id": brand_id})
    if not brand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Brand not found"
        )
    
    # Delete from database
    await db.brands.delete_one({"id": brand_id})
    
    # Log the action
    await db.admin_logs.insert_one({
        "username": current_user["username"],
        "action": "delete_brand",
        "resource_id": brand_id,
        "details": {"name": brand.get("name")},
        "timestamp": datetime.utcnow()
    })
    
    return {"message": "Brand deleted successfully"}

@router.put("/reorder")
async def reorder_brands(
    brand_orders: List[dict],  # [{"id": "brand_id", "order": 1}, ...]
    current_user: dict = Depends(get_current_user)
):
    """Reorder brands"""
    try:
        for item in brand_orders:
            await db.brands.update_one(
                {"id": item["id"]},
                {"$set": {"order": item["order"], "updated_at": datetime.utcnow()}}
            )
        
        # Log the action
        await db.admin_logs.insert_one({
            "username": current_user["username"],
            "action": "reorder_brands",
            "details": {"count": len(brand_orders)},
            "timestamp": datetime.utcnow()
        })
        
        return {"message": f"Reordered {len(brand_orders)} brands successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reordering brands: {str(e)}"
        )

@router.post("/bulk-activate")
async def bulk_activate_brands(
    brand_ids: List[str],
    current_user: dict = Depends(get_current_user)
):
    """Activate multiple brands"""
    result = await db.brands.update_many(
        {"id": {"$in": brand_ids}},
        {"$set": {"is_active": True, "updated_at": datetime.utcnow()}}
    )
    
    # Log the action
    await db.admin_logs.insert_one({
        "username": current_user["username"],
        "action": "bulk_activate_brands",
        "details": {"count": result.modified_count, "ids": brand_ids},
        "timestamp": datetime.utcnow()
    })
    
    return {"message": f"Activated {result.modified_count} brands"}

@router.post("/bulk-deactivate")
async def bulk_deactivate_brands(
    brand_ids: List[str],
    current_user: dict = Depends(get_current_user)
):
    """Deactivate multiple brands"""
    result = await db.brands.update_many(
        {"id": {"$in": brand_ids}},
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )
    
    # Log the action
    await db.admin_logs.insert_one({
        "username": current_user["username"],
        "action": "bulk_deactivate_brands",
        "details": {"count": result.modified_count, "ids": brand_ids},
        "timestamp": datetime.utcnow()
    })
    
    return {"message": f"Deactivated {result.modified_count} brands"}