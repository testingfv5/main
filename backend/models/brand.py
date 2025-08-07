from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class Brand(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    color: str  # Hex color
    text_color: str = "#FFFFFF"
    description: str
    is_active: bool = True
    order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class BrandCreate(BaseModel):
    name: str
    color: str
    text_color: str = "#FFFFFF"
    description: str
    order: int = 0

class BrandUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    text_color: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    order: Optional[int] = None