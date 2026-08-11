# Quick Deployment Guide
## Firebase Hosting + Koyeb

## 🚀 Quick Start (5-minute deployment)

### Step 1: Frontend - Firebase Hosting

```bash
# Build frontend
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

**Done!** Frontend: `https://cio-dashboard-app.web.app`

### Step 2: Backend - Koyeb

#### Option A: Web UI (Easiest)
1. Go to https://www.koyeb.com
2. Click "Create Service"
3. Connect your Git repository
4. Set environment variables:
   ```
   ALLOWED_ORIGINS=https://cio-dashboard-app.web.app
   DATABASE_URL=your_database_url
   DEFAULT_TENANT=american_logics
   FIREBASE_PROJECT_ID=cio-dashboard-app
   FIREBASE_CLIENT_EMAIL=your_service_account_email
   FIREBASE_PRIVATE_KEY=your_private_key
   ```
5. Click "Deploy"

#### Option B: CLI
```bash
koyeb service create cio-dashboard-backend \
  --git <your-repo-url> \
  --ports 8000:8000 \
  --env ALLOWED_ORIGINS=https://cio-dashboard-app.web.app
```

**Done!** Backend: `https://your-service.koyeb.app`

### Step 3: Update Frontend API URL

Edit `.env.production`:
```env
VITE_API_URL=https://your-koyeb-service.koyeb.app
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
- `VITE_API_URL` (Koyeb backend URL)

### Koyeb (Backend)
- `ALLOWED_ORIGINS` (Firebase domain)
- `DATABASE_URL` (if using database)
- `DEFAULT_TENANT`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

## 🔧 Troubleshooting

### Frontend
- **Blank page**: Check `firebase.json` rewrites
- **CORS errors**: Update `ALLOWED_ORIGINS` in backend
- **Build fails**: Check Node.js version (18+)

### Backend
- **Service won't start**: Check Dockerfile and logs
- **Firebase init fails**: Check service account variables
- **Database errors**: Verify database URL

## 📚 Full Guide

For detailed instructions, see `DEPLOYMENT_GUIDE_Firebase_Koyeb.md`

## 💰 Cost

- **Firebase Hosting**: Free tier (10GB/month)
- **Koyeb**: ~$5-10/month (nano/micro instance)
- **Total**: ~$5-10/month