#!/bin/bash
# Parámetros: %d %h %p %D %m %H %M %P %r %R %N %S
failed_node_id=$1
failed_host=$2
failed_port=$3
failed_data=$4
new_master_id=$5
new_master_host=$6
old_master_id=$7
old_primary_id=$8
new_master_port=$9
new_master_data=${10}
new_node_name=${11}
new_node_id=${12}

echo "$(date): Failover triggered"
echo "  Failed node: $failed_node_id ($failed_host:$failed_port)"
echo "  New master host: $new_master_host:$new_master_port"

# Intentar promover el nuevo master
if [ -n "$new_master_host" ] && [ "$new_master_host" != "''" ]; then
    echo "Promoviendo $new_master_host:$new_master_port..."
    psql -h "$new_master_host" -p "$new_master_port" -U admin -d postgres -c "SELECT pg_promote();" 2>&1
    result=$?
    echo "pg_promote() exit code: $result"
else
    echo "No new master host available for promotion"
fi

echo "$(date): Failover completed"
