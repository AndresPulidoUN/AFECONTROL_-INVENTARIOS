import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.db import get_db, get_sede_actual
from app.core.security import get_current_user
from app.models.producto import Producto
from app.models.stock_actual import StockActual
from app.models.movimiento_inventario import MovimientoInventario
from app.models.detalle_movimiento import DetalleMovimiento
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


@router.post("/", status_code=201)
def crear_producto(
    data: ProductoCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    sede_actual: str = Depends(get_sede_actual),
):
    if current_user.get("rol_id") != "r1":
        raise HTTPException(403, "Solo administradores pueden crear productos")

    target_sedes = data.sede_ids or [sede_actual]
    prod_id = str(uuid.uuid4())

    prod = Producto(
        id=prod_id,
        categoria_id=data.categoria_id,
        nombre=data.nombre,
        marca=data.marca,
        modelo=data.modelo,
        referencia=data.referencia,
        requiere_serial=data.requiere_serial,
        descripcion=data.descripcion,
        metadata_json=data.metadata_json,
    )
    db.add(prod)
    db.flush()

    for sid in target_sedes:
        stock = StockActual(
            id=str(uuid.uuid4()),
            sede_id=sid,
            producto_id=prod_id,
            cantidad=data.stock_inicial or 0,
        )
        db.add(stock)

        if data.stock_inicial and data.stock_inicial > 0:
            mov = MovimientoInventario(
                id=str(uuid.uuid4()),
                usuario_id=current_user["id"],
                sede_origen_id=sid,
                tipo_movimiento="entrada",
                observacion=f"Creación de producto con stock inicial: {data.stock_inicial} {data.nombre} ({data.marca})",
                fecha=datetime.now(),
            )
            db.add(mov)
            db.flush()
            db.add(DetalleMovimiento(
                id=str(uuid.uuid4()),
                movimiento_id=mov.id,
                producto_id=prod_id,
                cantidad=data.stock_inicial,
            ))

    db.commit()
    return {
        "id": prod_id,
        "mensaje": f"Producto creado en {len(target_sedes)} sede(s): {', '.join(target_sedes)}",
        "sedes": target_sedes,
    }


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
