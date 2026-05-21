# AFECONTROL - Sistema de Gestión de Inventarios ISP

Sistema web para gestión de inventarios de equipos de telecomunicaciones con soporte para múltiples sedes (Ramiriquí y Tunja).

## Inicio rápido (recomendado)

Solo necesitas **Docker**:

```bash
git clone <url-del-repositorio>
cd AFECONTROL_-INVENTARIOS
docker compose up --build
```

Abrir en el navegador: **http://localhost:5173**

Esto inicia automáticamente:
- PostgreSQL ×2 (una base por sede)
- Backend FastAPI (con seed de datos incluido)
- Frontend React sirviendo con Nginx

## Inicio local (desarrollo)

```bash
# 1. Clonar
git clone <url-del-repositorio>
cd AFECONTROL_-INVENTARIOS

# 2. Ejecutar setup automático
bash setup.sh

# 3. Iniciar (dos terminales)
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```

Abrir: **http://localhost:5173**

## Credenciales de prueba

| Rol     | Correo            | Contraseña |
|---------|-------------------|------------|
| Admin   | carlos@isp.com    | admin123   |
| Admin   | pedro@isp.com     | admin123   |
| Usuario | maria@isp.com     | admin123   |
| Usuario | ana@isp.com       | admin123   |

## Arquitectura

```
Cliente Web ──► Nginx (:5173) ──► Backend (:8000) ──► PostgreSQL Sede 1 (:5432)
                  │                                       PostgreSQL Sede 2 (:5432)
                  └── Sirve React (build)
```

Cada sede tiene su propia base de datos independiente. El backend enruta según el usuario autenticado.

## Tecnologías

- **Backend:** FastAPI, SQLAlchemy, PostgreSQL, JWT
- **Frontend:** React 19, Vite, TailwindCSS 4, Recharts
- **Infra:** Docker, Docker Compose, Nginx
