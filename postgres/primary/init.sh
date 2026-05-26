#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE ROLE replicator WITH REPLICATION LOGIN PASSWORD 'replicator123';
EOSQL

# Allow trust auth from Docker network (replace scram-sha-256)
sed -i 's/host all all all scram-sha-256/host all all all trust/' "$PGDATA/pg_hba.conf"

echo "host replication replicator 0.0.0.0/0 trust" >> "$PGDATA/pg_hba.conf"
