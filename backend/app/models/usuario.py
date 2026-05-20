from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, func
from app.core.db import Base
import uuid

class Usuario(Base):

    __tablename__ = "usuarios"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    sede_id = Column(String, ForeignKey("sedes.id"), nullable=False)

    rol_id = Column(String, ForeignKey("roles.id"), nullable=False)

    nombre = Column(String, nullable=False)

    correo = Column(String, unique=True, nullable=False)

    password_hash = Column(String, nullable=False)

    activo = Column(Boolean, default=True)

    created_at = Column(DateTime, server_default=func.now())
