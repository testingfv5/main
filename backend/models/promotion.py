from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class Promotion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    discount: str
    type: str  # "Promoción Especial", "Oferta Diaria", etc.
    description: str
    features: List[str] = []
    image_url: Optional[str] = None
    is_active: bool = True
    start_date: datetime
    end_date: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class PromotionCreate(BaseModel):
    title: str
    discount: str
    type: str
    description: str
    features: List[str] = []
    start_date: datetime
    end_date: datetime

class PromotionUpdate(BaseModel):
    title: Optional[str] = None
    discount: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    features: Optional[List[str]] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None