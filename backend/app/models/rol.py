from sqlalchemy import Column, String
from app.core.db import Base
import uuid

class Rol(Base):

    __tablename__ = "roles"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    nombre = Column(String, unique=True, nullable=False)
