from pydantic import BaseModel
from typing import Optional, Any, List


class ProductoBase(BaseModel):
    categoria_id: str
    nombre: str
    marca: str
    modelo: str
    referencia: Optional[str] = None
    requiere_serial: bool = False
    descripcion: Optional[str] = None
    metadata_json: Optional[Any] = None


class ProductoCreate(ProductoBase):
    sede_ids: Optional[List[str]] = None
    stock_inicial: Optional[int] = 0


class ProductoUpdate(BaseModel):
    categoria_id: Optional[str] = None
    nombre: Optional[str] = None
    marca: Optional[str] = None
    modelo: Optional[str] = None
    referencia: Optional[str] = None
    requiere_serial: Optional[bool] = None
    descripcion: Optional[str] = None
    metadata_json: Optional[Any] = None


class ProductoResponse(ProductoBase):
    id: str

    model_config = {"from_attributes": True}
