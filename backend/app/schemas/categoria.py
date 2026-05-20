from pydantic import BaseModel
from typing import Optional


class CategoriaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None


class CategoriaResponse(CategoriaBase):
    id: str

    model_config = {"from_attributes": True}
