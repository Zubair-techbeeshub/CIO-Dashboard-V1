# Migration Guide: EC2 to GCP Cloud Run

Complete guide for migrating CIO Dashboard from AWS EC2/RDS to Google Cloud Platform Cloud Run with Firebase Hosting.

## Table of Contents

1. [Migration Overview](#migration-overview)
2. [Prerequisites](#prerequisites)
3. [Pre-Migration Checklist](#pre-migration-checklist)
4. [Data Export from EC2](#data-export-from-ec2)
5. [Deploy to GCP](#deploy-to-gcp)
6. [Data Import to Cloud Run](#data-import-to-cloud-run)
7. [Parallel Testing](#parallel-testing)
8. [DNS Cutover](#dns-cutover)
9. [Post-Migration Validation](#post-migration-validation)
10. [Rollback Procedure](#rollback-procedure)

## Migration Overview

### Current Setup (EC2/Vercel)
- **Backend:** EC2 instance with PostgreSQL database
- **Frontend:** Vercel hosting
- **Database:** RDS PostgreSQL or EC2-hosted PostgreSQL
- **Cost:** ~$66-86/month

### Target Setup (GCP)
- **Backend:** Cloud Run (containerized FastAPI + PostgreSQL)
- **Frontend:** Firebase Hosting
- **Database:** In-container PostgreSQL (ephemeral, auto-initialized)
- **Cost:** $0-130/month (depending on configuration)

### Key Differences

| Aspect | EC2 | Cloud Run |
|--------|-----|-----------|
| **Infrastructure** | Always running | Serverless, auto-scaling |
| **Database** | Persistent (RDS/EBS) | Ephemeral (resets on restart) |
| **Scaling** | Manual | Automatic |
| **Cost** | Fixed monthly | Pay per use |
| **Cold starts** | None | Yes (if minInstances=0) |
| **Deployment** | SSH/CI/CD | One command |

### Migration Strategy

**Zero-Downtime Migration:**
1. Deploy to GCP (parallel to EC2)
2. Test thoroughly on GCP
3. Switch DNS/traffic to GCP
4. Keep EC2 running for 1-2 weeks (backup)
5. Decommission EC2

**Timeline:** 1-2 days for migration, 1-2 weeks for validation

## Prerequisites

### Tools Required

1. **Access to current infrastructure:**
   - SSH access to EC2 instance
   - Database credentials
   - AWS Console access

2. **GCP tools installed:**
   ```bash
   # Google Cloud SDK
   gcloud --version
   
   # Firebase CLI
   firebase --version
   
   # PostgreSQL client (for data export)
   psql --version
   ```

3. **GCP project ready:**
   - Billing enabled
   - APIs enabled (run `./deploy/enable-services.sh`)

### Information Needed

- Current EC2 instance details
- Database connection string
- Current frontend URL (Vercel)
- Current backend URL (EC2)
- Environment variables from EC2

## Pre-Migration Checklist

- [ ] Document current EC2 configuration
- [ ] List all environment variables
- [ ] Identify data that needs migration
- [ ] Test backup/restore procedures
- [ ] Set up GCP project
- [ ] Enable billing on GCP
- [ ] Install required tools
- [ ] Schedule maintenance window (if needed)

## Data Export from EC2

### Step 1: Connect to EC2 Database

**If using RDS:**
```bash
# Get RDS endpoint from AWS Console
RDS_ENDPOINT="your-rds-instance.xxxxx.us-east-1.rds.amazonaws.com"
DB_NAME="cio_dashboard"
DB_USER="postgres"

# Test connection
psql -h $RDS_ENDPOINT -U $DB_USER -d $DB_NAME -c "SELECT version();"
```

**If using PostgreSQL on EC2:**
```bash
# SSH to EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Connect to local PostgreSQL
sudo -u postgres psql cio_dashboard
```

### Step 2: Export Database Schema and Data

**Option A: Full database dump (recommended)**

```bash
# Export entire database
pg_dump -h $RDS_ENDPOINT -U $DB_USER -d $DB_NAME -F c -b -v -f cio_dashboard_backup.dump

# Or in plain SQL format
pg_dump -h $RDS_ENDPOINT -U $DB_USER -d $DB_NAME > cio_dashboard_backup.sql
```

**Option B: Export specific tables (selective)**

```bash
# Export only data tables (excluding auth tables if using different system)
pg_dump -h $RDS_ENDPOINT -U $DB_USER -d $DB_NAME \
  -t executive_summary_metrics \
  -t project_summary \
  -t project_completion_trend \
  -t vulnerability_trend \
  -t portfolio_programs \
  -t application_health \
  -t technology_projects \
  -t workforce_metrics \
  -t delivery_performance \
  -t active_incidents \
  -t skills_distribution \
  -t spend_trend \
  -t spend_categories \
  > cio_dashboard_data.sql
```

**Option C: Export data only (CSV format)**

```bash
# Connect to database
psql -h $RDS_ENDPOINT -U $DB_USER -d $DB_NAME

# Export each table
\copy executive_summary_metrics TO 'executive_summary_metrics.csv' CSV HEADER;
\copy portfolio_programs TO 'portfolio_programs.csv' CSV HEADER;
\copy application_health TO 'application_health.csv' CSV HEADER;
# ... repeat for other tables
```

### Step 3: Download Export Files

```bash
# If export was done on EC2
scp -i your-key.pem ec2-user@your-ec2-ip:/path/to/backup.sql ./

# Verify file
ls -lh cio_dashboard_backup.sql
```

### Step 4: Document Environment Variables

```bash
# On EC2, list current environment variables
# From .env file or environment
cat /path/to/backend/.env

# Document:
# - ALLOWED_ORIGINS
# - JWT_SECRET_KEY
# - Any custom configurations
```

## Deploy to GCP

### Step 1: Deploy Backend to Cloud Run

```bash
# Clone repository (if not already done)
git clone https://github.com/bashatech/CIO_DASHBOARD.git
cd CIO_DASHBOARD

# Deploy backend (this auto-initializes with sample data)
./deploy/deploy-backend.sh YOUR_PROJECT_ID us-central1

# Note the backend URL
# Example: https://cio-dashboard-backend-xxx.run.app
```

### Step 2: Deploy Frontend to Firebase

```bash
# Deploy frontend
./deploy/deploy-frontend.sh https://cio-dashboard-backend-xxx.run.app YOUR_PROJECT_ID

# Note the frontend URL
# Example: https://your-project.web.app
```

### Step 3: Update CORS Configuration

```bash
# Update backend to accept requests from new frontend
gcloud run services update cio-dashboard-backend \
  --update-env-vars "ALLOWED_ORIGINS=https://your-project.web.app" \
  --region us-central1
```

## Data Import to Cloud Run

**Important:** Cloud Run with in-container PostgreSQL is ephemeral. Data resets on container restart.

### Option 1: Update database_schema.sql (Recommended)

**Best for:** Production data that should be auto-initialized

1. **Modify `database_schema.sql`:**
```bash
cd backend
# Edit database_schema.sql
# Replace sample INSERT statements with your production data
```

2. **Redeploy:**
```bash
./deploy/deploy-backend.sh YOUR_PROJECT_ID
```

3. **Benefit:** Data automatically loads on every container start

### Option 2: Manual Import via Cloud Run Exec

**Best for:** One-time data load for testing

```bash
# Copy SQL file to container
gcloud run services update cio-dashboard-backend \
  --set-env-vars "IMPORT_SQL=true" \
  --region us-central1

# This requires custom startup.sh modification (not included by default)
```

### Option 3: API-Based Import

**Best for:** Migrating active data

1. **Create import script:**
```python
# import_data.py
import requests
import csv

BACKEND_URL = "https://your-backend.run.app/api"

# Read from CSV export
with open('portfolio_programs.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        # POST to API endpoint
        response = requests.post(f"{BACKEND_URL}/portfolio/programs", json=row)
        print(f"Imported: {row['program_name']}")
```

2. **Run import:**
```bash
python import_data.py
```

### Option 4: Migrate to Cloud SQL (For Persistent Data)

**For production with data persistence requirements:**

1. **Create Cloud SQL instance:**
```bash
gcloud sql instances create cio-dashboard-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1
```

2. **Import data:**
```bash
gcloud sql import sql cio-dashboard-db gs://your-bucket/backup.sql \
  --database=cio_dashboard
```

3. **Update Cloud Run to use Cloud SQL:**
```bash
# Requires VPC connector and different configuration
# See Cloud SQL documentation
```

**Note:** This setup is beyond the current scope but recommended for production with persistent data needs.

## Parallel Testing

### Phase 1: Functional Testing

**Test on GCP deployment:**

```bash
# Run automated tests
./deploy/test-backend.sh https://cio-dashboard-backend-xxx.run.app
./deploy/test-frontend.sh https://your-project.web.app
```

**Manual testing:**
1. Open GCP frontend URL in browser
2. Test all tabs (Dashboard, Portfolio, Workforce, Projects)
3. Verify data loads correctly
4. Test authentication (if applicable)
5. Check browser console for errors

### Phase 2: Performance Testing

**Compare EC2 vs GCP:**

| Metric | EC2 | GCP |
|--------|-----|-----|
| Response time (avg) | ? | ? |
| Cold start time | N/A | ~5-10s |
| Concurrent users | ? | ? |
| Error rate | ? | ? |

**Tools:**
```bash
# Simple load test
for i in {1..100}; do
  curl -s https://your-backend.run.app/api/health > /dev/null
  echo "Request $i completed"
done

# Or use Apache Bench
ab -n 1000 -c 10 https://your-backend.run.app/api/health
```

### Phase 3: Parallel Operation

**Run both EC2 and GCP for 1-2 weeks:**

1. **Keep EC2 running** at `ec2-backend.example.com`
2. **GCP running** at `gcp-backend.run.app`
3. **Test both** with real traffic
4. **Monitor metrics:**
   - Response times
   - Error rates
   - User feedback
   - Costs

## DNS Cutover

### Option 1: Direct DNS Switch (Fastest)

**For Vercel Frontend:**
```bash
# Update Vercel environment variable
vercel env add VITE_API_URL
# Set to: https://gcp-backend.run.app/api

# Redeploy
vercel --prod
```

**For Custom Domain:**
```bash
# Update DNS records
# Change A record or CNAME to point to:
# Frontend: your-project.web.app
# Backend: cio-dashboard-backend-xxx.run.app
```

### Option 2: Gradual Traffic Shift (Safer)

**Using Load Balancer or CDN:**
1. Route 10% traffic to GCP
2. Monitor for issues
3. Increase to 50%
4. Monitor for issues
5. Increase to 100%

**Timeline:** 1-3 days

### Option 3: Blue-Green Deployment

1. Keep EC2 as "blue" (current)
2. GCP as "green" (new)
3. Switch at application level (URL toggle)
4. Quick rollback if needed

## Post-Migration Validation

### Immediate Checks (0-24 hours)

- [ ] Frontend loads correctly
- [ ] All API endpoints responding
- [ ] Authentication working
- [ ] Data displaying properly
- [ ] No console errors
- [ ] HTTPS working
- [ ] CORS configured correctly

### Monitoring (1-7 days)

- [ ] Monitor error rates
- [ ] Check response times
- [ ] Review logs daily
- [ ] Monitor costs
- [ ] Gather user feedback
- [ ] Check cold start frequency

### Performance Metrics

```bash
# Cloud Run metrics
gcloud run services describe cio-dashboard-backend \
  --region us-central1 \
  --format json

# Key metrics to watch:
# - Request count
# - Error rate
# - Latency (p50, p95, p99)
# - Container instances
# - Cold starts
```

## Rollback Procedure

### Immediate Rollback (If Critical Issue)

**Step 1: Revert DNS/Frontend**
```bash
# If using Vercel
vercel env add VITE_API_URL
# Set back to: https://ec2-backend.example.com/api
vercel --prod

# If using custom domain
# Revert DNS to EC2 IP
```

**Step 2: Verify**
```bash
# Test EC2 backend is still running
curl https://ec2-backend.example.com/api/health
```

**Step 3: Communicate**
- Notify users of temporary issue
- Document rollback reason
- Plan fixes for GCP deployment

### Graceful Rollback (If Minor Issues)

1. **Fix issues on GCP** without affecting users
2. **Test fixes** on staging URL
3. **Redeploy** when ready
4. **Re-cutover** to GCP

### Complete Rollback (Abort Migration)

1. **Ensure EC2 is stable**
2. **Point all traffic to EC2**
3. **Delete GCP resources** (optional, to stop costs)
   ```bash
   gcloud run services delete cio-dashboard-backend --region us-central1
   firebase hosting:disable
   ```

## Cost Monitoring Post-Migration

### Week 1: Monitor Closely

```bash
# Check daily costs
gcloud billing accounts list
# View in console: https://console.cloud.google.com/billing

# Adjust if costs are high
MIN_INSTANCES=0 ./deploy/deploy-backend.sh PROJECT_ID
```

### Week 2-4: Optimize

**Compare actual costs to estimates:**
- Expected: $0-130/month
- Actual: ?

**Optimize if needed:**
- Reduce min instances
- Lower memory/CPU
- Set max instances cap

## Decommissioning EC2

**After 2-4 weeks of successful GCP operation:**

### Step 1: Final Data Backup

```bash
# Create final EC2 backup
pg_dump -h $RDS_ENDPOINT -U $DB_USER -d $DB_NAME > final_backup.sql

# Store securely (S3, local archive)
```

### Step 2: Stop EC2 Instance

```bash
# Stop (don't terminate yet)
aws ec2 stop-instances --instance-ids i-xxxxx

# Monitor for 1 week - ensure no issues
```

### Step 3: Terminate Resources

**After confirming GCP is stable:**

```bash
# Terminate EC2 instance
aws ec2 terminate-instances --instance-ids i-xxxxx

# Delete RDS instance (if applicable)
aws rds delete-db-instance --db-instance-identifier your-instance \
  --final-db-snapshot-identifier final-snapshot-before-deletion

# Delete other resources (EBS volumes, security groups, etc.)
```

### Step 4: Cancel Services

- Cancel AWS billing (if no longer needed)
- Update documentation
- Celebrate successful migration! 🎉

## Migration Checklist

### Pre-Migration
- [ ] Export EC2 database
- [ ] Document environment variables
- [ ] Test GCP deployment in isolation
- [ ] Set up monitoring/alerts
- [ ] Prepare rollback plan

### Migration Day
- [ ] Deploy to GCP
- [ ] Import data (if needed)
- [ ] Run tests
- [ ] Perform DNS cutover
- [ ] Monitor closely

### Post-Migration (Week 1)
- [ ] Daily log review
- [ ] Performance monitoring
- [ ] Cost tracking
- [ ] User feedback collection
- [ ] Issue resolution

### Post-Migration (Week 2-4)
- [ ] Continued monitoring
- [ ] Cost optimization
- [ ] Performance tuning
- [ ] Final validation
- [ ] EC2 decommissioning

## Troubleshooting Common Migration Issues

See [TROUBLESHOOTING_GCP.md](TROUBLESHOOTING_GCP.md) for detailed solutions.

**Quick fixes:**
- Data not loading: Check database initialization logs
- High latency: Enable MIN_INSTANCES=1
- CORS errors: Update ALLOWED_ORIGINS
- Cold starts: Set MIN_INSTANCES=1
- High costs: Reduce resources or use scale-to-zero

## Additional Resources

- [Manual Deployment Guide](MANUAL_DEPLOYMENT_GCP.md)
- [Cost Estimates](GCP_COST_ESTIMATE.md)
- [Configuration Guide](CLOUD_RUN_CONFIGURATION.md)
- [Troubleshooting](TROUBLESHOOTING_GCP.md)

## Support

For migration assistance:
1. Check documentation
2. Review logs
3. Test thoroughly in parallel
4. Reach out to team/community

**Remember:** Take your time, test thoroughly, and keep EC2 running until confident in GCP deployment.
