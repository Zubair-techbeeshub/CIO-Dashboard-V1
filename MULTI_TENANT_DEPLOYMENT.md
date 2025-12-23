# Multi-Tenant CIO Dashboard - Deployment Architecture

## Overview

This CIO Dashboard implements a multi-tenant SaaS architecture where multiple client organizations can access their own isolated data through separate domains, all connecting to a single FastAPI backend service.

## Architecture Diagram

```
client1.techbeeshub.com  ┐
client2.techbeeshub.com  ├──▶ React (Vercel – FREE)
clientN.techbeeshub.com  ┘

                |
                ▼
        api.techbeeshub.com
        FastAPI (ONE service)
        koyeb/aws/VPS services

                |
                ▼
        PostgreSQL / MySQL
        (Single DB, tenant_id)
```

## Components

### 1. Frontend (React + Vercel)
- **Deployment**: Vercel (Free tier)
- **Domains**: client1.techbeeshub.com, client2.techbeeshub.com, etc.
- **Tenant Detection**: Automatic from subdomain
- **API Calls**: All requests include `X-Tenant-ID` header

### 2. Backend (FastAPI)
- **Deployment**: Koyeb, AWS, or VPS
- **Domain**: api.techbeeshub.com
- **Multi-tenant**: Automatic tenant isolation
- **Data Sources**: CSV files or database with tenant filtering

### 3. Database (PostgreSQL/MySQL)
- **Single Database**: All tenants share one database
- **Tenant Isolation**: `tenant_id` column in all tables
- **Scalability**: Can handle hundreds of tenants

## Tenant Identification

### Frontend (Automatic)
```typescript
function getTenantId(): string {
  const hostname = window.location.hostname;

  // localhost -> default tenant
  if (hostname === 'localhost') {
    return 'american_logics';
  }

  // client1.techbeeshub.com -> client1
  const parts = hostname.split('.');
  if (parts.length >= 3 && parts[0] !== 'www') {
    return parts[0].toLowerCase();
  }

  return 'american_logics'; // fallback
}
```

### Backend (Header-based)
```python
# Extract from X-Tenant-ID header
tenant_id = request.headers.get("X-Tenant-ID", "american_logics")
```

## Data Isolation

### CSV Files (Current)
```
data/
├── tenant_american_logics/
│   ├── executive_summary.csv
│   ├── project_summary.csv
│   └── ...
├── tenant_client1/
│   ├── executive_summary.csv
│   └── ...
└── tenant_client2/
    └── ...
```

### Database (Future)
```sql
-- All tables include tenant_id
CREATE TABLE executive_summary_metrics (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100),
    metric_value DECIMAL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Automatic filtering
SELECT * FROM executive_summary_metrics
WHERE tenant_id = 'client1';
```

## Deployment Steps

### 1. Backend Deployment

#### Option A: Koyeb (Recommended)
```bash
# Deploy to Koyeb
git push origin main
# Configure domain: api.techbeeshub.com
```

#### Option B: AWS/VPS
```bash
# On your server
git clone <repo>
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
# Configure nginx reverse proxy
```

### 2. Frontend Deployment (Vercel)

#### For Each Client:
```bash
# Create separate Vercel projects
vercel --prod
# Configure custom domains:
# client1.techbeeshub.com
# client2.techbeeshub.com
```

#### Environment Variables (per project):
```env
VITE_API_URL=https://api.techbeeshub.com/api
```

### 3. Database Setup

#### PostgreSQL Setup:
```sql
-- Create database
CREATE DATABASE cio_dashboard;

-- Create tenant-aware tables
-- (See database_schema.sql for full schema)
```

#### Environment Variables:
```env
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=cio_dashboard
DB_USER=your-user
DB_PASSWORD=your-password
```

## Configuration

### Backend (.env)
```env
# Multi-tenant settings
DEFAULT_TENANT=american_logics
TENANT_HEADER=X-Tenant-ID
TENANT_FROM_SUBDOMAIN=false

# Data source
DATA_SOURCE=csv  # or 'database'

# CORS
ALLOWED_ORIGINS=https://*.techbeeshub.com,https://*.vercel.app

# Database (if using database)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cio_dashboard
DB_USER=postgres
DB_PASSWORD=
```

### Frontend (Vercel Environment)
```env
VITE_API_URL=https://api.techbeeshub.com/api
```

## Adding New Tenants

### 1. Create Data Directory
```bash
mkdir data/tenant_newclient
cp data/tenant_american_logics/* data/tenant_newclient/
# Edit CSV files with client-specific data
```

### 2. Deploy Frontend
```bash
# Create new Vercel project
vercel --prod
# Set custom domain: newclient.techbeeshub.com
```

### 3. Database (if using DB)
```sql
-- Insert tenant-specific data
INSERT INTO executive_summary_metrics (tenant_id, metric_name, metric_value)
VALUES ('newclient', 'YoYRevenueGrowth', 8.5);
```

## Security Considerations

1. **Tenant Isolation**: Ensure proper data filtering
2. **CORS**: Restrict to known domains
3. **Rate Limiting**: Implement per-tenant limits
4. **Authentication**: Add user authentication per tenant
5. **HTTPS**: Required for all domains

## Monitoring & Maintenance

1. **Logs**: Monitor tenant-specific API usage
2. **Performance**: Track response times per tenant
3. **Data Backup**: Regular tenant data backups
4. **Updates**: Rolling updates without downtime

## Scaling

- **Frontend**: Vercel handles scaling automatically
- **Backend**: Koyeb/AWS auto-scaling
- **Database**: Connection pooling, read replicas
- **Storage**: CDN for static assets

## Cost Estimation

- **Vercel**: Free tier for multiple projects
- **Koyeb**: ~$10-50/month for API
- **Database**: ~$20-100/month depending on size
- **Domains**: ~$10-20/year per custom domain

Total: **$50-200/month** for full multi-tenant setup</content>
<parameter name="filePath">c:\Basha\TechbeesHub\American_Logics\CIO_Dashboard\MULTI_TENANT_DEPLOYMENT.md