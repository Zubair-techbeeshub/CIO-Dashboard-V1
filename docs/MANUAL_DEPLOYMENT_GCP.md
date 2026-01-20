# Manual GCP Deployment Guide

Complete step-by-step guide for deploying CIO Dashboard to Google Cloud Platform using Cloud Run and Firebase Hosting.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [One-Time Setup](#one-time-setup)
3. [Phase 1: Backend Deployment (Cloud Run)](#phase-1-backend-deployment-cloud-run)
4. [Phase 2: Frontend Deployment (Firebase)](#phase-2-frontend-deployment-firebase)
5. [Testing](#testing)
6. [Updating Deployments](#updating-deployments)
7. [Rollback Procedures](#rollback-procedures)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, ensure you have:

### Required Tools

1. **Google Cloud SDK (gcloud CLI)**
   - Download: https://cloud.google.com/sdk/docs/install
   - Install and authenticate:
     ```bash
     # Install gcloud SDK (follow instructions for your OS)
     
     # Login to GCP
     gcloud auth login
     
     # Set your project
     gcloud config set project YOUR_PROJECT_ID
     ```

2. **Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

3. **Node.js and npm**
   - Version 18 or higher
   - Download: https://nodejs.org/

4. **Git**
   - To clone the repository

### GCP Account Requirements

- Active Google Cloud Platform account
- Billing enabled on your project
- Sufficient permissions to:
  - Create Cloud Run services
  - Enable APIs
  - Deploy to Firebase Hosting

### Estimated Costs

See [GCP_COST_ESTIMATE.md](GCP_COST_ESTIMATE.md) for detailed cost breakdown.
- **Development/Testing**: ~$0-5/month (with scale-to-zero)
- **Production**: ~$20-100/month (depending on traffic)

## One-Time Setup

### Step 1: Create GCP Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Note your PROJECT_ID (e.g., `cio-dashboard-prod`)

### Step 2: Enable Billing

1. In GCP Console, go to **Billing**
2. Link a billing account to your project

### Step 3: Clone Repository

```bash
git clone https://github.com/bashatech/CIO_DASHBOARD.git
cd CIO_DASHBOARD
```

### Step 4: Enable Required Services

Run the service enablement script:

```bash
./deploy/enable-services.sh
```

This will enable:
- Cloud Run API
- Container Registry API
- Cloud Build API
- Artifact Registry API

### Step 5: Initialize Firebase

```bash
# Initialize Firebase in your project
firebase init hosting

# When prompted:
# - Select "Use an existing project"
# - Choose your GCP project
# - Public directory: dist
# - Single-page app: Yes
# - Overwrite index.html: No
```

Alternatively, update `.firebaserc` with your project ID:
```json
{
  "projects": {
    "default": "YOUR_PROJECT_ID"
  }
}
```

## Phase 1: Backend Deployment (Cloud Run)

### Option A: Deploy Backend Only

```bash
./deploy/deploy-backend.sh YOUR_PROJECT_ID [REGION]
```

Example:
```bash
./deploy/deploy-backend.sh cio-dashboard-prod us-central1
```

**What this does:**
1. Builds a Docker container with PostgreSQL + FastAPI
2. Pushes to Google Container Registry
3. Deploys to Cloud Run
4. Initializes database schema automatically
5. Returns the backend URL

**Configuration Options:**

```bash
# Scale-to-zero (cost-optimized, default)
./deploy/deploy-backend.sh YOUR_PROJECT_ID

# Always-on (better performance)
MIN_INSTANCES=1 ./deploy/deploy-backend.sh YOUR_PROJECT_ID

# Custom resources
MEMORY=4Gi CPU=4 ./deploy/deploy-backend.sh YOUR_PROJECT_ID

# Custom service name
SERVICE_NAME=my-backend ./deploy/deploy-backend.sh YOUR_PROJECT_ID
```

### Expected Output

```
🚀 Deploying CIO Dashboard Backend to Cloud Run
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Project ID:       cio-dashboard-prod
📍 Region:           us-central1
📍 Service Name:     cio-dashboard-backend
📍 Memory:           2Gi
📍 CPU:              2
📍 Min Instances:    0
📍 Max Instances:    5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Building and deploying to Cloud Run...
   This may take 5-10 minutes...

✅ Backend deployed successfully!
🌐 Backend URL: https://cio-dashboard-backend-xxx.run.app
📄 API Docs:    https://cio-dashboard-backend-xxx.run.app/docs
```

### Verify Backend

1. **Test health endpoint:**
   ```bash
   curl https://your-backend-url.run.app/api/health
   ```

2. **View API documentation:**
   Open: `https://your-backend-url.run.app/docs`

3. **Run automated tests:**
   ```bash
   ./deploy/test-backend.sh https://your-backend-url.run.app
   ```

## Phase 2: Frontend Deployment (Firebase)

### Deploy Frontend

```bash
./deploy/deploy-frontend.sh BACKEND_URL [PROJECT_ID]
```

Example:
```bash
./deploy/deploy-frontend.sh https://cio-dashboard-backend-xxx.run.app cio-dashboard-prod
```

**What this does:**
1. Creates `.env` with backend URL
2. Installs npm dependencies
3. Builds production frontend
4. Deploys to Firebase Hosting
5. Returns the frontend URL

### Expected Output

```
🚀 Deploying CIO Dashboard Frontend to Firebase Hosting
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Backend URL: https://cio-dashboard-backend-xxx.run.app
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 Configuring environment variables...
📦 Installing dependencies...
🔨 Building frontend...
🚀 Deploying to Firebase Hosting...

✅ Frontend deployed successfully!
🌐 Frontend URL: https://cio-dashboard-prod.web.app
```

### Verify Frontend

1. **Open in browser:**
   Visit: `https://your-project.web.app`

2. **Run automated tests:**
   ```bash
   ./deploy/test-frontend.sh https://your-project.web.app
   ```

### Update CORS Settings

After frontend deployment, update backend CORS:

```bash
gcloud run services update cio-dashboard-backend \
  --update-env-vars ALLOWED_ORIGINS=https://your-project.web.app \
  --region us-central1 \
  --project YOUR_PROJECT_ID
```

## Complete Deployment (Both Backend + Frontend)

### One Command Deployment

```bash
./deploy/deploy-all.sh YOUR_PROJECT_ID [REGION]
```

This orchestrates the complete deployment:
1. Enables GCP services (if needed)
2. Deploys backend to Cloud Run
3. Deploys frontend to Firebase
4. Updates CORS configuration
5. Provides summary of URLs

## Testing

### Backend Tests

```bash
./deploy/test-backend.sh https://your-backend-url.run.app
```

Tests:
- ✓ Root endpoint
- ✓ API documentation
- ✓ Health check
- ✓ Dashboard metrics
- ✓ Portfolio programs
- ✓ Workforce metrics
- ✓ Projects
- ✓ Database connectivity

### Frontend Tests

```bash
./deploy/test-frontend.sh https://your-project.web.app
```

Tests:
- ✓ Home page loads
- ✓ SPA routing
- ✓ Static assets
- ✓ JavaScript bundle
- ✓ Environment configuration
- ✓ Backend connectivity
- ✓ HTTPS enabled

### Manual Testing

1. **Open frontend URL in browser**
2. **Test navigation:**
   - Dashboard tab
   - Portfolio tab
   - Workforce tab
   - Projects tab
3. **Check browser console** for errors
4. **Verify data loads** in all sections

## Updating Deployments

### Update Backend

```bash
# Make your code changes in backend/
./deploy/deploy-backend.sh YOUR_PROJECT_ID

# Or with custom settings
MIN_INSTANCES=1 MEMORY=4Gi ./deploy/deploy-backend.sh YOUR_PROJECT_ID
```

### Update Frontend

```bash
# Make your code changes in src/
./deploy/deploy-frontend.sh https://your-backend-url.run.app

# Or read backend URL from saved file
./deploy/deploy-frontend.sh $(cat .backend-url.txt)
```

### Update Environment Variables

**Backend:**
```bash
gcloud run services update cio-dashboard-backend \
  --update-env-vars KEY=VALUE \
  --region us-central1
```

**Frontend:**
```bash
# Update .env file
echo "VITE_API_URL=https://new-backend-url.run.app/api" > .env

# Redeploy
npm run build
firebase deploy --only hosting
```

## Rollback Procedures

### Rollback Backend

```bash
# List previous revisions
gcloud run revisions list --service cio-dashboard-backend --region us-central1

# Rollback to specific revision
gcloud run services update-traffic cio-dashboard-backend \
  --to-revisions REVISION_NAME=100 \
  --region us-central1
```

### Rollback Frontend

```bash
# List deployment history
firebase hosting:releases:list

# Rollback to previous version
firebase hosting:rollback
```

## Troubleshooting

For detailed troubleshooting, see [TROUBLESHOOTING_GCP.md](TROUBLESHOOTING_GCP.md)

### Quick Fixes

**Backend not starting:**
```bash
# Check logs
gcloud run services logs read cio-dashboard-backend --region us-central1

# Common issues:
# - PostgreSQL initialization failed: Check startup.sh
# - Memory limit: Increase MEMORY=4Gi
# - Timeout: Increase TIMEOUT=600
```

**Frontend not loading:**
```bash
# Check Firebase logs
firebase hosting:channel:list

# Common issues:
# - Build failed: Check package.json scripts
# - CORS errors: Update backend ALLOWED_ORIGINS
# - API not reachable: Check .env VITE_API_URL
```

**Cold start issues:**
```bash
# Set minimum instances to keep service warm
MIN_INSTANCES=1 ./deploy/deploy-backend.sh YOUR_PROJECT_ID
```

## Cost Optimization

See [GCP_COST_ESTIMATE.md](GCP_COST_ESTIMATE.md) for detailed analysis.

**Recommendations:**
- **Development:** Use `MIN_INSTANCES=0` (scale-to-zero)
- **Production:** Use `MIN_INSTANCES=1` (no cold starts)
- **High traffic:** Increase `MAX_INSTANCES` as needed

## Security Considerations

1. **Use environment variables** for secrets (never commit)
2. **Enable authentication** on Cloud Run if needed
3. **Configure CORS** properly with specific origins
4. **Review IAM permissions** regularly
5. **Use HTTPS** (automatic with Cloud Run and Firebase)

## Next Steps

1. **Configure custom domain** (optional)
2. **Set up monitoring** with Cloud Monitoring
3. **Configure alerts** for errors and performance
4. **Plan data backup** strategy
5. **Review** [CLOUD_RUN_CONFIGURATION.md](CLOUD_RUN_CONFIGURATION.md)

## Additional Resources

- [Cloud Run Configuration](CLOUD_RUN_CONFIGURATION.md)
- [Cost Estimates](GCP_COST_ESTIMATE.md)
- [Troubleshooting](TROUBLESHOOTING_GCP.md)
- [Migration Guide](MIGRATION_EC2_TO_GCP.md)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
