# CIO Dashboard FastAPI Backend

## Overview
FastAPI backend for CIO Dashboard that handles data processing, transformation, and serving data from multiple sources (CSV, Excel, Databases, External APIs).

## Setup

### 1. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update with your settings:
```bash
cp .env.example .env
```

### 3. Run the API Server
```bash
python main.py
```
Or using uvicorn directly:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at: `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

## Data Sources

### CSV/Excel (Default)
- Reads from `/data` folder
- No additional configuration needed
- Set `DATA_SOURCE=csv` in `.env`

### Database (PostgreSQL/MySQL)
1. Set `DATA_SOURCE=postgres` or `DATA_SOURCE=mysql`
2. Configure database connection in `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cio_dashboard
DB_USER=your_user
DB_PASSWORD=your_password
```

### External API
- Implement custom API connector in `data_sources/api_source.py`
- Set `DATA_SOURCE=api` in `.env`

## API Endpoints

### Dashboard
- `GET /api/dashboard/executive-summary` - Executive KPIs
- `GET /api/dashboard/all` - All dashboard data

### Portfolio
- `GET /api/portfolio/programs` - Portfolio programs
- `GET /api/portfolio/applications` - Application health
- `GET /api/portfolio/spend-trend` - Monthly spend trend
- `GET /api/portfolio/spend-categories` - Spend categories

### Workforce
- `GET /api/workforce/metrics` - Workforce metrics
- `GET /api/workforce/skills` - Skills distribution

### Projects
- `GET /api/projects/technology` - Technology projects
- `GET /api/projects/delivery-performance` - Delivery performance
- `GET /api/projects/incidents` - Active incidents

## Architecture

```
backend/
├── main.py                 # FastAPI application entry point
├── config.py              # Configuration management
├── requirements.txt       # Python dependencies
├── data_sources/          # Data source implementations
│   ├── base.py           # Base abstract class
│   ├── csv_source.py     # CSV/Excel data source
│   ├── database_source.py # Database data source
│   └── factory.py        # Data source factory
└── routers/              # API route handlers
    ├── dashboard.py
    ├── portfolio.py
    ├── workforce.py
    └── projects.py
```

## Adding New Data Sources

1. Create new class extending `DataSourceBase` in `data_sources/`
2. Implement all abstract methods
3. Update `DataSourceFactory` in `factory.py`
4. Set appropriate `DATA_SOURCE` in `.env`

## Data Processing Features

- **Automatic cleaning**: Removes empty rows, trims whitespace
- **Type conversion**: Ensures correct data types
- **Error handling**: Graceful fallbacks for missing data
- **Flexible sources**: Easy to switch between CSV, DB, API
- **Caching**: (Future) Add caching layer for performance
