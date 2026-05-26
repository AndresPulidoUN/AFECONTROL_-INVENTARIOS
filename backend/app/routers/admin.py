from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.producto import Producto
from app.models.stock_actual import StockActual
from app.models.categoria import Categoria
from app.models.movimiento_inventario import MovimientoInventario

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("rol_id") != "r1":
        raise HTTPException(403, "Solo administradores")

    total_productos = db.query(Producto).count()
    stock_items = db.query(StockActual).all()
    total_movimientos = db.query(MovimientoInventario).count()
    total_unidades = sum(s.cantidad for s in stock_items)

    result = {
        "resumen": {
            "total_productos": total_productos,
            "total_unidades_stock": total_unidades,
            "total_movimientos": total_movimientos,
            "sedes": 2,
        },
        "sedes": {},
        "bajo_stock": [],
        "criticos": [],
        "recomendaciones": [],
        "por_categoria": [],
    }

    cats_data = {}
    productos_cache = {}

    for sede_id in ["s1", "s2"]:
        sede_stock = [s for s in stock_items if s.sede_id == sede_id]
        sede_total = sum(s.cantidad for s in sede_stock)

        result["sedes"][sede_id] = {
            "nombre": "Ramiriquí" if sede_id == "s1" else "Tunja",
            "productos": total_productos,
            "items_stock": len(sede_stock),
            "total_unidades": sede_total,
            "movimientos": total_movimientos,
        }

        for s in sede_stock:
            if s.producto_id not in productos_cache:
                prod = db.query(Producto).filter(Producto.id == s.producto_id).first()
                cat = db.query(Categoria).filter(Categoria.id == prod.categoria_id).first() if prod else None
                productos_cache[s.producto_id] = {
                    "nombre": f"{prod.nombre} ({prod.marca})" if prod else s.producto_id,
                    "categoria": cat.nombre if cat else "",
                }
            pinfo = productos_cache[s.producto_id]

            entry = {
                "sede_id": sede_id,
                "sede_nombre": "Ramiriquí" if sede_id == "s1" else "Tunja",
                "producto_id": s.producto_id,
                "producto_nombre": pinfo["nombre"],
                "categoria": pinfo["categoria"],
                "cantidad": s.cantidad,
            }

            if s.cantidad <= 3:
                result["criticos"].append(entry)
            elif s.cantidad <= 5:
                result["bajo_stock"].append(entry)

            cat = pinfo["categoria"]
            if cat not in cats_data:
                cats_data[cat] = {"categoria": cat, "s1": 0, "s2": 0, "total": 0}
            cats_data[cat][sede_id] += s.cantidad
            cats_data[cat]["total"] += s.cantidad

    result["por_categoria"] = sorted(cats_data.values(), key=lambda x: x["total"], reverse=True)

    s1_stock = {s.producto_id: s for s in stock_items if s.sede_id == "s1"}
    s2_stock = {s.producto_id: s for s in stock_items if s.sede_id == "s2"}
    todos_ids = set(s1_stock.keys()) | set(s2_stock.keys())

    for pid in sorted(todos_ids):
        q1 = s1_stock.get(pid).cantidad if s1_stock.get(pid) else 0
        q2 = s2_stock.get(pid).cantidad if s2_stock.get(pid) else 0
        pinfo = productos_cache.get(pid, {"nombre": pid})

        if q1 >= 10 and q2 <= 3:
            s = min(q1 // 3, 5)
            result["recomendaciones"].append({
                "tipo": "transferencia", "producto": pinfo["nombre"],
                "desde": "Ramiriquí", "hacia": "Tunja",
                "cantidad_sugerida": s,
                "motivo": f"Ramiriquí tiene {q1} uds, Tunja solo {q2}. Se sugiere transferir {s} uds a Tunja.",
            })
        elif q2 >= 10 and q1 <= 3:
            s = min(q2 // 3, 5)
            result["recomendaciones"].append({
                "tipo": "transferencia", "producto": pinfo["nombre"],
                "desde": "Tunja", "hacia": "Ramiriquí",
                "cantidad_sugerida": s,
                "motivo": f"Tunja tiene {q2} uds, Ramiriquí solo {q1}. Se sugiere transferir {s} uds a Ramiriquí.",
            })

        if q1 <= 5 and q2 <= 5:
            result["recomendaciones"].append({
                "tipo": "compra", "producto": pinfo["nombre"],
                "cantidad_sugerida": 20,
                "motivo": f"Stock crítico en ambas sedes (Ramiriquí: {q1}, Tunja: {q2}). Se recomienda compra urgente.",
            })

    return result
