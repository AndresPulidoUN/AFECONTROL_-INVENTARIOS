from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UsuarioBase(BaseModel):
    sede_id: str
    rol_id: str
    nombre: str
    correo: str
    activo: bool = True


class UsuarioCreate(UsuarioBase):
    password: str


class UsuarioUpdate(BaseModel):
    rol_id: Optional[str] = None
    nombre: Optional[str] = None
    correo: Optional[str] = None
    activo: Optional[bool] = None
    password: Optional[str] = None


class UsuarioResponse(UsuarioBase):
    id: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
