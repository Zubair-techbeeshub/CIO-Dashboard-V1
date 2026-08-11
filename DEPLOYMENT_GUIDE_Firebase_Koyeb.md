# CIO Dashboard Deployment Guide
## Frontend: Firebase Hosting | Backend: Koyeb

This guide provides step-by-step instructions for deploying the CIO Dashboard with Firebase authentication to production.

## 📋 Prerequisites

### Firebase Hosting
- Firebase project created and configured
- Firebase CLI installed
- Firebase authentication enabled
- Service account JSON file downloaded

### Koyeb
- Koyeb account created
- Koyeb CLI installed (optional)
- Git repository with backend code
- Database service (if using PostgreSQL)

### General
- Node.js and npm installed
- Python and pip installed
- Git installed

## 🚀 Deployment Architecture

```
Firebase Hosting (Frontend)
    ↓ (API Calls)
Koyeb (Backend API)
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

Create or update `firebase.json`:

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
        "source": "**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=1800"
          }
        ]
      }
    ]
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

# API Configuration - PRODUCTION KOYEB URL
VITE_API_URL=https://your-koyeb-app.koyeb.app

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

## 🐳 Part 2: Backend Deployment to Koyeb

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
```

#### Create Dockerfile

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
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
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

### Step 3: Deploy to Koyeb

#### Option A: Using Koyeb Dashboard (Web UI)

1. **Login to Koyeb**: https://www.koyeb.com
2. **Create New Service**:
   - Click "Create Service"
   - Select "Git" as deployment method
   - Connect your Git repository
   - Select branch: `master`
   - Set root path: `/backend` (if backend is in subdirectory)

3. **Configure Service**:
   - **Name**: `cio-dashboard-backend`
   - **Region**: Choose nearest region
   - **Instance Type**: `nano` or `micro` (depending on needs)
   - **Environment Variables**:
     ```
     ALLOWED_ORIGINS=https://cio-dashboard-app.web.app
     DATABASE_URL=postgresql://user:password@host:5432/dbname
     DEFAULT_TENANT=american_logics
     ```

4. **Configure Ports**:
   - **Port**: `8000`
   - **Protocol**: `HTTP`

5. **Deploy Service**:
   - Click "Deploy"
   - Wait for deployment to complete

#### Option B: Using Koyeb CLI

```bash
# Install Koyeb CLI
npm install -g @koyeb/cli

# Login
koyeb login

# Create service
koyeb service create cio-dashboard-backend \
  --git <your-git-repository-url> \
  --git-branch master \
  --git-root-path /backend \
  --ports 8000:8000 \
  --env ALLOWED_ORIGINS=https://cio-dashboard-app.web.app \
  --env DATABASE_URL=postgresql://user:password@host:5432/dbname \
  --env DEFAULT_TENANT=american_logics \
  --regions paris \
  --instance-type nano
```

### Step 4: Upload Firebase Service Account to Koyeb

**Important**: You need to make the Firebase service account JSON available to the Koyeb deployment.

#### Option A: Environment Variables (Recommended)

1. **Convert service account JSON to environment variables**:
   - Read your `service-account.json` file
   - Add each field as an environment variable in Koyeb:
     ```
     FIREBASE_PROJECT_ID=your-project-id
     FIREBASE_CLIENT_EMAIL=your-client-email
     FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
     FIREBASE_PRIVATE_KEY_ID=your-key-id
     FIREBASE_CLIENT_ID=your-client-id
     ```

2. **Update backend/firebase_config.py** to use environment variables (already implemented)

#### Option B: Koyeb Secret (More Secure)

1. **Create Koyeb Secret**:
   ```bash
   koyeb secret create firebase-service-account --from-file service-account.json
   ```

2. **Mount secret in service**:
   - Add secret mount in Koyeb service configuration
   - Update backend to read from mounted file

### Step 5: Update CORS Configuration

The backend `ALLOWED_ORIGINS` must include the Firebase Hosting URL:

```env
ALLOWED_ORIGINS=https://cio-dashboard-app.web.app,https://cio-dashboard-app.firebaseapp.com
```

### Step 6: Verify Backend Deployment

1. **Get Koyeb service URL**:
   - From Koyeb dashboard: `https://your-service-name.koyeb.app`

2. **Test API endpoint**:
   ```bash
   curl https://your-service-name.koyeb.app/api/health
   ```

3. **Expected response**:
   ```json
   {
     "status": "healthy",
     "service": "CIO Dashboard API",
     "version": "1.0.0"
   }
   ```

## 🔧 Part 3: Production Configuration Updates

### Update Frontend API URL

In `.env.production`:
```env
VITE_API_URL=https://your-koyeb-service.koyeb.app
```

### Update Backend CORS

In Koyeb environment variables:
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
4. Check API calls to Koyeb backend
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

### Backend (Koyeb)

Koyeb supports automatic deployments from Git:
- Push to your Git repository
- Koyeb automatically detects changes
- Rebuilds and redeploys the service

## 📊 Part 6: Monitoring and Logs

### Firebase Hosting
- **Firebase Console**: Hosting → Analytics
- **Firebase CLI**: `firebase hosting:sites:default:logs`

### Koyeb
- **Koyeb Dashboard**: Service → Logs
- **Koyeb CLI**: `koyeb service logs cio-dashboard-backend`
- **Metrics**: Service → Metrics tab

## 🔒 Part 7: Security Considerations

### Firebase Hosting
- **HTTPS**: Automatic SSL certificates
- **Authentication**: Firebase Auth protects routes
- **Environment Variables**: Use GitHub Secrets for sensitive data

### Koyeb
- **HTTPS**: Automatic SSL certificates
- **Firewall**: Configure firewall rules if needed
- **Secrets**: Use Koyeb secrets for sensitive data
- **Service Account**: Never commit service account JSON to git

### General
- **API Keys**: Use environment variables
- **Database**: Use strong passwords
- **CORS**: Restrict to Firebase domain only
- **Rate Limiting**: Implement if needed

## 🐛 Part 8: Troubleshooting

### Common Issues

#### Frontend Issues

**Issue: Blank page after deployment**
- Check `firebase.json` rewrites configuration
- Verify build completed successfully
- Check browser console for errors

**Issue: CORS errors**
- Verify `ALLOWED_ORIGINS` includes Firebase domain
- Check backend CORS configuration
- Verify API URL is correct

**Issue: Firebase authentication not working**
- Verify Firebase config in `.env.production`
- Check Firebase Console authentication settings
- Verify Firebase project is correct

#### Backend Issues

**Issue: Service won't start**
- Check Koyeb service logs
- Verify all dependencies in `requirements.txt`
- Check port configuration (should be 8000)

**Issue: Firebase Admin SDK initialization failed**
- Verify service account environment variables
- Check Firebase service account permissions
- Verify project ID matches

**Issue: Database connection errors**
- Verify database URL in environment variables
- Check database is accessible from Koyeb
- Verify database credentials

### Debug Commands

```bash
# Firebase hosting logs
firebase hosting:sites:default:logs

# Koyeb service logs
koyeb service logs cio-dashboard-backend

# Koyeb service status
koyeb service get cio-dashboard-backend

# Test API endpoint
curl https://your-service.koyeb.app/api/health
```

## 📝 Part 9: Cost Estimation

### Firebase Hosting
- **Free Tier**: 10 GB/month storage, 10 GB/month bandwidth
- **Pay as you go**: $0.026/GB for storage, $0.15/GB for bandwidth
- **Estimated**: Free tier sufficient for most dashboards

### Koyeb
- **Nano instance**: ~$5/month
- **Micro instance**: ~$10/month
- **Estimated**: $5-10/month depending on usage

### Total Estimated Cost
- **Development/Testing**: Free
- **Production**: $5-15/month

## 🎉 Part 10: Post-Deployment Checklist

- [ ] Frontend deployed to Firebase Hosting
- [ ] Backend deployed to Koyeb
- [ ] Firebase authentication working
- [ ] API calls to Koyeb successful
- [ ] CORS configuration correct
- [ ] Environment variables set
- [ ] SSL certificates active
- [ ] Database connected (if applicable)
- [ ] Firebase service account configured
- [ ] Monitoring and logging enabled
- [ ] Backup strategy in place
- [ ] Domain configured (if using custom domain)

## 📚 Additional Resources

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Koyeb Documentation](https://www.koyeb.com/docs)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

## 🆘 Support

For deployment issues:
- Firebase: https://firebase.google.com/support
- Koyeb: https://www.koyeb.com/docs/support
- This project: Check troubleshooting section above