# AFECONTROL - Sistema de Gestión de Inventarios ISP

Sistema web para gestión de inventarios de equipos de telecomunicaciones, con soporte para múltiples sedes (Ramiriquí y Tunja).

## Requisitos

- Docker y Docker Compose
- Python 3.10+
- Node.js 18+

## Inicio rápido (3 comandos)

```bash
# 1. Clonar e instalar todo automáticamente
./setup.sh

# 2. En otra terminal, iniciar backend
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000

# 3. En otra terminal, iniciar frontend
cd frontend && npm run dev
```

Abrir en el navegador: **http://localhost:5173**

## Instalación manual paso a paso

### 1. Bases de datos

```bash
docker compose up -d
```

Crea dos bases PostgreSQL:
- `isp_sede1` → puerto `5433`
- `isp_sede2` → puerto `5434`

### 2. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m app.core.seed    # carga datos de prueba
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Credenciales de prueba

| Rol   | Correo            | Contraseña |
|-------|-------------------|------------|
| Admin | carlos@isp.com    | admin123   |
| Admin | pedro@isp.com     | admin123   |
| Usuario | maria@isp.com   | admin123   |
| Usuario | ana@isp.com    | admin123   |

## Estructura del proyecto

```
AFECONTROL_-INVENTARIOS/
├── backend/
│   ├── app/
│   │   ├── core/          # Config DB, seguridad, seed
│   │   ├── models/        # Modelos SQLAlchemy
│   │   ├── routers/       # Endpoints FastAPI
│   │   ├── schemas/       # Schemas Pydantic
│   │   └── main.py        # Entry point
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── layouts/       # Layouts
│   │   ├── pages/         # Páginas/vistas
│   │   ├── routes/        # Configuración de rutas
│   │   └── services/      # API client (axios)
│   └── package.json
├── docker-compose.yml     # PostgreSQL multi-sede
├── setup.sh               # Script de instalación automática
└── README.md
```

## Funcionalidades

- Autenticación JWT con roles (admin / usuario)
- Gestión de productos, categorías y sedes
- Control de inventario con entradas y salidas
- Stock por sede con actualización en tiempo real
- Dashboard con indicadores y alertas
- Movimientos entre sedes (transferencias)

## Tecnologías

- **Backend:** FastAPI, SQLAlchemy, PostgreSQL, JWT, bcrypt
- **Frontend:** React 19, React Router 7, Vite 8, TailwindCSS 4, Recharts, Axios
- **Infra:** Docker, Docker Compose
