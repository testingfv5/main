from pydantic import BaseModel, Field
from typing import Optional, Any, Dict
from datetime import datetime
import uuid

class SiteConfig(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    section: str  # "header", "hero", "info", "footer", "general"
    key: str
    value: Any  # Can store strings, objects, arrays
    description: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class SiteConfigCreate(BaseModel):
    section: str
    key: str
    value: Any
    description: Optional[str] = None

class SiteConfigUpdate(BaseModel):
    value: Any
    description: Optional[str] = None

# Predefined config structures
class HeaderConfig(BaseModel):
    company_name: str = "Óptica Villalba"
    tagline: str = "Calidad Visual Premium"
    phone: str = "+54 11 6415-6306"
    address: str = "Av. Las Heras 3751, Palermo"
    hours: str = "Lun-Vie: 10:00-13:30 | 15:30-19:00"
    whatsapp_url: str = "https://wa.me/541164156306"

class InfoConfig(BaseModel):
    mission_title: str = "Calidad Visual Premium"
    mission_description: str = "Nuestro compromiso: Elevar su estándar de vida..."
    features: List[Dict[str, str]] = []
    contact_cta_title: str = "Visitá Nuestro Local"

class FooterConfig(BaseModel):
    copyright_text: str = "© 2024 Óptica Villalba. Todos los derechos reservados."
    social_links: Dict[str, str] = {}
    additional_info: str = ""
    
class GeneralConfig(BaseModel):
    primary_color: str = "#3b82f6"  # blue-600
    secondary_color: str = "#dc2626"  # red-600
    background_color: str = "#0f172a"  # slate-900
    font_family: str = "Inter"