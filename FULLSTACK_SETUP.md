# CIO Dashboard - Full Stack Setup

## 🎯 Overview
The dashboard now has a complete **FastAPI backend** that handles all data processing, making it easy to connect to multiple data sources (CSV, Excel, Databases, APIs).

## 📁 Project Structure
```
CIO_Dashboard/
├── backend/                    # FastAPI Backend
│   ├── main.py                # API entry point
│   ├── config.py              # Configuration
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment config
│   ├── data_sources/          # Data source implementations
│   │   ├── base.py           # Abstract base class
│   │   ├── csv_source.py     # CSV/Excel reader
│   │   ├── database_source.py # Database connector
│   │   └── factory.py        # Source factory
│   └── routers/              # API endpoints
│       ├── dashboard.py
│       ├── portfolio.py
│       ├── workforce.py
│       └── projects.py
│
├── src/                       # React Frontend
│   ├── components/           # Dashboard components
│   ├── services/             # API client
│   │   └── dataService.ts    # Calls backend API
│   └── ...
│
├── data/                      # CSV data files
│   ├── executive_summary.csv
│   ├── portfolio_programs.csv
│   └── ...
│
└── start.bat                  # Quick start script (Windows)
```

## 🚀 Quick Start

### Option 1: Use the Start Script (Windows)
```bash
start.bat
```

### Option 2: Manual Start

**Terminal 1 - Start Backend:**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

## 🔧 Configuration

### Backend (.env in backend folder)
```env
DATA_SOURCE=csv              # csv, excel, postgres, mysql
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env in root folder)
```env
VITE_API_URL=http://localhost:8000/api
```

## 📊 Data Sources

### Current: CSV Files (Default)
- Data stored in `/data` folder
- Fast, simple, no setup needed
- Perfect for demos and small datasets

### Future: Database Integration
1. Set `DATA_SOURCE=postgres` or `DATA_SOURCE=mysql`
2. Configure database credentials in `.env`
3. Backend automatically reads from database
4. No frontend changes needed!

### Future: External APIs
1. Implement custom connector in `backend/data_sources/api_source.py`
2. Set `DATA_SOURCE=api`
3. Configure API credentials in `.env`

## 🔌 API Endpoints

**Base URL:** `http://localhost:8000/api`

### Dashboard
- `GET /dashboard/executive-summary` - All executive KPIs
- `GET /dashboard/all` - Complete dashboard data

### Portfolio
- `GET /portfolio/programs` - Portfolio programs
- `GET /portfolio/applications` - Application health
- `GET /portfolio/spend-trend` - Monthly spend
- `GET /portfolio/spend-categories` - Spend breakdown

### Workforce
- `GET /workforce/metrics` - Resource metrics
- `GET /workforce/skills` - Skills distribution

### Projects
- `GET /projects/technology` - Technology projects
- `GET /projects/delivery-performance` - Delivery metrics
- `GET /projects/incidents` - Active incidents

**API Documentation:** http://localhost:8000/docs

## 🔄 Data Flow

```
CSV Files ──────► FastAPI Backend ──────► React Frontend
   or                 (Python)              (TypeScript)
Database              
   or
External API
```

**Benefits:**
- ✅ Single source of truth (backend handles all data)
- ✅ Easy to switch data sources (just change .env)
- ✅ Data validation and cleaning in one place
- ✅ Can add caching, authentication, etc.
- ✅ Frontend remains unchanged regardless of data source

## 📝 Adding New Data Sources

1. Create new class in `backend/data_sources/`
2. Extend `DataSourceBase`
3. Implement all methods
4. Update `factory.py`
5. Set `DATA_SOURCE` in `.env`

Example structure:
```python
class MyCustomSource(DataSourceBase):
    async def load_executive_summary(self):
        # Your custom logic
        return data
```

## 🛠️ Development Workflow

### Updating Data
1. Update CSV files in `/data` folder
2. Backend automatically reads new data
3. Refresh frontend to see changes

### Adding New KPIs
1. Add field to CSV files
2. Update `data_sources/csv_source.py` to read field
3. Update API response in `routers/`
4. Update frontend components

## 📦 Deployment

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
npm run build
# Deploy dist/ folder to your web server
```

## ✅ Benefits of This Architecture

1. **Flexibility**: Switch between CSV, Excel, Database, API sources
2. **Scalability**: Backend can handle data processing, caching, auth
3. **Maintainability**: Single place for data logic
4. **Security**: Can add authentication, rate limiting
5. **Performance**: Can implement caching, async processing
6. **Future-proof**: Easy to migrate to production databases

## 🎯 Next Steps

- [ ] Test with your real data sources
- [ ] Add database connection when ready
- [ ] Implement authentication if needed
- [ ] Add data caching for performance
- [ ] Set up automated data refresh
- [ ] Deploy to production environment
