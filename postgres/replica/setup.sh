#!/bin/bash
set -e

if [ -z "$(ls -A "$PGDATA" 2>/dev/null)" ]; then
    echo "Replica: clonando desde primary..."
    until pg_isready -h postgres_primary -q 2>/dev/null; do
        echo "Esperando primary..."
        sleep 2
    done
    PGPASSWORD=replicator123 pg_basebackup -h postgres_primary -D "$PGDATA" -U replicator -R -P -v
    chown -R postgres:postgres "$PGDATA"
    echo "Replica: clonado completado"
fi

exec docker-entrypoint.sh "$@"
