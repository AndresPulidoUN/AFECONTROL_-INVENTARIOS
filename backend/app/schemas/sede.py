from pydantic import BaseModel
from typing import Optional


class SedeBase(BaseModel):
    nombre: str
    municipio: str
    direccion: Optional[str] = None


class SedeCreate(SedeBase):
    pass


class SedeUpdate(BaseModel):
    nombre: Optional[str] = None
    municipio: Optional[str] = None
    direccion: Optional[str] = None


class SedeResponse(SedeBase):
    id: str

    model_config = {"from_attributes": True}
