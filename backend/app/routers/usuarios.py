from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.db import get_db
from app.core.security import hash_password, get_current_user
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioResponse

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.get("/", response_model=List[UsuarioResponse])
def listar_usuarios(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return db.query(Usuario).all()


@router.get("/{usuario_id}", response_model=UsuarioResponse)
def obtener_usuario(
    usuario_id: str,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(404, "Usuario no encontrado")
    return usuario


@router.post("/", response_model=UsuarioResponse, status_code=201)
def crear_usuario(
    data: UsuarioCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    existe = db.query(Usuario).filter(Usuario.correo == data.correo).first()
    if existe:
        raise HTTPException(400, "Ya existe un usuario con ese correo")
    usuario = Usuario(
        sede_id=data.sede_id,
        rol_id=data.rol_id,
        nombre=data.nombre,
        correo=data.correo,
        activo=data.activo,
        password_hash=hash_password(data.password),
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.put("/{usuario_id}", response_model=UsuarioResponse)
def actualizar_usuario(
    usuario_id: str,
    data: UsuarioUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(404, "Usuario no encontrado")
    update_data = data.model_dump(exclude_unset=True)
    if "password" in update_data:
        update_data["password_hash"] = hash_password(update_data.pop("password"))
    for key, val in update_data.items():
        setattr(usuario, key, val)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.delete("/{usuario_id}", status_code=204)
def eliminar_usuario(
    usuario_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user["id"] == usuario_id:
        raise HTTPException(400, "No puedes eliminarte a ti mismo")
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(404, "Usuario no encontrado")
    db.delete(usuario)
    db.commit()
