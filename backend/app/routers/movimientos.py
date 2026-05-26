import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.db import get_db, get_sede_actual
from app.core.security import get_current_user
from app.models.movimiento_inventario import MovimientoInventario
from app.models.detalle_movimiento import DetalleMovimiento
from app.models.stock_actual import StockActual
from app.schemas.movimiento import (
    MovimientoCreate,
    MovimientoResponse,
    DetalleMovimientoResponse,
)

router = APIRouter(prefix="/movimientos", tags=["Movimientos"])


def _ajustar_stock(db: Session, sede_id: str, producto_id: str, cantidad: int):
    stock = db.query(StockActual).filter(
        StockActual.sede_id == sede_id,
        StockActual.producto_id == producto_id,
    ).first()
    if not stock:
        stock = StockActual(
            id=str(uuid.uuid4()),
            sede_id=sede_id,
            producto_id=producto_id,
            cantidad=0,
        )
        db.add(stock)
        db.flush()
    stock.cantidad += cantidad


@router.get("/", response_model=List[MovimientoResponse])
def listar_movimientos(
    tipo: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(MovimientoInventario)
    if tipo:
        q = q.filter(MovimientoInventario.tipo_movimiento == tipo)
    return q.order_by(MovimientoInventario.fecha.desc()).all()


@router.get("/{movimiento_id}", response_model=MovimientoResponse)
def obtener_movimiento(
    movimiento_id: str,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    mov = db.query(MovimientoInventario).filter(
        MovimientoInventario.id == movimiento_id
    ).first()
    if not mov:
        raise HTTPException(404, "Movimiento no encontrado")
    return mov


@router.get("/{movimiento_id}/detalles", response_model=List[DetalleMovimientoResponse])
def detalles_de_movimiento(
    movimiento_id: str,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    mov = db.query(MovimientoInventario).filter(
        MovimientoInventario.id == movimiento_id
    ).first()
    if not mov:
        raise HTTPException(404, "Movimiento no encontrado")
    return db.query(DetalleMovimiento).filter(
        DetalleMovimiento.movimiento_id == movimiento_id
    ).all()


@router.post("/", response_model=MovimientoResponse, status_code=201)
def crear_movimiento(
    data: MovimientoCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    sede_actual: str = Depends(get_sede_actual),
):
    if data.tipo_movimiento not in ("entrada", "salida", "transferencia"):
        raise HTTPException(400, "Tipo de movimiento inválido. Use: entrada, salida, transferencia")

    mov = MovimientoInventario(
        id=str(uuid.uuid4()),
        usuario_id=current_user["id"],
        sede_origen_id=sede_actual,
        sede_destino_id=data.sede_destino_id,
        tipo_movimiento=data.tipo_movimiento,
        observacion=data.observacion,
        fecha=datetime.now(),
    )
    db.add(mov)
    db.flush()

    for det in data.detalles:
        db.add(DetalleMovimiento(
            id=str(uuid.uuid4()),
            movimiento_id=mov.id,
            producto_id=det.producto_id,
            cantidad=det.cantidad,
            serial=det.serial,
            observacion=det.observacion,
        ))

        if data.tipo_movimiento == "entrada":
            _ajustar_stock(db, sede_actual, det.producto_id, det.cantidad)
        elif data.tipo_movimiento == "salida":
            _ajustar_stock(db, sede_actual, det.producto_id, -det.cantidad)
        elif data.tipo_movimiento == "transferencia":
            _ajustar_stock(db, sede_actual, det.producto_id, -det.cantidad)
            if data.sede_destino_id:
                _ajustar_stock(db, data.sede_destino_id, det.producto_id, det.cantidad)

    db.commit()
    db.refresh(mov)
    return mov
