# CIO Dashboard Backend - Pella.app Deployment Guide

## 🚀 Deploying to Pella.app

### Prerequisites
- Pella.app account
- PostgreSQL database (can be from Pella.app or external)
- Frontend deployed to Vercel (for CORS configuration)

### 📁 Files to Upload

Upload the entire `backend/` directory to Pella.app with these files:

#### Required Files:
- `main.py` - FastAPI application
- `start.py` - Startup script for Pella.app
- `requirements.txt` - Python dependencies
- `runtime.txt` - Python version specification
- `Procfile` - Process definition
- `.env` - Environment variables (create from .env.example)
- `routers/` - API route handlers
- `data_sources/` - Data loading logic
- `auth_schema.sql` - Database schema for authentication

#### Optional Files (for reference):
- `.env.example` - Environment variable template
- `Dockerfile` - For containerized deployment
- `setup_auth.py` - Authentication setup script
- `README.md` - Documentation

### ⚙️ Environment Variables Setup

In Pella.app dashboard, set these environment variables:

#### Required:
```
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET_KEY=your-super-secret-jwt-key-here-make-it-long-and-random
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
DEBUG=False
ENVIRONMENT=production
```

#### Database Setup:
1. Create a PostgreSQL database in Pella.app or use an external provider
2. Run the authentication schema:
   ```sql
   -- Execute the contents of auth_schema.sql in your database
   ```
3. Or use the setup script if Pella.app provides shell access:
   ```bash
   python setup_auth.py
   ```

### 🔧 Deployment Steps

1. **Upload Code**
   - Zip the `backend/` folder
   - Upload to Pella.app dashboard

2. **Configure Environment**
   - Set all environment variables in Pella.app
   - Ensure `ALLOWED_ORIGINS` includes your Vercel domain

3. **Database Setup**
   - Create PostgreSQL database
   - Run `auth_schema.sql` to create tables
   - Optionally run `setup_auth.py` to seed initial data

4. **Deploy**
   - Pella.app should automatically detect and run your application
   - The `Procfile` tells Pella.app to run `python start.py`

### 🌐 Domain Configuration

Your backend will be available at: `https://your-project.pella.app`

Update your Vercel frontend environment variable:
```
VITE_API_URL=https://your-project.pella.app/api
```

### 🧪 Testing Deployment

1. **API Health Check**:
   ```
   GET https://your-project.pella.app/docs
   ```
   Should show FastAPI interactive documentation

2. **Authentication Test**:
   ```
   POST https://your-project.pella.app/api/auth/login
   Content-Type: application/json

   {
     "email": "admin@american-logics.com",
     "password": "password123"
   }
   ```

3. **Frontend Integration**:
   - Access your Vercel frontend
   - Try logging in
   - Check browser console for any CORS or API errors

### 🚨 Troubleshooting

#### Common Issues:

**Application Won't Start**
- Check that all environment variables are set
- Verify `DATABASE_URL` is correct and accessible
- Check Pella.app logs for Python errors

**Database Connection Failed**
- Ensure PostgreSQL database is running
- Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/db`
- Check if database tables exist (run `auth_schema.sql`)

**CORS Errors**
- Update `ALLOWED_ORIGINS` with your exact Vercel domain
- Include protocol: `https://your-app.vercel.app`

**Import Errors**
- Ensure all files in `routers/` directory are uploaded
- Check that `requirements.txt` includes all dependencies

### 📊 Monitoring

- Check Pella.app dashboard for application logs
- Monitor database connections and performance
- Set up alerts for downtime or errors

### 🔄 Updates

To update your deployment:
1. Make code changes locally
2. Test thoroughly
3. Upload updated code to Pella.app
4. The application will automatically restart

---

**Need Help?** Check Pella.app documentation or contact their support with your specific error messages.