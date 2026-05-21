#!/bin/bash
set -e

echo "=========================================="
echo "  AFECONTROL - Backend"
echo "=========================================="

wait_for_postgres() {
    local url=$1
    local name=$2
    echo "  Esperando PostgreSQL ($name)..."
    for i in $(seq 1 30); do
        if python -c "
import psycopg2, sys
try:
    conn = psycopg2.connect('$url')
    conn.close()
    sys.exit(0)
except Exception:
    sys.exit(1)
" 2>/dev/null; then
        echo "  $name listo"
        return 0
        fi
        sleep 2
    done
    echo "  ERROR: $name no disponible después de 60s"
    exit 1
}

wait_for_postgres "$DATABASE_URL_S1" "Sede 1 (Ramiriquí)"
wait_for_postgres "$DATABASE_URL_S2" "Sede 2 (Tunja)"

echo ""
echo "Sembrando datos iniciales..."
python -m app.core.seed

echo ""
echo "Iniciando servidor FastAPI..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
