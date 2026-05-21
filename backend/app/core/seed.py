"""
Seeder — Puebla ambas bases de datos con datos iniciales realistas.

Uso:
    python -m app.core.seed                    # Solo siembra si está vacío
    python -m app.core.seed --force             # Resetea y siembra de nuevo

Requiere los contenedores PostgreSQL corriendo.
"""

import sys
import uuid
from datetime import datetime, timedelta
import bcrypt as _bcrypt

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.core.db import DATABASE_URLS
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

# ---------------------------------------------------------------------------
# Datos comunes  (se siembran idénticos en ambas sedes)
# ---------------------------------------------------------------------------
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
    # ONTs
    {"id": "p1",  "categoria_id": "c1", "nombre": "ONT Huawei HG8010H",
     "marca": "Huawei", "modelo": "HG8010H", "referencia": "HG8010H-V2",
     "requiere_serial": True,  "descripcion": "ONT GPON 1 puerto Ethernet Gigabit",
     "metadata_json": {"puertos": 1, "tipo": "GPON", "wifi": False}},
    {"id": "p2",  "categoria_id": "c1", "nombre": "ONT Nokia G-010G-P",
     "marca": "Nokia", "modelo": "G-010G-P", "referencia": "3FE48243AD",
     "requiere_serial": True,  "descripcion": "ONT GPON con WiFi integrado",
     "metadata_json": {"puertos": 4, "tipo": "GPON", "wifi": True}},
    {"id": "p3",  "categoria_id": "c1", "nombre": "ONT FiberHome AN5506-04",
     "marca": "FiberHome", "modelo": "AN5506-04", "referencia": None,
     "requiere_serial": True,  "descripcion": "ONT GPON 4 puertos GE",
     "metadata_json": {"puertos": 4, "tipo": "GPON", "wifi": False}},

    # Routers
    {"id": "p4",  "categoria_id": "c2", "nombre": "Router MikroTik hAP lite",
     "marca": "MikroTik", "modelo": "RB941-2nD", "referencia": "RB941-2nD",
     "requiere_serial": True,  "descripcion": "Router WiFi 2.4 GHz 5 puertos",
     "metadata_json": {"frecuencia": "2.4GHz", "puertos": 5, "wifi": True}},
    {"id": "p5",  "categoria_id": "c2", "nombre": "Router TP-Link WR840N",
     "marca": "TP-Link", "modelo": "TL-WR840N", "referencia": "TL-WR840N V6",
     "requiere_serial": True,  "descripcion": "Router WiFi 300 Mbps 4 puertos LAN",
     "metadata_json": {"frecuencia": "2.4GHz", "puertos": 4, "wifi": True}},
    {"id": "p6",  "categoria_id": "c2", "nombre": "Router Linksys E1200",
     "marca": "Linksys", "modelo": "E1200", "referencia": None,
     "requiere_serial": True,  "descripcion": "Router WiFi N 2.4 GHz 4 puertos",
     "metadata_json": {"frecuencia": "2.4GHz", "puertos": 4, "wifi": True}},

    # Antenas
    {"id": "p7",  "categoria_id": "c3", "nombre": "Antena Ubiquiti NanoStation Loco M5",
     "marca": "Ubiquiti", "modelo": "NS-LOCO-M5", "referencia": "LOCO5",
     "requiere_serial": True,  "descripcion": "Antena sectorial 5 GHz 16 dBi",
     "metadata_json": {"frecuencia": "5GHz", "ganancia_dbi": 16, "tipo": "sectorial"}},
    {"id": "p8",  "categoria_id": "c3", "nombre": "Antena MikroTik SXT Lite5",
     "marca": "MikroTik", "modelo": "RBSXTLITE5HPnD", "referencia": None,
     "requiere_serial": True,  "descripcion": "Antena integrada 5 GHz 16 dBi",
     "metadata_json": {"frecuencia": "5GHz", "ganancia_dbi": 16, "tipo": "integrada"}},

    # Cámaras
    {"id": "p9",  "categoria_id": "c4", "nombre": "Cámara Dahua IPC-HFW1230S",
     "marca": "Dahua", "modelo": "IPC-HFW1230S", "referencia": None,
     "requiere_serial": True,  "descripcion": "Cámara IP Full HD 2MP exterior",
     "metadata_json": {"resolucion": "1080p", "tipo": "exterior", "ir": True}},
    {"id": "p10", "categoria_id": "c4", "nombre": "Cámara Hikvision DS-2CE16D0T-IR",
     "marca": "Hikvision", "modelo": "DS-2CE16D0T-IR", "referencia": None,
     "requiere_serial": True,  "descripcion": "Cámara analógica 2MP visión nocturna",
     "metadata_json": {"resolucion": "1080p", "tipo": "exterior", "ir": True}},

    # Switches
    {"id": "p11", "categoria_id": "c5", "nombre": "Switch TP-Link TL-SF1008D",
     "marca": "TP-Link", "modelo": "TL-SF1008D", "referencia": "TL-SF1008D V10",
     "requiere_serial": False, "descripcion": "Switch 8 puertos 10/100 no administrable",
     "metadata_json": {"puertos": 8, "administrable": False, "velocidad": "100Mbps"}},
    {"id": "p12", "categoria_id": "c5", "nombre": "Switch D-Link DES-1008A",
     "marca": "D-Link", "modelo": "DES-1008A", "referencia": None,
     "requiere_serial": False, "descripcion": "Switch 8 puertos 10/100 no administrable",
     "metadata_json": {"puertos": 8, "administrable": False, "velocidad": "100Mbps"}},
    {"id": "p13", "categoria_id": "c5", "nombre": "Switch Cisco WS-C2960-24TC-L",
     "marca": "Cisco", "modelo": "WS-C2960-24TC-L", "referencia": "C2960-24TC",
     "requiere_serial": True,  "descripcion": "Switch administrable 24 puertos 10/100 + 2 SFP",
     "metadata_json": {"puertos": 24, "administrable": True, "velocidad": "100Mbps", "sfp": 2}},

    # Fuentes
    {"id": "p14", "categoria_id": "c6", "nombre": "Fuente 12V 1A",
     "marca": "Genérica", "modelo": "KY-1201000", "referencia": None,
     "requiere_serial": False, "descripcion": "Fuente de poder 12V DC 1A",
     "metadata_json": {"voltaje": "12V", "corriente": "1A", "tipo": "DC"}},
    {"id": "p15", "categoria_id": "c6", "nombre": "Fuente 48V PoE",
     "marca": "Genérica", "modelo": "POE-48V", "referencia": None,
     "requiere_serial": False, "descripcion": "Fuente Power over Ethernet 48V 0.5A",
     "metadata_json": {"voltaje": "48V", "corriente": "0.5A", "tipo": "PoE"}},

    # Cables
    {"id": "p16", "categoria_id": "c7", "nombre": "Cable UTP Cat 5e (metro)",
     "marca": "Genérica", "modelo": "UTP-CAT5E", "referencia": None,
     "requiere_serial": False, "descripcion": "Cable de red UTP categoría 5e — por metro",
     "metadata_json": {"tipo": "UTP", "categoria": "5e", "unidad": "metro"}},
    {"id": "p17", "categoria_id": "c7", "nombre": "Cable UTP Cat 6 (metro)",
     "marca": "Genérica", "modelo": "UTP-CAT6", "referencia": None,
     "requiere_serial": False, "descripcion": "Cable de red UTP categoría 6 — por metro",
     "metadata_json": {"tipo": "UTP", "categoria": "6", "unidad": "metro"}},

    # Fibra
    {"id": "p18", "categoria_id": "c8", "nombre": "Pigtail SC/APC",
     "marca": "Genérica", "modelo": "SC-APC-1M", "referencia": None,
     "requiere_serial": False, "descripcion": "Pigtail fibra óptica SC/APC 1 metro",
     "metadata_json": {"conector": "SC/APC", "longitud": "1m", "tipo": "pigtail"}},
    {"id": "p19", "categoria_id": "c8", "nombre": "Patch Cord LC/LC 3m",
     "marca": "Genérica", "modelo": "LC-LC-3M", "referencia": None,
     "requiere_serial": False, "descripcion": "Patch cord fibra óptica LC/LC duplex 3 metros",
     "metadata_json": {"conector": "LC/LC", "longitud": "3m", "tipo": "patch_cord"}},
]

# ---------------------------------------------------------------------------
# Datos por sede
# ---------------------------------------------------------------------------
SEDES = [
    {"id": "s1", "nombre": "Ramiriquí", "municipio": "Ramiriquí", "direccion": "Carrera 5 # 4-20, Centro"},
    {"id": "s2", "nombre": "Tunja",     "municipio": "Tunja",     "direccion": "Calle 19 # 9-35, Centro"},
]

USUARIOS_SEDE1 = [
    {"id": "u1", "sede_id": "s1", "rol_id": "r1", "nombre": "Carlos Pérez",
     "correo": "carlos@isp.com", "password_hash": PASSWORD_HASH, "activo": True},
    {"id": "u2", "sede_id": "s1", "rol_id": "r2", "nombre": "María López",
     "correo": "maria@isp.com", "password_hash": PASSWORD_HASH, "activo": True},
]

USUARIOS_SEDE2 = [
    {"id": "u3", "sede_id": "s2", "rol_id": "r1", "nombre": "Pedro Martínez",
     "correo": "pedro@isp.com", "password_hash": PASSWORD_HASH, "activo": True},
    {"id": "u4", "sede_id": "s2", "rol_id": "r2", "nombre": "Ana González",
     "correo": "ana@isp.com", "password_hash": PASSWORD_HASH, "activo": True},
]

STOCK_SEDE1 = [
    # ONT
    {"sede_id": "s1", "producto_id": "p1",  "cantidad": 12},
    {"sede_id": "s1", "producto_id": "p2",  "cantidad": 8},
    {"sede_id": "s1", "producto_id": "p3",  "cantidad": 15},
    # Routers
    {"sede_id": "s1", "producto_id": "p4",  "cantidad": 10},
    {"sede_id": "s1", "producto_id": "p5",  "cantidad": 20},
    {"sede_id": "s1", "producto_id": "p6",  "cantidad": 5},
    # Antenas
    {"sede_id": "s1", "producto_id": "p7",  "cantidad": 6},
    {"sede_id": "s1", "producto_id": "p8",  "cantidad": 4},
    # Cámaras
    {"sede_id": "s1", "producto_id": "p9",  "cantidad": 3},
    {"sede_id": "s1", "producto_id": "p10", "cantidad": 2},
    # Switches
    {"sede_id": "s1", "producto_id": "p11", "cantidad": 7},
    {"sede_id": "s1", "producto_id": "p12", "cantidad": 5},
    {"sede_id": "s1", "producto_id": "p13", "cantidad": 1},
    # Fuentes
    {"sede_id": "s1", "producto_id": "p14", "cantidad": 25},
    {"sede_id": "s1", "producto_id": "p15", "cantidad": 10},
    # Cable (metros)
    {"sede_id": "s1", "producto_id": "p16", "cantidad": 200},
    {"sede_id": "s1", "producto_id": "p17", "cantidad": 100},
    # Fibra
    {"sede_id": "s1", "producto_id": "p18", "cantidad": 30},
    {"sede_id": "s1", "producto_id": "p19", "cantidad": 15},
]

STOCK_SEDE2 = [
    {"sede_id": "s2", "producto_id": "p1",  "cantidad": 8},
    {"sede_id": "s2", "producto_id": "p2",  "cantidad": 5},
    {"sede_id": "s2", "producto_id": "p3",  "cantidad": 10},
    {"sede_id": "s2", "producto_id": "p4",  "cantidad": 6},
    {"sede_id": "s2", "producto_id": "p5",  "cantidad": 12},
    {"sede_id": "s2", "producto_id": "p6",  "cantidad": 3},
    {"sede_id": "s2", "producto_id": "p7",  "cantidad": 4},
    {"sede_id": "s2", "producto_id": "p8",  "cantidad": 2},
    {"sede_id": "s2", "producto_id": "p9",  "cantidad": 2},
    {"sede_id": "s2", "producto_id": "p10", "cantidad": 1},
    {"sede_id": "s2", "producto_id": "p11", "cantidad": 4},
    {"sede_id": "s2", "producto_id": "p12", "cantidad": 3},
    {"sede_id": "s2", "producto_id": "p13", "cantidad": 1},
    {"sede_id": "s2", "producto_id": "p14", "cantidad": 15},
    {"sede_id": "s2", "producto_id": "p15", "cantidad": 6},
    {"sede_id": "s2", "producto_id": "p16", "cantidad": 150},
    {"sede_id": "s2", "producto_id": "p17", "cantidad": 50},
    {"sede_id": "s2", "producto_id": "p18", "cantidad": 20},
    {"sede_id": "s2", "producto_id": "p19", "cantidad": 10},
]

# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------
HACE_7_DIAS = datetime.now() - timedelta(days=7)
HACE_3_DIAS = datetime.now() - timedelta(days=3)


FORCE = "--force" in sys.argv


def seed_database(db_url, sede_id, usuarios, stock):
    """Conecta a una base de datos, crea tablas y siembra datos."""
    engine = create_engine(db_url, pool_pre_ping=True)

    if FORCE:
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
    else:
        Base.metadata.create_all(bind=engine)

    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Saltar si ya hay datos (a menos que se use --force)
        if not FORCE and session.query(Rol).count() > 0:
            print(f"  ⏭ Ya hay datos en {sede_id}, saltando seed (usa --force para resetear)")
            return

        # 1. Roles  (comunes)
        for data in ROLES:
            session.add(Rol(**data))

        # 2. Sedes  (ambas sedes en cada BD)
        for data in SEDES:
            session.add(Sede(**data))
        session.flush()

        # 3. Categorías  (comunes)
        for data in CATEGORIAS:
            session.add(Categoria(**data))
        session.flush()

        # 4. Productos  (comunes)
        for data in PRODUCTOS:
            session.add(Producto(**data))
        session.flush()

        # 5. Usuarios  (propios de cada sede)
        for data in usuarios:
            session.add(Usuario(**data))
        session.flush()

        # 6. Stock inicial
        for data in stock:
            session.add(StockActual(**data))
        session.flush()

        # 7. Movimiento de entrada inicial (stock inicial como movimiento)
        mov_id = str(uuid.uuid4())
        mov = MovimientoInventario(
            id=mov_id,
            usuario_id=usuarios[0]["id"],
            sede_origen_id=sede_id,
            sede_destino_id=None,
            tipo_movimiento="entrada",
            observacion="Carga inicial de inventario",
            fecha=HACE_7_DIAS,
        )
        session.add(mov)
        session.flush()

        for item in stock:
            det = DetalleMovimiento(
                movimiento_id=mov_id,
                producto_id=item["producto_id"],
                cantidad=item["cantidad"],
                serial=None,
                observacion=None,
            )
            session.add(det)

        # 8. Movimiento de salida de prueba (instalación a cliente)
        if len(stock) >= 3:
            mov2_id = str(uuid.uuid4())
            mov2 = MovimientoInventario(
                id=mov2_id,
                usuario_id=usuarios[0]["id"],
                sede_origen_id=sede_id,
                sede_destino_id=None,
                tipo_movimiento="salida",
                observacion="Instalación cliente - Sector Centro",
                fecha=HACE_3_DIAS,
            )
            session.add(mov2)
            session.flush()

            salidas = [
                {"producto_id": "p1", "cantidad": 1, "serial": f"SER-ONT-{sede_id}-001"},
                {"producto_id": "p5", "cantidad": 1, "serial": f"SER-RTR-{sede_id}-001"},
                {"producto_id": "p14", "cantidad": 1, "serial": None},
            ]
            for s in salidas:
                det = DetalleMovimiento(
                    movimiento_id=mov2_id,
                    producto_id=s["producto_id"],
                    cantidad=s["cantidad"],
                    serial=s["serial"],
                    observacion="Instalación completa",
                )
                session.add(det)

            # Reflejar la salida en stock_actual
            for s in salidas:
                session.query(StockActual).filter(
                    StockActual.sede_id == sede_id,
                    StockActual.producto_id == s["producto_id"],
                ).update({StockActual.cantidad: StockActual.cantidad - s["cantidad"]})

        session.commit()
        print(f"  ✓ Seed completado")

    except Exception as e:
        session.rollback()
        print(f"  ✗ Error: {e}")
        raise
    finally:
        session.close()


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
def run():
    configs = [
        ("s1", DATABASE_URLS["s1"], "s1", USUARIOS_SEDE1, STOCK_SEDE1),
        ("s2", DATABASE_URLS["s2"], "s2", USUARIOS_SEDE2, STOCK_SEDE2),
    ]
    for name, url, sede_id, usuarios, stock in configs:
        print(f"\nPoblando {name} ({url})...")
        seed_database(url, sede_id, usuarios, stock)

    print("\n✅ Seed completado en ambas bases.")


if __name__ == "__main__":
    run()
