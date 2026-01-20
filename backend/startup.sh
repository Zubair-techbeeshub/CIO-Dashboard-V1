#!/bin/bash
set -e

echo "🚀 Starting Cloud Run container initialization..."

# PostgreSQL configuration
POSTGRES_VERSION=15
PGDATA=/var/lib/postgresql/data
POSTGRES_CONF=/etc/postgresql/$POSTGRES_VERSION/main/postgresql.conf
DB_NAME=${DB_NAME:-cio_dashboard}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}

# Function to wait for PostgreSQL to be ready
wait_for_postgres() {
    echo "⏳ Waiting for PostgreSQL to be ready..."
    for i in {1..30}; do
        if su - postgres -c "psql -U $DB_USER -d postgres -c 'SELECT 1'" &>/dev/null; then
            echo "✅ PostgreSQL is ready!"
            return 0
        fi
        echo "   Attempt $i/30: PostgreSQL not ready yet..."
        sleep 2
    done
    echo "❌ PostgreSQL failed to start"
    return 1
}

# Initialize PostgreSQL data directory if it doesn't exist
if [ ! -d "$PGDATA/base" ]; then
    echo "📦 Initializing PostgreSQL data directory..."
    su - postgres -c "/usr/lib/postgresql/$POSTGRES_VERSION/bin/initdb -D $PGDATA"
    
    # Configure PostgreSQL for local access
    echo "🔧 Configuring PostgreSQL..."
    cat >> $PGDATA/pg_hba.conf <<EOF
# Allow local connections
local   all             all                                     trust
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
EOF
    
    # Update PostgreSQL configuration for Cloud Run
    cat >> $PGDATA/postgresql.conf <<EOF
# Cloud Run optimizations
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 2621kB
min_wal_size = 1GB
max_wal_size = 4GB
EOF
    
    echo "✅ PostgreSQL initialized successfully"
fi

# Start PostgreSQL temporarily for database setup
echo "🔄 Starting PostgreSQL for initial setup..."
su - postgres -c "/usr/lib/postgresql/$POSTGRES_VERSION/bin/pg_ctl -D $PGDATA -l /var/log/postgresql/setup.log start"

# Wait for PostgreSQL to be ready
wait_for_postgres

# Create database if it doesn't exist
echo "📊 Setting up database: $DB_NAME..."
su - postgres -c "psql -U $DB_USER -d postgres -tc \"SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'\" | grep -q 1 || psql -U $DB_USER -d postgres -c \"CREATE DATABASE $DB_NAME\""

# Set password for postgres user
su - postgres -c "psql -U $DB_USER -d postgres -c \"ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD'\""

# Run database schema if file exists
if [ -f /app/database_schema.sql ]; then
    echo "📋 Running database schema..."
    su - postgres -c "psql -U $DB_USER -d $DB_NAME -f /app/database_schema.sql" 2>&1 | grep -v "already exists" || true
    echo "✅ Database schema applied"
else
    echo "⚠️  Warning: database_schema.sql not found, skipping schema setup"
fi

# Run setup_database.py if it exists
if [ -f /app/setup_database.py ]; then
    echo "🔧 Running setup_database.py..."
    cd /app
    su - app -c "cd /app && python setup_database.py" || echo "⚠️  setup_database.py encountered issues (may be expected)"
else
    echo "ℹ️  setup_database.py not found, skipping"
fi

# Stop temporary PostgreSQL
echo "🛑 Stopping temporary PostgreSQL..."
su - postgres -c "/usr/lib/postgresql/$POSTGRES_VERSION/bin/pg_ctl -D $PGDATA stop"

echo "✅ Database initialization complete!"
echo "🚀 Starting supervisord to manage PostgreSQL and FastAPI..."

# Start supervisord to manage both services
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
