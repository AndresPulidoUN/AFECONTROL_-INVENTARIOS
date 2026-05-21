from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.sede import Sede
from app.schemas.sede import SedeCreate, SedeUpdate, SedeResponse

router = APIRouter(prefix="/sedes", tags=["Sedes"])


def _es_admin(current_user: dict):
    if current_user.get("rol_id") != "r1":
        raise HTTPException(403, "Solo administradores")


@router.get("/", response_model=List[SedeResponse])
def listar_sedes(db: Session = Depends(get_db)):
    return db.query(Sede).all()


@router.get("/{sede_id}", response_model=SedeResponse)
def obtener_sede(sede_id: str, db: Session = Depends(get_db)):
    sede = db.query(Sede).filter(Sede.id == sede_id).first()
    if not sede:
        raise HTTPException(404, "Sede no encontrada")
    return sede


@router.post("/", response_model=SedeResponse, status_code=201)
def crear_sede(
    data: SedeCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    _es_admin(current_user)
    existe = db.query(Sede).filter(Sede.nombre == data.nombre).first()
    if existe:
        raise HTTPException(400, "Ya existe una sede con ese nombre")
    sede = Sede(**data.model_dump())
    db.add(sede)
    db.commit()
    db.refresh(sede)
    return sede


@router.put("/{sede_id}", response_model=SedeResponse)
def actualizar_sede(
    sede_id: str,
    data: SedeUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    _es_admin(current_user)
    sede = db.query(Sede).filter(Sede.id == sede_id).first()
    if not sede:
        raise HTTPException(404, "Sede no encontrada")
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(sede, key, val)
    db.commit()
    db.refresh(sede)
    return sede


@router.delete("/{sede_id}", status_code=204)
def eliminar_sede(
    sede_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    _es_admin(current_user)
    sede = db.query(Sede).filter(Sede.id == sede_id).first()
    if not sede:
        raise HTTPException(404, "Sede no encontrada")
    db.delete(sede)
    db.commit()
