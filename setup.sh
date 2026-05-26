#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo "=========================================="
echo "  AFECONTROL - INVENTARIOS"
echo "=========================================="

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "  [ERROR] Docker no está instalado."
    echo "  Instala Docker Desktop desde https://docs.docker.com/engine/install/"
    exit 1
fi

if ! docker info &>/dev/null; then
    echo "  [ERROR] Docker no está corriendo."
    exit 1
fi

echo "  Docker: $(docker --version)"
echo "  Docker Compose: $(docker compose version --short 2>/dev/null || echo 'disponible')"
echo ""

echo "  Construyendo e iniciando contenedores..."
echo "  (esto puede tomar varios minutos la primera vez)"
echo ""

docker compose up --build -d

echo ""
echo "=========================================="
echo "  ✅ SISTEMA LISTO"
echo "=========================================="
echo ""
echo "  Abre: http://localhost:5173"
echo ""
echo "  Credenciales:"
echo "    Admin: carlos@isp.com / admin123"
echo "    Admin: ana@isp.com / admin123"
echo "    Técnico: maria@isp.com / admin123"
echo "    Técnico: pedro@isp.com / admin123"
echo ""
echo "  Para ver progreso: docker compose logs -f"
echo "  Para detener:      docker compose down"
echo "  Para reiniciar:    docker compose up -d"
echo "=========================================="
