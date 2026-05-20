from fastapi import APIRouter, HTTPException
from app.core.db import get_all_sessions
from app.core.security import create_access_token, verify_password
from app.models.usuario import Usuario
from app.schemas.auth import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest):
    for sede_id, db in get_all_sessions().items():
        usuario = db.query(Usuario).filter(Usuario.correo == data.correo).first()
        if not usuario:
            db.close()
            continue
        if not verify_password(data.password, usuario.password_hash):
            db.close()
            raise HTTPException(401, "Credenciales inválidas")
        if not usuario.activo:
            db.close()
            raise HTTPException(403, "Usuario inactivo")

        token = create_access_token({
            "sub": usuario.id,
            "sede_id": usuario.sede_id,
            "rol_id": usuario.rol_id,
            "correo": usuario.correo,
        })

        db.close()
        return TokenResponse(
            access_token=token,
            usuario_id=usuario.id,
            nombre=usuario.nombre,
            correo=usuario.correo,
            rol_id=usuario.rol_id,
            sede_id=usuario.sede_id,
        )

    raise HTTPException(401, "Credenciales inválidas")
