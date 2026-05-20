from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class DetalleMovimientoCreate(BaseModel):
    producto_id: str
    cantidad: int
    serial: Optional[str] = None
    observacion: Optional[str] = None


class DetalleMovimientoResponse(BaseModel):
    id: str
    movimiento_id: str
    producto_id: str
    cantidad: int
    serial: Optional[str] = None
    observacion: Optional[str] = None

    model_config = {"from_attributes": True}


class MovimientoCreate(BaseModel):
    tipo_movimiento: str
    sede_destino_id: Optional[str] = None
    observacion: Optional[str] = None
    detalles: List[DetalleMovimientoCreate]


class MovimientoResponse(BaseModel):
    id: str
    usuario_id: str
    sede_origen_id: str
    sede_destino_id: Optional[str] = None
    tipo_movimiento: str
    observacion: Optional[str] = None
    fecha: Optional[datetime] = None

    model_config = {"from_attributes": True}
