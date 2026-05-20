from sqlalchemy import Column, String, Text
from app.core.db import Base
import uuid

class Categoria(Base):

    __tablename__ = "categorias"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    nombre = Column(String, unique=True, nullable=False)

    descripcion = Column(Text)
