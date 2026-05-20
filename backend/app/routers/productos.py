from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.producto import Producto
from app.schemas.producto import ProductoCreate, ProductoUpdate, ProductoResponse

router = APIRouter(prefix="/productos", tags=["Productos"])


@router.get("/", response_model=List[ProductoResponse])
def listar_productos(
    categoria_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(Producto)
    if categoria_id:
        q = q.filter(Producto.categoria_id == categoria_id)
    return q.all()


@router.get("/{producto_id}", response_model=ProductoResponse)
def obtener_producto(
    producto_id: str,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    prod = db.query(Producto).filter(Producto.id == producto_id).first()
    if not prod:
        raise HTTPException(404, "Producto no encontrado")
    return prod


@router.post("/", response_model=ProductoResponse, status_code=201)
def crear_producto(
    data: ProductoCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("rol_id") != "r1":
        raise HTTPException(403, "Solo administradores pueden crear productos")
    prod = Producto(**data.model_dump())
    db.add(prod)
    db.commit()
    db.refresh(prod)
    return prod


@router.put("/{producto_id}", response_model=ProductoResponse)
def actualizar_producto(
    producto_id: str,
    data: ProductoUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("rol_id") != "r1":
        raise HTTPException(403, "Solo administradores pueden modificar productos")
    prod = db.query(Producto).filter(Producto.id == producto_id).first()
    if not prod:
        raise HTTPException(404, "Producto no encontrado")
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(prod, key, val)
    db.commit()
    db.refresh(prod)
    return prod


@router.delete("/{producto_id}", status_code=204)
def eliminar_producto(
    producto_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("rol_id") != "r1":
        raise HTTPException(403, "Solo administradores pueden eliminar productos")
    prod = db.query(Producto).filter(Producto.id == producto_id).first()
    if not prod:
        raise HTTPException(404, "Producto no encontrado")
    db.delete(prod)
    db.commit()
