from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func
from app.core.db import Base
import uuid

class MovimientoInventario(Base):

    __tablename__ = "movimientos_inventario"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    usuario_id = Column(String, nullable=False)

    sede_origen_id = Column(String, ForeignKey("sedes.id"), nullable=False)

    sede_destino_id = Column(String, ForeignKey("sedes.id"))

    tipo_movimiento = Column(String, nullable=False)

    observacion = Column(Text)

    fecha = Column(DateTime, server_default=func.now())
