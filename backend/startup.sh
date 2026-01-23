#!/bin/bash
set -e

echo "========================================"
echo "  CIO Dashboard Backend Startup"
echo "========================================"
echo "PORT: ${PORT:-8080}"
echo "DB_NAME: ${DB_NAME}"
echo "ALLOWED_ORIGINS: ${ALLOWED_ORIGINS}"

PG_VERSION=$(ls /usr/lib/postgresql/ | head -1)
PG_BIN="/usr/lib/postgresql/${PG_VERSION}/bin"
echo "PostgreSQL version: ${PG_VERSION}"

if [ ! -d "/var/lib/postgresql/data/base" ]; then
    echo "Initializing PostgreSQL..."
    mkdir -p /var/lib/postgresql/data
    chown -R postgres:postgres /var/lib/postgresql/data
    chmod 700 /var/lib/postgresql/data
    
    su - postgres -c "${PG_BIN}/initdb -D /var/lib/postgresql/data"
    
    echo "host all all 0.0.0.0/0 md5" >> /var/lib/postgresql/data/pg_hba.conf
    echo "listen_addresses = '*'" >> /var/lib/postgresql/data/postgresql.conf
    
    su - postgres -c "${PG_BIN}/pg_ctl -D /var/lib/postgresql/data -l /tmp/postgres.log start"
    
    echo "Waiting for PostgreSQL..."
    sleep 10
    
    echo "Creating database..."
    su - postgres -c "${PG_BIN}/psql -c \"CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';\""
    su - postgres -c "${PG_BIN}/psql -c \"CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};\""
    su - postgres -c "${PG_BIN}/psql -c \"GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};\""
    
    echo "Running migrations..."
    if [ -d "/docker-entrypoint-initdb.d" ]; then
        for f in /docker-entrypoint-initdb.d/*.sql; do
            if [ -f "$f" ]; then
                echo "Executing: $(basename $f)"
                su - postgres -c "${PG_BIN}/psql -U ${DB_USER} -d ${DB_NAME} -f $f"
            fi
        done
    fi
    
    su - postgres -c "${PG_BIN}/pg_ctl -D /var/lib/postgresql/data stop"
    sleep 2
else
    echo "PostgreSQL already initialized"
fi

echo "Starting supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
