from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.db import get_db
from app.core.security import get_current_user
from app.models.stock_actual import StockActual
from app.models.producto import Producto
from app.schemas.stock_actual import StockResponse, StockUpdate

router = APIRouter(prefix="/stock", tags=["Stock"])


@router.get("/", response_model=List[StockResponse])
def listar_stock(
    producto_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(StockActual)
    if producto_id:
        q = q.filter(StockActual.producto_id == producto_id)
    return q.all()


@router.get("/{sede_id}", response_model=List[StockResponse])
def stock_por_sede(
    sede_id: str,
    producto_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(StockActual).filter(StockActual.sede_id == sede_id)
    if producto_id:
        q = q.filter(StockActual.producto_id == producto_id)
    return q.all()


@router.put("/{producto_id}", response_model=StockResponse)
def actualizar_stock(
    producto_id: str,
    data: StockUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    stock = db.query(StockActual).filter(
        StockActual.sede_id == current_user["sede_id"],
        StockActual.producto_id == producto_id,
    ).first()
    if not stock:
        raise HTTPException(404, "Producto no encontrado en stock")
    stock.cantidad = data.cantidad
    db.commit()
    db.refresh(stock)
    return stock
