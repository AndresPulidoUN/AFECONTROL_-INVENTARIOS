from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from fastapi import Depends
from app.core.db import get_db
from app.core.security import create_access_token, verify_password
from app.models.usuario import Usuario
from app.schemas.auth import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.correo == data.correo).first()
    if not usuario:
        raise HTTPException(401, "Credenciales inválidas")
    if not verify_password(data.password, usuario.password_hash):
        raise HTTPException(401, "Credenciales inválidas")
    if not usuario.activo:
        raise HTTPException(403, "Usuario inactivo")

    token = create_access_token({
        "sub": usuario.id,
        "sede_id": usuario.sede_id,
        "rol_id": usuario.rol_id,
        "correo": usuario.correo,
    })

    return TokenResponse(
        access_token=token,
        usuario_id=usuario.id,
        nombre=usuario.nombre,
        correo=usuario.correo,
        rol_id=usuario.rol_id,
        sede_id=usuario.sede_id,
    )
