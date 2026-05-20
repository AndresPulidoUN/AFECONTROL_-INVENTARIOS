#!/bin/bash
set -e

echo "=========================================="
echo "  AFECONTROL - INVENTARIOS"
echo "  Configuración automática del proyecto"
echo "=========================================="

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker no está instalado."
    echo "        Instálalo desde: https://docs.docker.com/engine/install/"
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "[ERROR] Docker Compose no está instalado."
    exit 1
fi

# Verificar Python 3
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 no está instalado."
    exit 1
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js no está instalado."
    echo "        Instálalo desde: https://nodejs.org/"
    exit 1
fi

echo ""
echo "[1/5] Levantando bases de datos PostgreSQL..."
docker compose up -d
echo "  ✓ PostgreSQL corriendo (puertos 5433 y 5434)"
sleep 3

echo ""
echo "[2/5] Configurando backend (Python)..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt -q
echo "  ✓ Dependencias de Python instaladas"

echo ""
echo "[3/5] Sembrando datos de prueba..."
python -m app.core.seed
echo "  ✓ Datos iniciales cargados"

cd ..

echo ""
echo "[4/5] Configurando frontend (React + Vite)..."
cd frontend
npm install
echo "  ✓ Dependencias de Node instaladas"
cd ..

echo ""
echo "=========================================="
echo "  ✅ CONFIGURACIÓN COMPLETADA"
echo "=========================================="
echo ""
echo "Para iniciar el proyecto ejecuta:"
echo ""
echo "  Terminal 1 - Backend:"
echo "    cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000"
echo ""
echo "  Terminal 2 - Frontend:"
echo "    cd frontend && npm run dev"
echo ""
echo "Luego abre: http://localhost:5173"
echo ""
echo "Credenciales por defecto:"
echo "  Admin: carlos@isp.com / admin123"
echo "  Usuario: maria@isp.com / admin123"
echo "=========================================="
