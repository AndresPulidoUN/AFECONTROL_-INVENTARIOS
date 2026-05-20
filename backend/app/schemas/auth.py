from pydantic import BaseModel
from typing import Optional


class LoginRequest(BaseModel):
    correo: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario_id: str
    nombre: str
    correo: str
    rol_id: str
    sede_id: str
