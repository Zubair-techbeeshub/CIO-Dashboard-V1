# GCP Deployment Troubleshooting Guide

Common issues and solutions for deploying CIO Dashboard to Google Cloud Platform.

## Table of Contents

1. [Deployment Issues](#deployment-issues)
2. [Backend Issues](#backend-issues)
3. [Frontend Issues](#frontend-issues)
4. [Database Issues](#database-issues)
5. [Performance Issues](#performance-issues)
6. [Cost Issues](#cost-issues)
7. [Security Issues](#security-issues)

## Deployment Issues

### Error: gcloud command not found

**Symptom:**
```
./deploy/deploy-backend.sh: line 10: gcloud: command not found
```

**Solution:**
Install Google Cloud SDK:
```bash
# macOS
brew install --cask google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Windows
# Download from: https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### Error: firebase command not found

**Symptom:**
```
./deploy/deploy-frontend.sh: line 15: firebase: command not found
```

**Solution:**
```bash
npm install -g firebase-tools
firebase login
```

### Error: API not enabled

**Symptom:**
```
ERROR: (gcloud.run.deploy) Cloud Run API has not been enabled for project
```

**Solution:**
```bash
./deploy/enable-services.sh

# Or manually
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### Error: Billing not enabled

**Symptom:**
```
ERROR: Billing must be enabled for activation of service
```

**Solution:**
1. Go to [GCP Console → Billing](https://console.cloud.google.com/billing)
2. Link a billing account to your project
3. Retry deployment

### Error: Insufficient permissions

**Symptom:**
```
ERROR: (gcloud.run.deploy) PERMISSION_DENIED: The caller does not have permission
```

**Solution:**
```bash
# Check your current account
gcloud auth list

# Make sure you're using the correct account
gcloud config set account YOUR_EMAIL

# Grant necessary permissions (as project owner)
# Cloud Run Admin, Service Account User, Storage Admin
```

## Backend Issues

### Container fails to start

**Symptom:**
Cloud Run shows service as unhealthy, container restarts repeatedly.

**Check logs:**
```bash
gcloud run services logs read cio-dashboard-backend \
  --region us-central1 \
  --limit 100
```

**Common causes:**

#### 1. PostgreSQL initialization failed

**Symptom in logs:**
```
FATAL: could not create shared memory segment
FATAL: data directory is not initialized
```

**Solution:**
Increase memory allocation:
```bash
MEMORY=2Gi ./deploy/deploy-backend.sh PROJECT_ID

# Or edit existing service
gcloud run services update cio-dashboard-backend \
  --memory 2Gi \
  --region us-central1
```

#### 2. Port binding issue

**Symptom in logs:**
```
Error: Cannot bind to port 8000
```

**Solution:**
Cloud Run requires port 8000 (already configured correctly in Dockerfile.cloudrun).

#### 3. Timeout during startup

**Symptom:**
Container killed after 4-10 minutes.

**Solution:**
```bash
# Increase startup timeout
TIMEOUT=600 ./deploy/deploy-backend.sh PROJECT_ID

# Or
gcloud run services update cio-dashboard-backend \
  --timeout 600 \
  --region us-central1
```

#### 4. Out of memory

**Symptom in logs:**
```
Container killed with signal 9 (SIGKILL)
Memory limit exceeded
```

**Solution:**
```bash
# Increase memory
MEMORY=4Gi ./deploy/deploy-backend.sh PROJECT_ID
```

### Database schema not applied

**Symptom:**
API returns errors about missing tables.

**Check logs:**
```bash
gcloud run services logs read cio-dashboard-backend --region us-central1 | grep -i "schema\|table"
```

**Solution:**
```bash
# Redeploy to trigger database initialization
./deploy/deploy-backend.sh PROJECT_ID

# Or manually check startup.sh logs
gcloud run services logs read cio-dashboard-backend --region us-central1 | grep -i "startup"
```

### API returns 502/503 errors

**Symptom:**
```
Error: 502 Bad Gateway
Error: 503 Service Unavailable
```

**Possible causes:**

1. **Cold start timeout:**
```bash
# Keep service warm
MIN_INSTANCES=1 ./deploy/deploy-backend.sh PROJECT_ID
```

2. **Request timeout:**
```bash
# Increase timeout
TIMEOUT=300 ./deploy/deploy-backend.sh PROJECT_ID
```

3. **Resource exhaustion:**
```bash
# Increase resources
MEMORY=4Gi CPU=4 ./deploy/deploy-backend.sh PROJECT_ID
```

### CORS errors

**Symptom:**
Browser console shows:
```
Access to fetch at 'https://backend.run.app/api/...' from origin 'https://frontend.web.app'
has been blocked by CORS policy
```

**Solution:**
```bash
# Update ALLOWED_ORIGINS
gcloud run services update cio-dashboard-backend \
  --update-env-vars "ALLOWED_ORIGINS=https://your-frontend.web.app,https://your-frontend.firebaseapp.com" \
  --region us-central1
```

Verify in backend environment:
```bash
gcloud run services describe cio-dashboard-backend \
  --region us-central1 \
  --format="value(spec.template.spec.containers[0].env)"
```

## Frontend Issues

### Build fails

**Symptom:**
```
ERROR: Build failed
npm ERR! code ELIFECYCLE
```

**Solutions:**

1. **Check Node version:**
```bash
node --version  # Should be 18+
nvm use 18
```

2. **Clear cache and reinstall:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

3. **Check TypeScript errors:**
```bash
npm run build 2>&1 | grep -i "error"
```

### Frontend shows blank page

**Symptom:**
White screen after deployment, no content.

**Check browser console:**
Press F12, look for errors.

**Common causes:**

1. **Incorrect API URL:**
```bash
# Check .env file
cat .env

# Should be:
VITE_API_URL=https://your-backend.run.app/api

# Rebuild and redeploy
./deploy/deploy-frontend.sh https://your-backend.run.app
```

2. **Missing environment variable:**
```bash
# Check if VITE_API_URL is used in code
grep -r "VITE_API_URL" src/
```

3. **Build artifacts issue:**
```bash
# Clean and rebuild
rm -rf dist
npm run build
firebase deploy --only hosting
```

### 404 errors on page refresh

**Symptom:**
Direct URLs work, but refreshing returns 404.

**Solution:**
Check `firebase.json` rewrites:
```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

Already configured correctly in the provided `firebase.json`.

### API calls fail from frontend

**Symptom:**
Frontend loads, but data doesn't appear.

**Check browser console:**
Look for network errors (F12 → Network tab).

**Solutions:**

1. **Verify backend URL:**
```bash
curl https://your-backend.run.app/api/health
```

2. **Check CORS configuration** (see Backend CORS errors above)

3. **Verify backend is deployed:**
```bash
gcloud run services describe cio-dashboard-backend --region us-central1
```

## Database Issues

### PostgreSQL won't start

**Symptom in logs:**
```
FATAL: could not create lock file
FATAL: data directory is not initialized
```

**Solution:**

1. **Check startup.sh logs:**
```bash
gcloud run services logs read cio-dashboard-backend --region us-central1 | grep -i "postgres\|database"
```

2. **Verify permissions:**
Dockerfile.cloudrun sets correct permissions. If issues persist:
```bash
# Redeploy
./deploy/deploy-backend.sh PROJECT_ID
```

3. **Increase memory:**
```bash
MEMORY=4Gi ./deploy/deploy-backend.sh PROJECT_ID
```

### Database connection refused

**Symptom:**
```
psycopg2.OperationalError: could not connect to server: Connection refused
```

**Solution:**

1. **Check DB_HOST:**
```bash
gcloud run services describe cio-dashboard-backend \
  --region us-central1 \
  --format="value(spec.template.spec.containers[0].env)" | grep DB_HOST
```

Should be `localhost` (not `127.0.0.1` or external address).

2. **Verify PostgreSQL is running:**
```bash
gcloud run services logs read cio-dashboard-backend --region us-central1 | grep "postgres.*ready"
```

### Data not persisting

**Symptom:**
Data disappears after container restart.

**Expected behavior:**
PostgreSQL data is ephemeral in this setup (resets on restart).

**Solution:**
This is by design for Cloud Run with in-container database. Data is re-initialized from `database_schema.sql` on each startup.

**For persistent data:**
1. Migrate to Cloud SQL (separate database service)
2. Use Cloud Storage for data export/import
3. See [MIGRATION_EC2_TO_GCP.md](MIGRATION_EC2_TO_GCP.md)

## Performance Issues

### Slow cold starts (5-30 seconds)

**Symptom:**
First request after idle period takes 5-30 seconds.

**Solution:**

1. **Enable always-on:**
```bash
MIN_INSTANCES=1 ./deploy/deploy-backend.sh PROJECT_ID
```

2. **Optimize Docker image:**
- Reduce image size
- Minimize startup scripts

3. **Use Cloud Run minimum instances:**
```bash
MIN_INSTANCES=2 ./deploy/deploy-backend.sh PROJECT_ID
```

### High latency (>1s response time)

**Symptom:**
API requests take >1 second consistently.

**Solutions:**

1. **Increase CPU:**
```bash
CPU=4 ./deploy/deploy-backend.sh PROJECT_ID
```

2. **Increase memory:**
```bash
MEMORY=4Gi ./deploy/deploy-backend.sh PROJECT_ID
```

3. **Check database queries:**
```bash
# Add indexes to frequently queried columns
# Optimize slow queries
```

4. **Enable connection pooling** (already enabled in FastAPI)

5. **Add caching layer** (Redis/Memcache)

### Container instances keep restarting

**Symptom:**
Metrics show frequent instance restarts.

**Check logs:**
```bash
gcloud run services logs read cio-dashboard-backend --region us-central1 --limit 200
```

**Common causes:**

1. **Memory leaks:**
   - Monitor memory usage over time
   - Check for unclosed database connections

2. **Request timeout:**
   ```bash
   TIMEOUT=600 ./deploy/deploy-backend.sh PROJECT_ID
   ```

3. **Health check failures:**
   - Verify `/docs` endpoint is accessible
   - Check health check logs

## Cost Issues

### Unexpected high costs

**Symptom:**
Billing shows higher than expected charges.

**Investigate:**

1. **Check current spend:**
```bash
gcloud billing accounts list
# View in console: https://console.cloud.google.com/billing
```

2. **Review Cloud Run metrics:**
```bash
gcloud run services describe cio-dashboard-backend --region us-central1
```

3. **Identify cost drivers:**
- Always-on instances (minInstances≥1)
- High traffic
- Excessive scaling
- Large memory/CPU allocation

**Solutions:**

1. **Enable scale-to-zero:**
```bash
MIN_INSTANCES=0 ./deploy/deploy-backend.sh PROJECT_ID
```

2. **Reduce resources:**
```bash
MEMORY=1Gi CPU=1 ./deploy/deploy-backend.sh PROJECT_ID
```

3. **Set max instances:**
```bash
MAX_INSTANCES=5 ./deploy/deploy-backend.sh PROJECT_ID
```

4. **Review and remove unused services:**
```bash
gcloud run services list
gcloud run services delete OLD_SERVICE
```

See [GCP_COST_ESTIMATE.md](GCP_COST_ESTIMATE.md) for detailed analysis.

## Security Issues

### Service is publicly accessible

**Expected:**
Cloud Run service is public by default (with `--allow-unauthenticated`).

**To restrict access:**

1. **Require IAM authentication:**
```bash
gcloud run services update cio-dashboard-backend \
  --no-allow-unauthenticated \
  --region us-central1
```

2. **Use Cloud Armor for IP filtering** (requires Load Balancer)

3. **Implement application-level auth** (JWT - already included)

### Environment variables exposed

**Concern:**
Environment variables visible in Cloud Console.

**Solution:**
Use Secret Manager for sensitive data:

```bash
# Create secret
echo -n "super-secret-password" | gcloud secrets create db-password --data-file=-

# Use in Cloud Run
gcloud run services update cio-dashboard-backend \
  --update-secrets DB_PASSWORD=db-password:latest \
  --region us-central1
```

### HTTPS not enforced

**Status:**
Cloud Run automatically enforces HTTPS. HTTP requests are redirected to HTTPS.

**Verify:**
```bash
curl -I http://your-service.run.app
# Should return: 301 Moved Permanently
```

## Diagnostic Commands

### Check service status

```bash
gcloud run services describe cio-dashboard-backend --region us-central1
```

### View recent logs

```bash
gcloud run services logs read cio-dashboard-backend \
  --region us-central1 \
  --limit 100
```

### View real-time logs

```bash
gcloud run services logs tail cio-dashboard-backend --region us-central1
```

### Check revisions

```bash
gcloud run revisions list --service cio-dashboard-backend --region us-central1
```

### View metrics

```bash
gcloud run services describe cio-dashboard-backend \
  --region us-central1 \
  --format json
```

### Test endpoint

```bash
# Health check
curl https://your-service.run.app/api/health

# API docs
curl https://your-service.run.app/docs

# Specific endpoint
curl https://your-service.run.app/api/dashboard/metrics
```

## Getting Help

If issues persist after trying these solutions:

1. **Check Cloud Run Status:**
   https://status.cloud.google.com/

2. **Review logs thoroughly:**
   ```bash
   gcloud run services logs read cio-dashboard-backend --region us-central1 --limit 500
   ```

3. **Check Stack Overflow:**
   Search for Cloud Run specific errors

4. **GCP Support:**
   https://cloud.google.com/support

5. **GitHub Issues:**
   Open an issue in the repository with:
   - Deployment script used
   - Error messages
   - Relevant logs
   - Steps to reproduce

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Run Troubleshooting](https://cloud.google.com/run/docs/troubleshooting)
- [Deployment Guide](MANUAL_DEPLOYMENT_GCP.md)
- [Configuration Guide](CLOUD_RUN_CONFIGURATION.md)
- [Cost Estimates](GCP_COST_ESTIMATE.md)
