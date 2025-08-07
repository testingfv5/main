from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class Brand(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    logo_url: Optional[str] = None
    color: str = "#3b82f6"  # Hex color
    is_active: bool = True
    order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class BrandCreate(BaseModel):
    name: str
    logo_url: Optional[str] = None
    color: str = "#3b82f6"
    is_active: bool = True
    order: int = 0

class BrandUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None
    order: Optional[int] = None