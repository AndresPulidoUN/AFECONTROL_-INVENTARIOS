from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class StockResponse(BaseModel):
    id: str
    sede_id: str
    producto_id: str
    cantidad: int
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class StockUpdate(BaseModel):
    cantidad: int
