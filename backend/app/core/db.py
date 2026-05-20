from fastapi import Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session

from app.core.security import get_current_user

DATABASE_URLS = {
    "s1": "postgresql://admin:admin123@localhost:5433/isp_sede1",
    "s2": "postgresql://admin:admin123@localhost:5434/isp_sede2",
}

_engines = {}
_sessionmakers = {}

Base = declarative_base()


def _ensure(sede_id: str):
    if sede_id not in DATABASE_URLS:
        raise ValueError(f"Sede inválida: {sede_id}")
    if sede_id not in _engines:
        _engines[sede_id] = create_engine(
            DATABASE_URLS[sede_id],
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
        )
        _sessionmakers[sede_id] = sessionmaker(autocommit=False, autoflush=False, bind=_engines[sede_id])


def get_session(sede_id: str) -> Session:
    _ensure(sede_id)
    return _sessionmakers[sede_id]()


def get_all_sessions():
    return {sid: get_session(sid) for sid in DATABASE_URLS}


def get_db(current_user: dict = Depends(get_current_user)) -> Session:
    """FastAPI dependency — conecta a la BD de la sede del usuario autenticado."""
    session = get_session(current_user["sede_id"])
    try:
        yield session
    finally:
        session.close()


def init_db():
    """Crea todas las tablas en AMBAS bases de datos."""
    for sede_id, url in DATABASE_URLS.items():
        engine = create_engine(url, pool_pre_ping=True)
        Base.metadata.create_all(bind=engine)
        print(f"  ✓ Tablas creadas/verificadas en sede {sede_id}")
