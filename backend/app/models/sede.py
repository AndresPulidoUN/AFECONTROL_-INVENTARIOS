from sqlalchemy import Column, String
from app.core.db import Base
import uuid

class Sede(Base):

    __tablename__ = "sedes"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    nombre = Column(String, unique=True, nullable=False)

    municipio = Column(String, nullable=False)

    direccion = Column(String)
