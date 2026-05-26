# AFECONTROL — Sistema de Gestión de Inventarios ISP

Plataforma web para gestión centralizada de inventarios de equipos de telecomunicaciones con soporte multi-sede y alta disponibilidad.

## Inicio rápido

```bash
docker compose up --build
```

Abrir [http://localhost:5173](http://localhost:5173)

## Credenciales

| Rol | Correo | Contraseña |
|-----|--------|-----------|
| Admin | carlos@isp.com | admin123 |
| Admin | ana@isp.com | admin123 |
| Técnico | maria@isp.com | admin123 |
| Técnico | pedro@isp.com | admin123 |

## Arquitectura

```
Navegador ──► Frontend (React + Nginx) :5173
                  │
                  └─► /api/* ──► Backend (FastAPI) :8000
                                     │
                                     └─► pgpool-II :5432
                                           ├── PostgreSQL Primary (escribe/lee)
                                           └── PostgreSQL Replica (failover automático)
```

Cada operación de inventario se registra con `sede_id`, permitiendo consultas globales (admin) o filtradas por sede (técnico). El clúster PostgreSQL con pgpool-II garantiza failover automático sin intervención.

## Tecnologías

- **Backend:** Python 3.13, FastAPI, SQLAlchemy, PostgreSQL 16, JWT
- **Frontend:** React 19, Vite, TailwindCSS 4, Recharts
- **Infra:** Docker, Docker Compose, pgpool-II, Nginx

## Comandos útiles

```bash
docker compose up --build          # Iniciar todo
docker compose down                # Detener
docker compose down -v             # Detener y borrar datos
docker compose logs -f             # Ver logs
docker compose build backend       # Reconstruir solo backend
docker compose build frontend      # Reconstruir solo frontend
```
