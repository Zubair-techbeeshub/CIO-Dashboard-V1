# CIO Dashboard Deployment Guide
## Frontend: Firebase Hosting | Backend: Render

This guide provides step-by-step instructions for deploying the CIO Dashboard with Firebase authentication to production.

## 📋 Prerequisites

### Firebase Hosting
- Firebase project created and configured
- Firebase CLI installed
- Firebase authentication enabled
- Service account JSON file downloaded

### Render
- Render account created (https://render.com)
- Git repository with backend code
- PostgreSQL database (if using database)
- Render CLI installed (optional)

### General
- Node.js and npm installed
- Python and pip installed
- Git installed

## 🚀 Deployment Architecture

```
Firebase Hosting (Frontend)
    ↓ (API Calls)
Render (Backend API)
    ↓ (Data)
PostgreSQL Database / CSV Files
```

## 📦 Part 1: Frontend Deployment to Firebase Hosting

### Step 1: Build the Frontend for Production

```bash
cd C:\Users\AACS\CIO_DASHBOARD
npm run build
```

This creates a `dist` folder with optimized production files.

### Step 2: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 3: Initialize Firebase Hosting

```bash
firebase login
firebase init hosting
```

**During initialization:**
- Select your existing Firebase project: `cio-dashboard-app`
- Use `dist` as the public directory
- Configure as a single-page app: **Yes**
- Set up automatic builds with GitHub: **No** (we'll do manual builds)

### Step 4: Configure firebase.json

Update `firebase.json` (already configured):

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|ico)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "index.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=0, must-revalidate"
          }
        ]
      }
    ],
    "cleanUrls": true,
    "trailingSlash": false
  }
}
```

### Step 5: Update Production Environment Variables

Create `.env.production`:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyCx6llIFyCe-glHlFptvAzAjSBUrjr32Pw
VITE_FIREBASE_AUTH_DOMAIN=cio-dashboard-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cio-dashboard-app
VITE_FIREBASE_STORAGE_BUCKET=cio-dashboard-app.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=335763328023
VITE_FIREBASE_APP_ID=1:335763328023:web:566014bbe511f9227ee052

# API Configuration - PRODUCTION RENDER URL
VITE_API_URL=https://your-render-app.onrender.com

# Tenant Configuration
VITE_TENANT_ID=american_logics
```

### Step 6: Build with Production Environment

```bash
npm run build
```

### Step 7: Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

**Expected Output:**
```
✔ Deploy complete!
Project: cio-dashboard-app
Site: cio-dashboard-app
Hosting URL: https://cio-dashboard-app.web.app
```

### Step 8: Verify Frontend Deployment

Visit: `https://cio-dashboard-app.web.app`

You should see the login page (redirected from root).

## 🐳 Part 2: Backend Deployment to Render

### Step 1: Prepare Backend for Deployment

#### Update backend/requirements.txt

Ensure all dependencies are listed:

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-dotenv==1.0.0
firebase-admin==6.3.0
pydantic==2.5.0
pydantic-settings==2.1.0
pandas==2.1.4
gunicorn==21.2.0
```

#### Create render.yaml

Create `backend/render.yaml`:

```yaml
services:
  - type: web
    name: cio-dashboard-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
    envVars:
      - key: PORT
        value: 8000
      - key: ALLOWED_ORIGINS
        value: https://cio-dashboard-app.web.app
      - key: DEFAULT_TENANT
        value: american_logics
      - key: FIREBASE_PROJECT_ID
        sync: false
      - key: FIREBASE_CLIENT_EMAIL
        sync: false
      - key: FIREBASE_PRIVATE_KEY
        sync: false
```

#### Create Dockerfile (Alternative Method)

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["gunicorn", "main:app", "--workers", "1", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

#### Create .dockerignore

Create `backend/.dockerignore`:

```
__pycache__
*.pyc
*.pyo
*.pyd
.Python
*.so
*.egg
*.egg-info
dist
build
.pytest_cache
.coverage
.env
.env.local
.venv
venv
.git
.gitignore
node_modules
data
!requirements.txt
!Dockerfile
!service-account.json
!*-firebase-adminsdk-*.json
!*.py
```

### Step 2: Push Backend Code to Git Repository

```bash
cd C:\Users\AACS\CIO_DASHBOARD\backend
git init
git add .
git commit -m "Initial backend deployment"
git remote add origin <your-git-repository-url>
git push -u origin master
```

### Step 3: Deploy to Render

#### Option A: Using Render Dashboard (Web UI) - RECOMMENDED

1. **Login to Render**: https://dashboard.render.com
2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your Git repository (GitHub, GitLab, or Bitbucket)
   - Select branch: `master` or `main`
   - Set root directory: `/backend` (if backend is in subdirectory)

3. **Configure Service**:
   - **Name**: `cio-dashboard-backend`
   - **Region**: Choose nearest region (e.g., Oregon, Frankfurt, Singapore)
   - **Runtime**: Python 3.11
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`

4. **Configure Environment Variables**:
   ```
   PORT=8000
   ALLOWED_ORIGINS=https://cio-dashboard-app.web.app
   DEFAULT_TENANT=american_logics
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account-email
   FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
   ```

5. **Advanced Settings**:
   - **Instance Type**: Free (for testing) or Starter ($7/month)
   - **Health Check Path**: `/api/health`
   - **Auto-Deploy**: Enabled (automatic deployments on git push)

6. **Deploy Service**:
   - Click "Create Web Service"
   - Wait for deployment to complete (2-5 minutes)

#### Option B: Using Render Blueprint (render.yaml)

1. **Push render.yaml to your repository**
2. **Login to Render Dashboard**
3. **Click "New +" → "Blueprint"**
4. **Connect your Git repository**
5. **Select the render.yaml file**
6. **Click "Apply Blueprint"**

#### Option C: Using Render CLI

```bash
# Install Render CLI
npm install -g @render-cli/render

# Login
render login

# Create service
render create web-service \
  --name cio-dashboard-backend \
  --region oregon \
  --runtime python \
  --build-command "pip install -r requirements.txt" \
  --start-command "gunicorn main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT" \
  --env PORT=8000 \
  --env ALLOWED_ORIGINS=https://cio-dashboard-app.web.app \
  --env DEFAULT_TENANT=american_logics
```

### Step 4: Configure Firebase Service Account in Render

**Important**: You need to make the Firebase service account JSON available to the Render deployment.

#### Method 1: Environment Variables (Recommended)

1. **Convert service account JSON to environment variables**:
   - Read your `service-account.json` file
   - Add each field as an environment variable in Render:
     ```
     FIREBASE_PROJECT_ID=cio-dashboard-app
     FIREBASE_CLIENT_EMAIL=cio-dashboard-app@cio-dashboard-app.iam.gserviceaccount.com
     FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
     FIREBASE_PRIVATE_KEY_ID=1a2b3c4d5e6f
     FIREBASE_CLIENT_ID=123456789012345678901
     ```

2. **Add to Render Environment Variables**:
   - Go to your Render service dashboard
   - Click "Environment" tab
   - Add each variable
   - For `FIREBASE_PRIVATE_KEY`, make sure to include the `\n` for newlines

#### Method 2: Render Secret (More Secure)

1. **Create Render Secret**:
   - Go to Render Dashboard → Secrets
   - Click "New Secret"
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Paste the entire service account JSON content
   - Click "Create Secret"

2. **Reference Secret in Service**:
   - Update `render.yaml` to reference the secret
   - Or add secret reference in environment variables

### Step 5: Update CORS Configuration

The backend `ALLOWED_ORIGINS` must include the Firebase Hosting URL:

```env
ALLOWED_ORIGINS=https://cio-dashboard-app.web.app,https://cio-dashboard-app.firebaseapp.com
```

Add this to Render environment variables.

### Step 6: Verify Backend Deployment

1. **Get Render service URL**:
   - From Render dashboard: `https://cio-dashboard-backend.onrender.com`

2. **Test API endpoint**:
   ```bash
   curl https://cio-dashboard-backend.onrender.com/api/health
   ```

3. **Expected response**:
   ```json
   {
     "status": "healthy",
     "service": "CIO Dashboard API",
     "version": "1.0.0"
   }
   ```

### Step 7: Enable Render Health Checks

1. **Go to Render Service Dashboard**
2. **Click "Settings"**
3. **Health Check Path**: `/api/health`
4. **Health Check Interval**: 30 seconds
5. **Save changes**

This ensures Render automatically restarts the service if it becomes unhealthy.

## 🔧 Part 3: Production Configuration Updates

### Update Frontend API URL

In `.env.production`:
```env
VITE_API_URL=https://cio-dashboard-backend.onrender.com
```

Rebuild and redeploy:
```bash
npm run build
firebase deploy --only hosting
```

### Update Backend CORS

In Render environment variables:
```env
ALLOWED_ORIGINS=https://cio-dashboard-app.web.app
```

### Update Firebase Auth Domain

In `.env.production`:
```env
VITE_FIREBASE_AUTH_DOMAIN=cio-dashboard-app.firebaseapp.com
```

## 🧪 Part 4: Testing Production Deployment

### Test 1: Frontend Access
1. Visit: `https://cio-dashboard-app.web.app`
2. Should redirect to login page
3. Enter Firebase test user credentials
4. Should redirect to dashboard

### Test 2: API Connectivity
1. Open browser DevTools (F12)
2. Go to Network tab
3. Login to dashboard
4. Check API calls to Render backend
5. Verify responses contain data

### Test 3: Authentication Flow
1. Test login with valid credentials
2. Test login with invalid credentials
3. Test logout functionality
4. Test session persistence (refresh page)

### Test 4: CORS Configuration
1. Check browser console for CORS errors
2. Verify API calls from Firebase domain work
3. Verify requests from other domains are blocked

### Test 5: Render Health Check
1. Go to Render service dashboard
2. Check service status (should be "Live")
3. Check health check status (should be "Healthy")
4. Review logs for any errors

## 🔄 Part 5: Continuous Deployment

### Frontend (Firebase)

#### Option A: Manual Deployment
```bash
npm run build
firebase deploy --only hosting
```

#### Option B: GitHub Actions (Automatic)

Create `.github/workflows/deploy-firebase.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [master]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          
      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only hosting
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

### Backend (Render)

Render supports automatic deployments from Git:
- Push to your Git repository
- Render automatically detects changes
- Rebuilds and redeploys the service

You can also:
- Enable manual deployments in Render dashboard
- Set up deployment hooks
- Configure branch-specific deployments

## 📊 Part 6: Monitoring and Logs

### Firebase Hosting
- **Firebase Console**: Hosting → Analytics
- **Firebase CLI**: `firebase hosting:sites:default:logs`

### Render
- **Render Dashboard**: Service → Logs
- **Render CLI**: `render logs cio-dashboard-backend`
- **Metrics**: Service → Metrics tab
- **Deployments**: Service → Deployments tab

### Monitoring Features
- Real-time logs
- Error tracking
- Performance metrics
- Deployment history
- Health check status

## 🔒 Part 7: Security Considerations

### Firebase Hosting
- **HTTPS**: Automatic SSL certificates
- **Authentication**: Firebase Auth protects routes
- **Environment Variables**: Use GitHub Secrets for sensitive data

### Render
- **HTTPS**: Automatic SSL certificates
- **Secrets Management**: Use Render Secrets for sensitive data
- **Service Account**: Never commit service account JSON to git
- **Private Repositories**: Keep backend code private

### General
- **API Keys**: Use environment variables
- **Database**: Use strong passwords
- **CORS**: Restrict to Firebase domain only
- **Rate Limiting**: Implement if needed
- **Firewall**: Configure Render firewall rules if needed

## 🐛 Part 8: Troubleshooting

### Common Issues

#### Frontend Issues

**Issue: Blank page after deployment**
- Check `firebase.json` rewrites configuration
- Verify build completed successfully
- Check browser console for errors
- Clear browser cache

**Issue: CORS errors**
- Verify `ALLOWED_ORIGINS` includes Firebase domain
- Check backend CORS configuration
- Verify API URL is correct
- Check Render service is running

**Issue: Firebase authentication not working**
- Verify Firebase config in `.env.production`
- Check Firebase Console authentication settings
- Verify Firebase project is correct
- Check Firebase Auth domain

#### Backend Issues

**Issue: Service won't start**
- Check Render service logs
- Verify all dependencies in `requirements.txt`
- Check start command is correct
- Verify Python version compatibility

**Issue: Deployment fails**
- Check build logs in Render dashboard
- Verify requirements.txt is correct
- Check for missing dependencies
- Verify Python version

**Issue: Firebase Admin SDK initialization failed**
- Verify service account environment variables
- Check Firebase service account permissions
- Verify project ID matches
- Check private key format (include \n for newlines)

**Issue: Database connection errors**
- Verify database URL in environment variables
- Check database is accessible from Render
- Verify database credentials
- Check database is running

**Issue: Health check failing**
- Verify health check path is correct
- Check service is responding
- Review service logs
- Verify PORT environment variable

### Debug Commands

```bash
# Firebase hosting logs
firebase hosting:sites:default:logs

# Render service logs (via dashboard)
# Go to Render Dashboard → Service → Logs

# Test API endpoint
curl https://your-service.onrender.com/api/health

# Test with authentication
curl -H "Authorization: Bearer <token>" https://your-service.onrender.com/api/dashboard/executive-summary
```

## 📝 Part 9: Cost Estimation

### Firebase Hosting
- **Free Tier**: 10 GB/month storage, 10 GB/month bandwidth
- **Pay as you go**: $0.026/GB for storage, $0.15/GB for bandwidth
- **Estimated**: Free tier sufficient for most dashboards

### Render
- **Free Tier**: 750 hours/month, 0.1 CPU, 512MB RAM
- **Starter**: $7/month (0.5 CPU, 512MB RAM)
- **Standard**: $25/month (1 CPU, 2GB RAM)
- **Estimated**: Free tier for testing, $7/month for production

### PostgreSQL (if needed)
- **Free Tier**: 90 days, 1GB
- **Production**: $7/month (1GB)
- **Estimated**: $7/month if using database

### Total Estimated Cost
- **Development/Testing**: Free
- **Production**: $7-14/month (depending on database)

## 🎉 Part 10: Post-Deployment Checklist

- [ ] Frontend deployed to Firebase Hosting
- [ ] Backend deployed to Render
- [ ] Firebase authentication working
- [ ] API calls to Render successful
- [ ] CORS configuration correct
- [ ] Environment variables set
- [ ] SSL certificates active
- [ ] Firebase service account configured
- [ ] Health checks enabled
- [ ] Monitoring and logging enabled
- [ ] Auto-deployment configured
- [ ] Backup strategy in place
- [ ] Domain configured (if using custom domain)

## 🎨 Part 11: Custom Domain Setup (Optional)

### Firebase Hosting Custom Domain

1. **Go to Firebase Console → Hosting**
2. **Click "Add custom domain"**
3. **Enter your domain**: `dashboard.yourdomain.com`
4. **Follow DNS instructions**
5. **Wait for SSL certificate provisioning**

### Render Custom Domain

1. **Go to Render Service Dashboard**
2. **Click "Settings" → "Domains"**
3. **Add custom domain**: `api.yourdomain.com`
4. **Follow DNS instructions**
5. **Wait for SSL certificate provisioning**

## 📚 Additional Resources

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Render Documentation](https://render.com/docs)
- [Render Web Services](https://render.com/docs/web-services)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

## 🆘 Support

For deployment issues:
- Firebase: https://firebase.google.com/support
- Render: https://render.com/docs/support
- This project: Check troubleshooting section above

## 🔄 Migration from Koyeb to Render

If you previously deployed to Koyeb and want to migrate to Render:

1. **Export Koyeb environment variables**
2. **Import to Render**
3. **Update Firebase API URL**
4. **Deploy to Render**
5. **Test thoroughly**
6. **Update DNS if using custom domain**
7. **Decommission Koyeb service**

## ✅ Summary

This deployment architecture provides:
- **Frontend**: Firebase Hosting (fast, global CDN, free tier)
- **Backend**: Render (easy deployment, automatic SSL, generous free tier)
- **Authentication**: Firebase Auth (secure, scalable)
- **Database**: Optional PostgreSQL via Render
- **Monitoring**: Built-in logging and metrics
- **Cost**: $0-14/month depending on usage

The combination of Firebase Hosting and Render offers an excellent balance of ease of use, performance, and cost-effectiveness for the CIO Dashboard application.