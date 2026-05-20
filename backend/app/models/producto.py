from sqlalchemy import Column, String, Text, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from app.core.db import Base
import uuid

class Producto(Base):

    __tablename__ = "productos"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    categoria_id = Column(String, ForeignKey("categorias.id"), nullable=False)

    nombre = Column(String, nullable=False)

    marca = Column(String, nullable=False)

    modelo = Column(String, nullable=False)

    referencia = Column(String)

    requiere_serial = Column(Boolean, default=False)

    descripcion = Column(Text)

    metadata_json = Column(JSONB)
