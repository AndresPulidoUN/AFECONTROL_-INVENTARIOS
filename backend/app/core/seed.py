"""
Seeder — Puebla la base de datos única con datos iniciales realistas.

Uso:
    python -m app.core.seed                    # Solo siembra si está vacío
    python -m app.core.seed --force             # Resetea y siembra de nuevo

Requiere el clúster PostgreSQL corriendo.
"""

import sys
from datetime import datetime, timedelta
import bcrypt as _bcrypt

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.core.db import DATABASE_URL
from app.models import (
    Sede,
    Rol,
    Usuario,
    Categoria,
    Producto,
    MovimientoInventario,
    DetalleMovimiento,
    StockActual,
)

PASSWORD_HASH = _bcrypt.hashpw(b"admin123", _bcrypt.gensalt()).decode()

# ─── Datos comunes ──────────────────────────────────────────

ROLES = [
    {"id": "r1", "nombre": "admin"},
    {"id": "r2", "nombre": "usuario"},
]

CATEGORIAS = [
    {"id": "c1", "nombre": "ONT",           "descripcion": "Terminal de red óptica para fibra"},
    {"id": "c2", "nombre": "Router",        "descripcion": "Router inalámbrico para clientes residenciales"},
    {"id": "c3", "nombre": "Antena",        "descripcion": "Antena de exterior para enlace inalámbrico"},
    {"id": "c4", "nombre": "Cámara",        "descripcion": "Cámara de seguridad IP"},
    {"id": "c5", "nombre": "Switch",        "descripcion": "Switch de red administrable o no administrable"},
    {"id": "c6", "nombre": "Fuente",        "descripcion": "Fuente de poder para equipos"},
    {"id": "c7", "nombre": "Cable",         "descripcion": "Cable de red o fibra óptica"},
    {"id": "c8", "nombre": "Fibra Óptica",  "descripcion": "Componentes de fibra óptica (pigtail, patch cord)"},
]

PRODUCTOS = [
    {"id": "p1",  "categoria_id": "c1", "nombre": "ONT Huawei",        "marca": "Huawei",     "modelo": "HG8010H",        "referencia": "ONT-HW-01",    "requiere_serial": True,  "descripcion": "ONT básico 1 puerto GE para FTTH"},
    {"id": "p2",  "categoria_id": "c1", "nombre": "ONT Nokia",         "marca": "Nokia",      "modelo": "G-010G-R",       "referencia": "ONT-NK-01",    "requiere_serial": True,  "descripcion": "ONT con WiFi integrado para FTTH"},
    {"id": "p3",  "categoria_id": "c2", "nombre": "Router TP-Link",    "marca": "TP-Link",    "modelo": "Archer C80",     "referencia": "RTR-TP-01",    "requiere_serial": True,  "descripcion": "Router WiFi AC1900 doble banda"},
    {"id": "p4",  "categoria_id": "c2", "nombre": "Router MikroTik",   "marca": "MikroTik",   "modelo": "RB951Ui-2HnD",   "referencia": "RTR-MK-01",    "requiere_serial": True,  "descripcion": "Router inalámbrico 2.4 GHz 5 puertos"},
    {"id": "p5",  "categoria_id": "c3", "nombre": "Antena Ubiquiti",   "marca": "Ubiquiti",   "modelo": "LiteBeam 5AC",   "referencia": "ANT-UB-01",    "requiere_serial": True,  "descripcion": "Antena sectorial 5 GHz para enlace PtP"},
    {"id": "p6",  "categoria_id": "c3", "nombre": "Antena MikroTik",   "marca": "MikroTik",   "modelo": "SXTsq 5AC",      "referencia": "ANT-MK-01",    "requiere_serial": True,  "descripcion": "Antena integrada 5 GHz para CPE"},
    {"id": "p7",  "categoria_id": "c4", "nombre": "Cámara Hikvision",  "marca": "Hikvision",  "modelo": "DS-2CD1023G0-I",  "referencia": "CAM-HK-01",    "requiere_serial": True,  "descripcion": "Cámara IP fija 2 MP EXIR"},
    {"id": "p8",  "categoria_id": "c4", "nombre": "Cámara Dahua",      "marca": "Dahua",      "modelo": "IPC-HFW1230S",    "referencia": "CAM-DH-01",    "requiere_serial": True,  "descripcion": "Cámara IP bala 2 MP"},
    {"id": "p9",  "categoria_id": "c5", "nombre": "Switch Cisco",      "marca": "Cisco",      "modelo": "SG250-10",        "referencia": "SW-CS-01",     "requiere_serial": True,  "descripcion": "Switch administrable 10 puertos Gigabit"},
    {"id": "p10", "categoria_id": "c5", "nombre": "Switch TP-Link",    "marca": "TP-Link",    "modelo": "TL-SG108E",       "referencia": "SW-TP-01",     "requiere_serial": False, "descripcion": "Switch no administrable 8 puertos Gigabit"},
    {"id": "p11", "categoria_id": "c6", "nombre": "Fuente 12V 2A",     "marca": "Genérica",   "modelo": "FY-1202000",      "referencia": "FNT-GN-01",    "requiere_serial": False, "descripcion": "Fuente de poder 12V 2A para ONT/router"},
    {"id": "p12", "categoria_id": "c6", "nombre": "Fuente POE 24V",    "marca": "TP-Link",    "modelo": "TL-POE150S",      "referencia": "FNT-TP-01",    "requiere_serial": True,  "descripcion": "Inyector PoE 24V 1A para antenas"},
    {"id": "p13", "categoria_id": "c7", "nombre": "Cable UTP Cat5e",   "marca": "Genérico",   "modelo": "UTP-CAT5E",       "referencia": "CBL-GN-01",    "requiere_serial": False, "descripcion": "Cable de red UTP Cat5e metro"},
    {"id": "p14", "categoria_id": "c7", "nombre": "Cable UTP Cat6",    "marca": "Genérico",   "modelo": "UTP-CAT6",        "referencia": "CBL-GN-02",    "requiere_serial": False, "descripcion": "Cable de red UTP Cat6 metro"},
    {"id": "p15", "categoria_id": "c8", "nombre": "Pigtail SC/APC",    "marca": "Genérico",   "modelo": "SM-1M-SC-APC",    "referencia": "FBR-GN-01",    "requiere_serial": False, "descripcion": "Pigtail fibra óptica monomodo SC/APC 1m"},
    {"id": "p16", "categoria_id": "c8", "nombre": "Patch Cord SC/APC", "marca": "Genérico",   "modelo": "SM-2M-SC-APC",    "referencia": "FBR-GN-02",    "requiere_serial": False, "descripcion": "Patch cord fibra óptica SC/APC 2m"},
    {"id": "p17", "categoria_id": "c2", "nombre": "Router Xiaomi",     "marca": "Xiaomi",     "modelo": "AX3000T",         "referencia": "RTR-XM-01",    "requiere_serial": True,  "descripcion": "Router WiFi 6 AX3000"},
    {"id": "p18", "categoria_id": "c3", "nombre": "Antena Huawei",     "marca": "Huawei",     "modelo": "LTE-CPE-B311",    "referencia": "ANT-HW-01",    "requiere_serial": True,  "descripcion": "CPE LTE para cobertura inalámbrica"},
    {"id": "p19", "categoria_id": "c4", "nombre": "Cámara TP-Link",    "marca": "TP-Link",    "modelo": "Tapo C200",        "referencia": "CAM-TP-01",    "requiere_serial": True,  "descripcion": "Cámara IP WiFi domo 2 MP"},
]

SEDES = [
    {"id": "s1", "nombre": "Ramiriquí", "municipio": "Ramiriquí", "direccion": "Carrera 5 # 4-20, Centro"},
    {"id": "s2", "nombre": "Tunja",     "municipio": "Tunja",     "direccion": "Calle 19 # 9-35, Centro"},
]

USUARIOS = [
    {"id": "u1", "sede_id": "s1", "rol_id": "r1", "nombre": "Carlos Martínez", "correo": "carlos@isp.com",     "password_hash": PASSWORD_HASH, "activo": True},
    {"id": "u2", "sede_id": "s1", "rol_id": "r2", "nombre": "María López",     "correo": "maria@isp.com",      "password_hash": PASSWORD_HASH, "activo": True},
    {"id": "u3", "sede_id": "s2", "rol_id": "r2", "nombre": "Pedro Gómez",     "correo": "pedro@isp.com",      "password_hash": PASSWORD_HASH, "activo": True},
    {"id": "u4", "sede_id": "s2", "rol_id": "r1", "nombre": "Ana Rodríguez",   "correo": "ana@isp.com",        "password_hash": PASSWORD_HASH, "activo": True},
]

STOCK = [
    # Ramiriquí (s1)
    {"sede_id": "s1", "producto_id": "p1",  "cantidad": 25},
    {"sede_id": "s1", "producto_id": "p2",  "cantidad": 12},
    {"sede_id": "s1", "producto_id": "p3",  "cantidad": 8},
    {"sede_id": "s1", "producto_id": "p4",  "cantidad": 3},
    {"sede_id": "s1", "producto_id": "p5",  "cantidad": 10},
    {"sede_id": "s1", "producto_id": "p6",  "cantidad": 15},
    {"sede_id": "s1", "producto_id": "p7",  "cantidad": 4},
    {"sede_id": "s1", "producto_id": "p8",  "cantidad": 6},
    {"sede_id": "s1", "producto_id": "p9",  "cantidad": 2},
    {"sede_id": "s1", "producto_id": "p10", "cantidad": 20},
    {"sede_id": "s1", "producto_id": "p11", "cantidad": 50},
    {"sede_id": "s1", "producto_id": "p12", "cantidad": 18},
    {"sede_id": "s1", "producto_id": "p13", "cantidad": 200},
    {"sede_id": "s1", "producto_id": "p14", "cantidad": 100},
    {"sede_id": "s1", "producto_id": "p15", "cantidad": 60},
    {"sede_id": "s1", "producto_id": "p16", "cantidad": 40},
    {"sede_id": "s1", "producto_id": "p17", "cantidad": 5},
    {"sede_id": "s1", "producto_id": "p18", "cantidad": 7},
    {"sede_id": "s1", "producto_id": "p19", "cantidad": 3},
    # Tunja (s2)
    {"sede_id": "s2", "producto_id": "p1",  "cantidad": 30},
    {"sede_id": "s2", "producto_id": "p2",  "cantidad": 10},
    {"sede_id": "s2", "producto_id": "p3",  "cantidad": 15},
    {"sede_id": "s2", "producto_id": "p4",  "cantidad": 5},
    {"sede_id": "s2", "producto_id": "p5",  "cantidad": 8},
    {"sede_id": "s2", "producto_id": "p6",  "cantidad": 20},
    {"sede_id": "s2", "producto_id": "p7",  "cantidad": 2},
    {"sede_id": "s2", "producto_id": "p8",  "cantidad": 9},
    {"sede_id": "s2", "producto_id": "p9",  "cantidad": 1},
    {"sede_id": "s2", "producto_id": "p10", "cantidad": 15},
    {"sede_id": "s2", "producto_id": "p11", "cantidad": 45},
    {"sede_id": "s2", "producto_id": "p12", "cantidad": 12},
    {"sede_id": "s2", "producto_id": "p13", "cantidad": 180},
    {"sede_id": "s2", "producto_id": "p14", "cantidad": 80},
    {"sede_id": "s2", "producto_id": "p15", "cantidad": 55},
    {"sede_id": "s2", "producto_id": "p16", "cantidad": 35},
    {"sede_id": "s2", "producto_id": "p17", "cantidad": 8},
    {"sede_id": "s2", "producto_id": "p18", "cantidad": 4},
    {"sede_id": "s2", "producto_id": "p19", "cantidad": 1},
]


def seed_database(session):
    """Puebla la base de datos con datos iniciales si está vacía."""
    if session.query(Sede).count() > 0:
        print("  Datos ya existen, saltando seed.")
        return

    print("  Insertando roles...")
    for r in ROLES:
        session.add(Rol(**r))

    print("  Insertando sedes...")
    for s in SEDES:
        session.add(Sede(**s))

    print("  Insertando categorías...")
    for c in CATEGORIAS:
        session.add(Categoria(**c))

    print("  Insertando productos...")
    for p in PRODUCTOS:
        session.add(Producto(**p))

    session.flush()

    print("  Insertando usuarios...")
    for u in USUARIOS:
        session.add(Usuario(**u))

    session.flush()

    print("  Insertando stock inicial...")
    for s in STOCK:
        session.add(StockActual(
            id=f"st_{s['sede_id']}_{s['producto_id']}",
            sede_id=s["sede_id"],
            producto_id=s["producto_id"],
            cantidad=s["cantidad"],
        ))

    session.flush()

    print("  Creando movimientos de entrada iniciales...")
    fecha_base = datetime.now() - timedelta(days=7)
    for i, s in enumerate(STOCK):
        mov = MovimientoInventario(
            id=f"mov_ini_{i}",
            usuario_id="u1" if s["sede_id"] == "s1" else "u4",
            sede_origen_id=s["sede_id"],
            tipo_movimiento="entrada",
            observacion=f"Inventario inicial {s['sede_id']}",
            fecha=fecha_base + timedelta(hours=i),
        )
        session.add(mov)
        session.flush()
        session.add(DetalleMovimiento(
            id=f"det_ini_{i}",
            movimiento_id=mov.id,
            producto_id=s["producto_id"],
            cantidad=s["cantidad"],
        ))

    session.commit()


def run():
    engine = create_engine(DATABASE_URL)

    if "--force" in sys.argv:
        print("  Modo --force: eliminando tablas...")
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        print("  Tablas recreadas.")

    Base.metadata.create_all(bind=engine)

    session_factory = sessionmaker(bind=engine)
    session = session_factory()

    print(f"Poblando base de datos ({DATABASE_URL})...")
    seed_database(session)
    session.close()
    print("Seed completado.")


if __name__ == "__main__":
    run()
