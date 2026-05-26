import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.db import get_db, get_sede_actual
from app.core.security import get_current_user
from app.models.stock_actual import StockActual
from app.models.producto import Producto
from app.models.movimiento_inventario import MovimientoInventario
from app.models.detalle_movimiento import DetalleMovimiento
from app.schemas.stock_actual import StockResponse, StockUpdate

router = APIRouter(prefix="/stock", tags=["Stock"])


@router.get("/", response_model=List[StockResponse])
def listar_stock(
    producto_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    q = db.query(StockActual)
    if current_user["rol_id"] != "r1":
        q = q.filter(StockActual.sede_id == current_user["sede_id"])
    if producto_id:
        q = q.filter(StockActual.producto_id == producto_id)
    return q.all()


@router.put("/{producto_id}", response_model=StockResponse)
def actualizar_stock(
    producto_id: str,
    data: StockUpdate,
    sede_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    sede_actual: str = Depends(get_sede_actual),
):
    q = db.query(StockActual).filter(
        StockActual.producto_id == producto_id,
    )
    if current_user["rol_id"] == "r1" and sede_id:
        q = q.filter(StockActual.sede_id == sede_id)
    elif current_user["rol_id"] != "r1":
        q = q.filter(StockActual.sede_id == current_user["sede_id"])
    stock = q.first()

    if not stock:
        target_sede = current_user["sede_id"] if current_user["rol_id"] != "r1" else sede_actual
        stock = StockActual(
            id=str(uuid.uuid4()),
            sede_id=target_sede,
            producto_id=producto_id,
            cantidad=0,
        )
        db.add(stock)
        db.flush()
        creando = True
    else:
        creando = False

    diferencia = data.cantidad - stock.cantidad

    if diferencia != 0:
        tipo = "entrada" if diferencia > 0 else "salida"
        signo = "+" if diferencia > 0 else ""

        prod = db.query(Producto).filter(Producto.id == producto_id).first()
        prod_nombre = f"{prod.nombre} ({prod.marca})" if prod else producto_id

        observacion = f"Stock inicial: {data.cantidad} {prod_nombre}" if creando else f"Ajuste manual: {signo}{diferencia} {prod_nombre}"

        mov = MovimientoInventario(
            id=str(uuid.uuid4()),
            usuario_id=current_user["id"],
            sede_origen_id=stock.sede_id,
            tipo_movimiento=tipo,
            observacion=observacion,
            fecha=datetime.now(),
        )
        db.add(mov)
        db.flush()

        obs_detalle = f"Stock inicial: 0 → {data.cantidad}" if creando else f"Stock anterior: {stock.cantidad - diferencia}, nuevo: {data.cantidad}"

        db.add(DetalleMovimiento(
            id=str(uuid.uuid4()),
            movimiento_id=mov.id,
            producto_id=producto_id,
            cantidad=abs(diferencia),
            observacion=obs_detalle,
        ))

    stock.cantidad = data.cantidad
    db.commit()
    db.refresh(stock)
    return stock
