import os
from fastapi import Depends, Header
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session

from app.core.security import get_current_user

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://admin:admin123@localhost:5432/isp_inventarios"
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_size=10, max_overflow=20)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_sede_actual(
    current_user: dict = Depends(get_current_user),
    sede_db: str = Header(None),
) -> str:
    if current_user["rol_id"] == "r1" and sede_db is not None:
        return sede_db
    return current_user["sede_id"]


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
    print("  ✓ Tablas creadas/verificadas")
