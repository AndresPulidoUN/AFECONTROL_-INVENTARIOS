from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, UniqueConstraint, func
from app.core.db import Base
import uuid

class StockActual(Base):

    __tablename__ = "stock_actual"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    sede_id = Column(String, ForeignKey("sedes.id"), nullable=False)

    producto_id = Column(String, ForeignKey("productos.id"), nullable=False)

    cantidad = Column(Integer, nullable=False)

    updated_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("sede_id", "producto_id", name="uq_sede_producto"),
    )
