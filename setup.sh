#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo "=========================================="
echo "  AFECONTROL - INVENTARIOS"
echo "  Configuración automática del proyecto"
echo "=========================================="

# ─── Funciones ─────────────────────────────────────────────
check_cmd() {
    if ! command -v "$1" &> /dev/null; then
        echo "  [ERROR] '$1' no está instalado."
        case "$1" in
            docker)
                echo "          En WSL: instala Docker Desktop en Windows y"
                echo "          asegúrate de habilitar la integración WSL."
                echo "          https://docs.docker.com/engine/install/" ;;
            python3)
                echo "          sudo apt update && sudo apt install -y python3 python3-venv python3-pip" ;;
            node)
                echo "          sudo apt update && sudo apt install -y nodejs npm" ;;
        esac
        return 1
    fi
    return 0
}

wait_for_port() {
    local port=$1
    local name=$2
    local max=$3
    echo -n "  Esperando $name (puerto $port)..."
    for i in $(seq 1 "$max"); do
        if python3 -c "import socket; s=socket.socket(); s.settimeout(2); s.connect(('localhost',$port)); s.close()" 2>/dev/null; then
            echo " listo"
            return 0
        fi
        echo -n "."
        sleep 2
    done
    echo " TIMEOUT"
    echo "  [ERROR] $name no respondió en el puerto $port"
    return 1
}

# ─── 1. Verificar dependencias ─────────────────────────────
echo ""
echo "[1/6] Verificando dependencias..."

check_cmd docker

DOCKER_COMPOSE="docker compose"
if ! docker compose version &>/dev/null 2>&1; then
    if command -v docker-compose &>/dev/null; then
        DOCKER_COMPOSE="docker-compose"
    else
        echo "  [ERROR] Docker Compose no está instalado."
        exit 1
    fi
fi
echo "  ✓ Docker: $(docker --version)"
echo "  ✓ Docker Compose disponible"

# Verificar que Docker realmente funciona
if ! docker info &>/dev/null; then
    echo "  [ERROR] Docker no está corriendo."
    echo "          En WSL: asegúrate de tener Docker Desktop abierto en Windows."
    exit 1
fi
echo "  ✓ Docker está corriendo"

check_cmd python3
echo "  ✓ Python3: $(python3 --version)"

check_cmd node
echo "  ✓ Node.js: $(node --version)"

# ─── 2. Levantar PostgreSQL ────────────────────────────────
echo ""
echo "[2/6] Levantando bases de datos PostgreSQL..."
$DOCKER_COMPOSE up -d postgres_sede1 postgres_sede2
echo "  ✓ Contenedores PostgreSQL iniciados"

# ─── 3. Esperar a PostgreSQL ───────────────────────────────
echo ""
echo "[3/6] Esperando que PostgreSQL esté listo..."
wait_for_port 5433 "Sede 1 (Ramiriquí)" 15
wait_for_port 5434 "Sede 2 (Tunja)" 15
sleep 2
echo "  ✓ Bases de datos listas"

# ─── 4. Backend ────────────────────────────────────────────
echo ""
echo "[4/6] Configurando backend (Python)..."
cd "$PROJECT_DIR/backend"

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "  ✓ Virtualenv creado"
fi

source venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q
echo "  ✓ Dependencias de Python instaladas"

# ─── 5. Seed ───────────────────────────────────────────────
echo ""
echo "[5/6] Sembrando datos de prueba..."
python -m app.core.seed
echo "  ✓ Datos iniciales cargados"

deactivate
cd "$PROJECT_DIR"

# ─── 6. Frontend ───────────────────────────────────────────
echo ""
echo "[6/6] Instalando dependencias del frontend..."
cd "$PROJECT_DIR/frontend"
npm install
echo "  ✓ Dependencias de Node instaladas"
cd "$PROJECT_DIR"

# ─── Fin ───────────────────────────────────────────────────
echo ""
echo "=========================================="
echo "  ✅ CONFIGURACIÓN COMPLETADA"
echo "=========================================="
echo ""
echo "  Para iniciar el proyecto:"
echo ""
echo "  Terminal 1 - Backend:"
echo "    cd $PROJECT_DIR/backend"
echo "    source venv/bin/activate"
echo "    uvicorn app.main:app --reload --port 8000"
echo ""
echo "  Terminal 2 - Frontend:"
echo "    cd $PROJECT_DIR/frontend"
echo "    npm run dev"
echo ""
echo "  --- O todo con Docker ---"
echo "    docker compose up --build"
echo ""
echo "  Abre: http://localhost:5173"
echo ""
echo "  Credenciales:"
echo "    Admin:   carlos@isp.com / admin123"
echo "    Usuario: maria@isp.com / admin123"
echo "=========================================="
