# YugabyteDB Setup for CIO Dashboard

This guide will help you set up YugabyteDB and migrate your CSV data to the database.

## Prerequisites

1. **YugabyteDB Installation**: Download and install YugabyteDB from [yugabyte.com](https://www.yugabyte.com/)
2. **Python Dependencies**: Make sure all requirements are installed:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

## Step 1: Start YugabyteDB

### Option A: Local Installation
```bash
# Start YugabyteDB (adjust path as needed)
cd /path/to/yugabytedb/bin
./yb-ctl start --rf 1
```

### Option B: Docker
```bash
docker run -d --name yugabyte \
  -p 5433:5433 -p 7000:7000 -p 9000:9000 -p 9042:9042 \
  yugabytedb/yugabyte:latest \
  bin/yugabytedb start --daemon=false
```

### Option C: YugabyteDB Managed
If using YugabyteDB Managed, update your `.env` file with the connection details provided by YugabyteDB.

## Step 2: Configure Database Connection

Update the `backend/.env` file with your YugabyteDB connection details:

```env
DATA_SOURCE=database
DB_HOST=localhost
DB_PORT=5433
DB_NAME=cio_dashboard
DB_USER=yugabyte
DB_PASSWORD=your_password_here
```

## Step 3: Create Database and Schema

Run the database setup script:

```bash
cd backend
python setup_database.py
```

This script will:
- Create the `cio_dashboard` database
- Create all necessary tables
- Migrate data from CSV files to database tables

## Step 4: Verify Setup

Test the database connection:

```bash
cd backend
python -c "
from data_sources.factory import data_source
import asyncio

async def test():
    data = await data_source.load_executive_summary('american_logics')
    print('✓ Database connection successful!')
    print('Sample data:', list(data.keys())[:3])

asyncio.run(test())
"
```

## Step 5: Start the Application

```bash
# Start backend
cd backend
python main.py

# In another terminal, start frontend
npm run dev
```

## Troubleshooting

### Connection Issues
- **Port 5433 not accessible**: Make sure YugabyteDB is running and listening on the correct port
- **Authentication failed**: Check username/password in `.env` file
- **Database not found**: Run `python setup_database.py` to create the database

### Data Migration Issues
- **CSV files not found**: Ensure CSV files exist in `backend/data/tenant_*/` directories
- **Permission errors**: Make sure the database user has CREATE/INSERT permissions

### Application Issues
- **Still using CSV data**: Verify `DATA_SOURCE=database` in `.env` file
- **Tenant not found**: Check that tenant data was migrated correctly

## Database Schema

The database includes the following tables:
- `tenants` - Tenant information
- `executive_summary_metrics` - KPI metrics
- `portfolio_programs` - Portfolio program data
- `application_health` - Application health metrics
- `technology_projects` - Technology project information
- `workforce_metrics` - Workforce analytics
- `delivery_performance` - Delivery performance data
- `spend_categories` - Spend category breakdowns
- `monthly_spend_trend` - Monthly spending trends
- `project_summary` - Project summary statistics
- `project_completion_trend` - Project completion over time
- `vulnerability_trend` - Security vulnerability trends
- `active_incidents` - Active incident tracking
- `skills_distribution` - Skills distribution data

## Multi-Tenant Architecture

The database supports multi-tenancy through:
- Tenant-specific data isolation
- `X-Tenant-ID` header for API requests
- Automatic tenant filtering in queries

Default tenant: `american_logics`