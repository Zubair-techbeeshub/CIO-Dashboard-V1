# Quick Deployment Guide
## Firebase Hosting + Render

## 🚀 Quick Start (5-minute deployment)

### Step 1: Frontend - Firebase Hosting

```bash
# Build frontend
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

**Done!** Frontend: `https://cio-dashboard-app.web.app`

### Step 2: Backend - Render

#### Option A: Web UI (Easiest)
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your Git repository
4. Set environment variables:
   ```
   PORT=8000
   ALLOWED_ORIGINS=https://cio-dashboard-app.web.app
   DEFAULT_TENANT=american_logics
   FIREBASE_PROJECT_ID=cio-dashboard-app
   FIREBASE_CLIENT_EMAIL=your_service_account_email
   FIREBASE_PRIVATE_KEY=your_private_key
   ```
5. Set build command: `pip install -r requirements.txt`
6. Set start command: `gunicorn main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`
7. Click "Create Web Service"

#### Option B: Blueprint (render.yaml)
1. Push `backend/render.yaml` to your repository
2. Go to Render Dashboard → "New +" → "Blueprint"
3. Connect your repository
4. Select render.yaml
5. Click "Apply Blueprint"

**Done!** Backend: `https://cio-dashboard-backend.onrender.com`

### Step 3: Update Frontend API URL

Edit `.env.production`:
```env
VITE_API_URL=https://cio-dashboard-backend.onrender.com
```

Rebuild and redeploy:
```bash
npm run build
firebase deploy --only hosting
```

## ✅ Verification

1. Visit: `https://cio-dashboard-app.web.app`
2. Login with Firebase credentials
3. Dashboard should load with data

## 📋 Required Files

### Frontend
- ✅ `firebase.json` (already exists)
- ✅ `.env.production` (created)
- ✅ Build command: `npm run build`

### Backend
- ✅ `render.yaml` (created)
- ✅ `Dockerfile` (created)
- ✅ `.dockerignore` (created)
- ✅ `requirements.txt` (exists)

## 🔑 Required Environment Variables

### Firebase (Frontend)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_API_URL` (Render backend URL)

### Render (Backend)
- `PORT=8000`
- `ALLOWED_ORIGINS` (Firebase domain)
- `DEFAULT_TENANT`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

## 🔧 Troubleshooting

### Frontend
- **Blank page**: Check `firebase.json` rewrites
- **CORS errors**: Update `ALLOWED_ORIGINS` in Render
- **Build fails**: Check Node.js version (18+)

### Backend
- **Service won't start**: Check Render logs, verify start command
- **Firebase init fails**: Check service account variables
- **Build fails**: Check requirements.txt

## 📚 Full Guide

For detailed instructions, see `DEPLOYMENT_GUIDE_Firebase_Render.md`

## 💰 Cost

- **Firebase Hosting**: Free tier (10GB/month)
- **Render**: Free tier (750 hours/month) or $7/month (Starter)
- **Total**: Free or $7/month

## 🎯 Key Differences: Render vs Koyeb

### Render Advantages
- **Easier setup**: Web UI is very intuitive
- **Auto-deployment**: Automatic git push deployments
- **Free tier**: 750 hours/month
- **PostgreSQL**: Built-in database service
- **Logs**: Excellent log viewer in dashboard

### Koyeb Advantages
- **Global regions**: More region options
- **Docker-native**: Better Docker support
- **Cheaper**: Lower cost for similar specs
- **Private instances**: More isolation

**Recommendation**: Use Render for ease of use and better free tier.