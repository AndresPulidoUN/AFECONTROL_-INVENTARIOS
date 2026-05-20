from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.db import get_db
from app.models.categoria import Categoria
from app.schemas.categoria import CategoriaCreate, CategoriaUpdate, CategoriaResponse

router = APIRouter(prefix="/categorias", tags=["Categorías"])


@router.get("/", response_model=List[CategoriaResponse])
def listar_categorias(db: Session = Depends(get_db)):
    return db.query(Categoria).all()


@router.get("/{categoria_id}", response_model=CategoriaResponse)
def obtener_categoria(categoria_id: str, db: Session = Depends(get_db)):
    cat = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not cat:
        raise HTTPException(404, "Categoría no encontrada")
    return cat


@router.post("/", response_model=CategoriaResponse, status_code=201)
def crear_categoria(data: CategoriaCreate, db: Session = Depends(get_db)):
    existe = db.query(Categoria).filter(Categoria.nombre == data.nombre).first()
    if existe:
        raise HTTPException(400, "Ya existe una categoría con ese nombre")
    cat = Categoria(**data.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.put("/{categoria_id}", response_model=CategoriaResponse)
def actualizar_categoria(categoria_id: str, data: CategoriaUpdate, db: Session = Depends(get_db)):
    cat = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not cat:
        raise HTTPException(404, "Categoría no encontrada")
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(cat, key, val)
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/{categoria_id}", status_code=204)
def eliminar_categoria(categoria_id: str, db: Session = Depends(get_db)):
    cat = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not cat:
        raise HTTPException(404, "Categoría no encontrada")
    db.delete(cat)
    db.commit()
