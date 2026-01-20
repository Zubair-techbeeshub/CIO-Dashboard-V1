# CIO Dashboard Deployment Guide

This guide covers multiple deployment options for the CIO Dashboard. Choose the option that best fits your needs:

- **[Google Cloud Platform (GCP)](#-google-cloud-platform-gcp-deployment-recommended)** - Recommended for production (Cloud Run + Firebase)
- **[Vercel + Backend Service](#-frontend-deployment-vercel)** - Original deployment option
- **[Railway/Heroku/DigitalOcean](#-backend-deployment)** - Alternative backend options

---

## 🌟 Google Cloud Platform (GCP) Deployment (RECOMMENDED)

Deploy to GCP using Cloud Run for the backend and Firebase Hosting for the frontend.

### Why GCP?

- ✅ **One-command deployment** for both backend and frontend
- ✅ **Auto-scaling** based on traffic
- ✅ **Cost-effective** with scale-to-zero ($0-5/month for dev, ~$60-130/month for production)
- ✅ **No infrastructure management** required
- ✅ **Built-in PostgreSQL** in container (auto-initialized)
- ✅ **Fast deployment** (5-10 minutes)

### Quick Start

```bash
# 1. Enable GCP services
./deploy/enable-services.sh

# 2. Deploy everything (backend + frontend)
./deploy/deploy-all.sh YOUR_PROJECT_ID

# Or deploy separately:
./deploy/deploy-backend.sh YOUR_PROJECT_ID
./deploy/deploy-frontend.sh https://your-backend-url.run.app
```

### Complete Documentation

For detailed GCP deployment instructions, see:
- **[📖 Manual Deployment Guide](docs/MANUAL_DEPLOYMENT_GCP.md)** - Step-by-step deployment
- **[💰 Cost Estimates](docs/GCP_COST_ESTIMATE.md)** - Detailed pricing breakdown
- **[⚙️ Configuration Guide](docs/CLOUD_RUN_CONFIGURATION.md)** - Cloud Run settings
- **[🔧 Troubleshooting](docs/TROUBLESHOOTING_GCP.md)** - Common issues and solutions
- **[🚀 Migration Guide](docs/MIGRATION_EC2_TO_GCP.md)** - Migrate from EC2 to GCP

### Quick Reference

**Deploy backend:**
```bash
./deploy/deploy-backend.sh YOUR_PROJECT_ID [REGION]
```

**Deploy frontend:**
```bash
./deploy/deploy-frontend.sh BACKEND_URL [PROJECT_ID]
```

**Test deployment:**
```bash
./deploy/test-backend.sh https://your-backend.run.app
./deploy/test-frontend.sh https://your-project.web.app
```

### Cost Comparison

| Environment | Monthly Cost |
|-------------|--------------|
| Development (scale-to-zero) | $0-5 |
| Production (optimized) | $60-70 |
| Production (high-performance) | $130-150 |
| Current EC2/Vercel | $66-86 |

**Savings:** $15-80/month vs EC2, with better scalability!

---

## 🚀 Frontend Deployment (Vercel)

Alternative to Firebase Hosting (if not using GCP).

## 🚀 Frontend Deployment (Vercel)

### Prerequisites
- Vercel account
- GitHub repository

### Steps

1. **Connect Repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project settings:
     - **Framework Preset**: Vite
     - **Root Directory**: `./` (leave as is)
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

2. **Environment Variables**
   Set these in Vercel dashboard (Project Settings → Environment Variables):
   ```
   VITE_API_URL=https://your-backend-domain.com/api
   ```

3. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your frontend
   - Your app will be available at `https://your-project.vercel.app`

### Custom Domain (Optional)
- Go to Project Settings → Domains
- Add your custom domain
- Configure DNS records as instructed

## 🔧 Backend Deployment

### Option 1: Railway (Recommended)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up/Sign in

2. **Deploy from GitHub**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Choose the backend directory if needed

3. **Environment Variables**
   Set these in Railway dashboard:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET_KEY=your-secret-key
   ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app
   DEBUG=False
   ENVIRONMENT=production
   ```

4. **Database Setup**
   - Railway provides PostgreSQL database
   - Copy the `DATABASE_URL` from Railway dashboard

### Option 2: Heroku

1. **Create Heroku Account**
   - Go to [heroku.com](https://heroku.com)

2. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

3. **Deploy**
   ```bash
   cd backend
   heroku create your-app-name
   heroku config:set DATABASE_URL=postgresql://...
   heroku config:set JWT_SECRET_KEY=your-secret
   heroku config:set ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app
   git push heroku main
   ```

### Option 3: DigitalOcean App Platform

1. **Create DigitalOcean Account**
   - Go to [digitalocean.com](https://digitalocean.com)

2. **Create App**
   - Choose "Apps" → "Create App"
   - Connect your GitHub repository
   - Set source directory to `backend/`
   - Choose runtime: Python

3. **Environment Variables**
   Configure the same variables as above

### Option 4: AWS/GCP/Azure
Use their respective app hosting services with the provided Dockerfile.

## 📊 Data Management

### CSV Files for Frontend
- CSV files are served statically from Vercel
- Located in `public/data/tenant_american_logics/`
- No additional configuration needed

### Database Setup
1. Create PostgreSQL database on your hosting provider
2. Run the authentication setup:
   ```bash
   python setup_auth.py
   ```

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files to git
- Use strong JWT secrets
- Keep database credentials secure

### CORS Configuration
- Update `ALLOWED_ORIGINS` with your Vercel domain
- Format: `https://your-app.vercel.app`

### HTTPS
- Vercel provides automatic HTTPS
- Ensure your backend also uses HTTPS in production

## 🧪 Testing Deployment

### Frontend Tests
```bash
npm run build  # Test production build
npm run preview  # Test production locally
```

### Backend Tests
```bash
cd backend
python -m pytest  # If you have tests
curl https://your-backend-domain.com/docs  # Check API docs
```

### End-to-End Testing
1. Access your Vercel URL
2. Test login functionality
3. Navigate through all dashboard tabs
4. Verify data loads correctly

## 🚨 Troubleshooting

### Common Issues

**Frontend Build Fails**
- Check that all dependencies are in `package.json`
- Ensure TypeScript types are correct
- Check for missing environment variables

**Backend Deployment Fails**
- Verify Python version compatibility
- Check database connectivity
- Ensure all required environment variables are set

**CORS Errors**
- Double-check `ALLOWED_ORIGINS` includes your Vercel domain
- Ensure backend allows credentials

**Data Not Loading**
- Check CSV file paths in production
- Verify tenant ID logic works with your domain
- Check browser console for 404 errors

## 📝 Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and API responding
- [ ] Authentication working
- [ ] All dashboard tabs loading data
- [ ] No console errors
- [ ] HTTPS enabled
- [ ] Custom domain configured (if needed)
- [ ] Database properly seeded with auth data

## 🔄 Updates and Maintenance

### Frontend Updates
- Push changes to main branch
- Vercel auto-deploys

### Backend Updates
- Push changes to your hosting service
- May require manual redeployment depending on provider

### Data Updates
- Replace CSV files in `public/data/` directory
- Commit and push to trigger frontend redeployment

---

For additional help, check the Vercel and your backend hosting documentation.