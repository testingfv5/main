from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Dict, Any
from datetime import datetime

from models.site_config import SiteConfig, SiteConfigCreate, SiteConfigUpdate
from auth import get_current_user, get_database

router = APIRouter(prefix="/api/admin/content", tags=["Admin Content Management"])

@router.get("/sections")
async def get_all_sections(current_user: dict = Depends(get_current_user)):
    """Get all content sections organized by section"""
    db = get_database()
    sections = {}
    configs = await db.site_config.find().to_list(1000)
    
    for config in configs:
        section = config["section"]
        if section not in sections:
            sections[section] = {}
        sections[section][config["key"]] = {
            "value": config["value"],
            "description": config.get("description"),
            "updated_at": config["updated_at"]
        }
    
    return sections

@router.get("/section/{section_name}")
async def get_section_content(
    section_name: str,
    current_user: dict = Depends(get_current_user)
):
    """Get content for a specific section"""
    db = get_database()
    configs = await db.site_config.find({"section": section_name}).to_list(100)
    
    section_content = {}
    for config in configs:
        section_content[config["key"]] = {
            "value": config["value"],
            "description": config.get("description"),
            "updated_at": config["updated_at"]
        }
    
    return section_content

@router.post("/section/{section_name}")
async def create_section_config(
    section_name: str,
    config_data: SiteConfigCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create new configuration for a section"""
    db = get_database()
    # Check if config already exists
    existing_config = await db.site_config.find_one({
        "section": section_name,
        "key": config_data.key
    })
    
    if existing_config:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Configuration {config_data.key} already exists in section {section_name}"
        )
    
    config_dict = config_data.dict()
    config_dict["section"] = section_name
    config_dict["updated_at"] = datetime.utcnow()
    
    config_obj = SiteConfig(**config_dict)
    await db.site_config.insert_one(config_obj.dict())
    
    # Log the action
    await db.admin_logs.insert_one({
        "username": current_user["username"],
        "action": "create_site_config",
        "resource_id": config_obj.id,
        "details": {"section": section_name, "key": config_data.key},
        "timestamp": datetime.utcnow()
    })
    
    return config_obj

@router.put("/section/{section_name}/{config_key}")
async def update_section_config(
    section_name: str,
    config_key: str,
    config_update: SiteConfigUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update configuration in a section"""
    db = get_database()
    # Find existing config
    existing_config = await db.site_config.find_one({
        "section": section_name,
        "key": config_key
    })
    
    if not existing_config:
        # Create new config if it doesn't exist
        config_dict = {
            "section": section_name,
            "key": config_key,
            "value": config_update.value,
            "description": config_update.description,
            "updated_at": datetime.utcnow()
        }
        config_obj = SiteConfig(**config_dict)
        await db.site_config.insert_one(config_obj.dict())
        
        # Log the action
        await db.admin_logs.insert_one({
            "username": current_user["username"],
            "action": "create_site_config",
            "resource_id": config_obj.id,
            "details": {"section": section_name, "key": config_key},
            "timestamp": datetime.utcnow()
        })
        
        return config_obj
    
    # Update existing config
    update_data = {"updated_at": datetime.utcnow()}
    if config_update.value is not None:
        update_data["value"] = config_update.value
    if config_update.description is not None:
        update_data["description"] = config_update.description
    
    await db.site_config.update_one(
        {"section": section_name, "key": config_key},
        {"$set": update_data}
    )
    
    # Get updated config
    updated_config = await db.site_config.find_one({
        "section": section_name,
        "key": config_key
    })
    
    # Log the action
    await db.admin_logs.insert_one({
        "username": current_user["username"],
        "action": "update_site_config",
        "resource_id": updated_config["id"],
        "details": {"section": section_name, "key": config_key},
        "timestamp": datetime.utcnow()
    })
    
    return SiteConfig(**updated_config)

@router.put("/bulk-update")
async def bulk_update_content(
    updates: Dict[str, Dict[str, Any]],  # {"section": {"key": "value", ...}, ...}
    current_user: dict = Depends(get_current_user)
):
    """Bulk update multiple content sections"""
    db = get_database()
    updated_count = 0
    
    try:
        for section_name, section_data in updates.items():
            for key, value in section_data.items():
                # Update or create config
                await db.site_config.update_one(
                    {"section": section_name, "key": key},
                    {
                        "$set": {
                            "value": value,
                            "updated_at": datetime.utcnow()
                        },
                        "$setOnInsert": {
                            "id": f"{section_name}_{key}_{datetime.utcnow().timestamp()}",
                            "section": section_name,
                            "key": key
                        }
                    },
                    upsert=True
                )
                updated_count += 1
        
        # Log the action
        await db.admin_logs.insert_one({
            "username": current_user["username"],
            "action": "bulk_update_content",
            "details": {"sections": list(updates.keys()), "count": updated_count},
            "timestamp": datetime.utcnow()
        })
        
        return {"message": f"Updated {updated_count} configurations successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating content: {str(e)}"
        )

@router.delete("/section/{section_name}/{config_key}")
async def delete_section_config(
    section_name: str,
    config_key: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a specific configuration"""
    db = get_database()
    config = await db.site_config.find_one({
        "section": section_name,
        "key": config_key
    })
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuration not found"
        )
    
    await db.site_config.delete_one({
        "section": section_name,
        "key": config_key
    })
    
    # Log the action
    await db.admin_logs.insert_one({
        "username": current_user["username"],
        "action": "delete_site_config",
        "resource_id": config["id"],
        "details": {"section": section_name, "key": config_key},
        "timestamp": datetime.utcnow()
    })
    
    return {"message": "Configuration deleted successfully"}

@router.post("/initialize-defaults")
async def initialize_default_content(current_user: dict = Depends(get_current_user)):
    """Initialize default content for all sections"""
    db = get_database()
    default_configs = [
        # Header Section
        {
            "section": "header",
            "key": "company_name",
            "value": "Óptica Villalba",
            "description": "Company name displayed in header"
        },
        {
            "section": "header",
            "key": "tagline",
            "value": "Calidad Visual Premium",
            "description": "Tagline displayed under company name"
        },
        {
            "section": "header",
            "key": "phone",
            "value": "+54 11 6415-6306",
            "description": "Contact phone number"
        },
        {
            "section": "header",
            "key": "address",
            "value": "Av. Las Heras 3751, Palermo",
            "description": "Physical address"
        },
        {
            "section": "header",
            "key": "hours",
            "value": "Lun-Vie: 10:00-13:30 | 15:30-19:00",
            "description": "Business hours"
        },
        {
            "section": "header",
            "key": "whatsapp_url",
            "value": "https://wa.me/541164156306",
            "description": "WhatsApp contact URL"
        },
        # Info Section
        {
            "section": "info",
            "key": "mission_title",
            "value": "Calidad Visual Premium",
            "description": "Mission section title"
        },
        {
            "section": "info",
            "key": "mission_description",
            "value": "Elevar su estándar de vida, maximizando su calidad visual, proponiéndole siempre los más avanzados productos con la más alta calidad.",
            "description": "Mission description"
        },
        {
            "section": "info",
            "key": "features",
            "value": [
                {
                    "title": "Examen Visual Gratuito",
                    "description": "Evaluación completa de tu salud visual con tecnología de última generación"
                },
                {
                    "title": "Garantía Extendida",
                    "description": "Protección completa en todos nuestros productos con garantía de 2 años"
                },
                {
                    "title": "Marcas Premium",
                    "description": "Las mejores marcas internacionales con certificación de calidad"
                },
                {
                    "title": "Servicio Express",
                    "description": "Entrega rápida y servicio técnico especializado en 24-48 horas"
                }
            ],
            "description": "Service features list"
        },
        # Footer Section
        {
            "section": "footer",
            "key": "copyright_text",
            "value": "© 2024 Óptica Villalba. Todos los derechos reservados.",
            "description": "Copyright text"
        },
        {
            "section": "footer",
            "key": "services",
            "value": [
                "Lentes Recetados",
                "Gafas de Sol",
                "Lentes de Contacto",
                "Consultas Optométricas",
                "Reparaciones",
                "Ajustes Personalizados"
            ],
            "description": "Services list for footer"
        },
        {
            "section": "footer",
            "key": "social_links",
            "value": {
                "instagram": "#",
                "facebook": "#",
                "email": "info@opticavillalba.com"
            },
            "description": "Social media links"
        },
        # General Configuration
        {
            "section": "general",
            "key": "primary_color",
            "value": "#3b82f6",
            "description": "Primary brand color (blue)"
        },
        {
            "section": "general",
            "key": "secondary_color",
            "value": "#dc2626",
            "description": "Secondary brand color (red)"
        },
        {
            "section": "general",
            "key": "background_color",
            "value": "#0f172a",
            "description": "Background color (dark slate)"
        },
        {
            "section": "general",
            "key": "font_family",
            "value": "Inter",
            "description": "Primary font family"
        }
    ]
    
    created_count = 0
    for config_data in default_configs:
        # Check if already exists
        existing = await db.site_config.find_one({
            "section": config_data["section"],
            "key": config_data["key"]
        })
        
        if not existing:
            config_data["id"] = f"{config_data['section']}_{config_data['key']}_{datetime.utcnow().timestamp()}"
            config_data["updated_at"] = datetime.utcnow()
            await db.site_config.insert_one(config_data)
            created_count += 1
    
    # Log the action
    await db.admin_logs.insert_one({
        "username": current_user["username"],
        "action": "initialize_default_content",
        "details": {"created_count": created_count},
        "timestamp": datetime.utcnow()
    })
    
    return {
        "message": f"Initialized {created_count} default configurations",
        "total_configs": len(default_configs)
    }