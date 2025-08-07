from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from datetime import datetime

from models.promotion import Promotion
from models.brand import Brand
from server import db

router = APIRouter(prefix="/api/public", tags=["Public API"])

@router.get("/promotions/active", response_model=List[Promotion])
async def get_active_promotions():
    """Get currently active promotions (public endpoint)"""
    now = datetime.utcnow()
    query = {
        "is_active": True,
        "start_date": {"$lte": now},
        "end_date": {"$gte": now}
    }
    
    promotions = await db.promotions.find(query).sort("created_at", -1).to_list(100)
    return [Promotion(**promo) for promo in promotions]

@router.get("/brands/active", response_model=List[Brand])
async def get_active_brands():
    """Get active brands (public endpoint)"""
    brands = await db.brands.find({"is_active": True}).sort("order", 1).to_list(100)
    return [Brand(**brand) for brand in brands]

@router.get("/content/{section_name}")
async def get_section_content(section_name: str):
    """Get public content for a specific section"""
    configs = await db.site_config.find({"section": section_name}).to_list(100)
    
    if not configs:
        return {}
    
    section_content = {}
    for config in configs:
        section_content[config["key"]] = config["value"]
    
    return section_content

@router.get("/content")
async def get_all_public_content():
    """Get all public content organized by sections"""
    sections = {}
    configs = await db.site_config.find().to_list(1000)
    
    for config in configs:
        section = config["section"]
        if section not in sections:
            sections[section] = {}
        sections[section][config["key"]] = config["value"]
    
    return sections

@router.get("/site-info")
async def get_site_info():
    """Get basic site information for SEO and metadata"""
    header_content = await db.site_config.find({"section": "header"}).to_list(10)
    general_content = await db.site_config.find({"section": "general"}).to_list(10)
    
    site_info = {}
    for config in header_content + general_content:
        site_info[config["key"]] = config["value"]
    
    # Add some computed fields
    site_info["last_updated"] = datetime.utcnow()
    
    return site_info

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        await db.list_collection_names()
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow(),
            "database": "connected"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection failed: {str(e)}"
        )