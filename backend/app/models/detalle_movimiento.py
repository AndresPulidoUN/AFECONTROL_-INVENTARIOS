from sqlalchemy import Column, String, Integer, Text, ForeignKey
from app.core.db import Base
import uuid

class DetalleMovimiento(Base):

    __tablename__ = "detalle_movimiento"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    movimiento_id = Column(String, ForeignKey("movimientos_inventario.id"), nullable=False)

    producto_id = Column(String, ForeignKey("productos.id"), nullable=False)

    cantidad = Column(Integer, nullable=False)

    serial = Column(String)

    observacion = Column(Text)
