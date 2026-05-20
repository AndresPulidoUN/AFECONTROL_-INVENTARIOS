from fastapi import APIRouter, Depends, HTTPException
from app.core.db import get_session, DATABASE_URLS
from app.core.security import get_current_user
from app.models.producto import Producto
from app.models.stock_actual import StockActual
from app.models.categoria import Categoria
from app.models.movimiento_inventario import MovimientoInventario

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard")
def admin_dashboard(current_user: dict = Depends(get_current_user)):
    if current_user.get("rol_id") != "r1":
        raise HTTPException(403, "Solo administradores")

    result = {
        "resumen": {"total_productos": 0, "total_unidades_stock": 0, "total_movimientos": 0, "sedes": 0},
        "sedes": {},
        "bajo_stock": [],
        "criticos": [],
        "recomendaciones": [],
        "por_categoria": [],
    }

    # Acumulador por categoría para gráficos
    cats_data = {}

    for sede_id in DATABASE_URLS:
        db = get_session(sede_id)
        try:
            productos = db.query(Producto).count()
            stock_items = db.query(StockActual).all()
            total_stock = sum(s.cantidad for s in stock_items)

            movimientos = db.query(MovimientoInventario).count()

            result["sedes"][sede_id] = {
                "nombre": "Ramiriquí" if sede_id == "s1" else "Tunja",
                "productos": productos,
                "items_stock": len(stock_items),
                "total_unidades": total_stock,
                "movimientos": movimientos,
            }

            # Count unique products (catalog is same across sedes)
            if not result["resumen"]["total_productos"]:
                result["resumen"]["total_productos"] = productos
            result["resumen"]["total_unidades_stock"] += total_stock
            result["resumen"]["total_movimientos"] += movimientos
            result["resumen"]["sedes"] += 1

            for s in stock_items:
                prod = db.query(Producto).filter(Producto.id == s.producto_id).first()
                nombre = f"{prod.nombre} ({prod.marca})" if prod else s.producto_id
                cat_nombre = ""
                if prod:
                    cat = db.query(Categoria).filter(Categoria.id == prod.categoria_id).first()
                    cat_nombre = cat.nombre if cat else ""

                entry = {
                    "sede_id": sede_id,
                    "sede_nombre": "Ramiriquí" if sede_id == "s1" else "Tunja",
                    "producto_id": s.producto_id,
                    "producto_nombre": nombre,
                    "categoria": cat_nombre,
                    "cantidad": s.cantidad,
                }

                if s.cantidad <= 3:
                    result["criticos"].append(entry)
                elif s.cantidad <= 5:
                    result["bajo_stock"].append(entry)

                # Acumular por categoría para gráficos
                if cat_nombre not in cats_data:
                    cats_data[cat_nombre] = {"categoria": cat_nombre, "s1": 0, "s2": 0, "total": 0}
                cats_data[cat_nombre][sede_id] += s.cantidad
                cats_data[cat_nombre]["total"] += s.cantidad
        finally:
            db.close()

    result["por_categoria"] = sorted(cats_data.values(), key=lambda x: x["total"], reverse=True)

    # Generar recomendaciones basadas en comparación entre sedes
    if len(result["sedes"]) >= 2:
        s1_stock = {s.producto_id: s for s in _get_stock("s1")}
        s2_stock = {s.producto_id: s for s in _get_stock("s2")}
        todos_ids = set(s1_stock.keys()) | set(s2_stock.keys())

        db1 = get_session("s1")
        db2 = get_session("s2")
        try:
            for pid in sorted(todos_ids):
                c1 = s1_stock.get(pid)
                c2 = s2_stock.get(pid)
                q1 = c1.cantidad if c1 else 0
                q2 = c2.cantidad if c2 else 0

                prod = db1.query(Producto).filter(Producto.id == pid).first() or \
                       db2.query(Producto).filter(Producto.id == pid).first()
                nombre = f"{prod.nombre} ({prod.marca})" if prod else pid

                # Recomendar transferencia si una sede tiene mucho más que la otra
                if q1 >= 10 and q2 <= 3 and q2 < q1:
                    sugerencia = min(q1 // 3, 5)
                    result["recomendaciones"].append({
                        "tipo": "transferencia",
                        "producto": nombre,
                        "desde": "Ramiriquí",
                        "hacia": "Tunja",
                        "cantidad_sugerida": sugerencia,
                        "motivo": f"Ramiriquí tiene {q1} uds, Tunja solo {q2}. "
                                  f"Se sugiere transferir {sugerencia} uds a Tunja.",
                    })
                elif q2 >= 10 and q1 <= 3 and q1 < q2:
                    sugerencia = min(q2 // 3, 5)
                    result["recomendaciones"].append({
                        "tipo": "transferencia",
                        "producto": nombre,
                        "desde": "Tunja",
                        "hacia": "Ramiriquí",
                        "cantidad_sugerida": sugerencia,
                        "motivo": f"Tunja tiene {q2} uds, Ramiriquí solo {q1}. "
                                  f"Se sugiere transferir {sugerencia} uds a Ramiriquí.",
                    })

                # Recomendar compra si ambas están bajas
                if q1 <= 5 and q2 <= 5:
                    result["recomendaciones"].append({
                        "tipo": "compra",
                        "producto": nombre,
                        "cantidad_sugerida": 20,
                        "motivo": f"Stock crítico en ambas sedes "
                                  f"(Ramiriquí: {q1}, Tunja: {q2}). "
                                  f"Se recomienda compra urgente de {nombre}.",
                    })
        finally:
            db1.close()
            db2.close()

    return result


def _get_stock(sede_id: str):
    db = get_session(sede_id)
    items = db.query(StockActual).all()
    db.close()
    return items
