# Firebase Quick Start Guide

This guide provides step-by-step instructions to set up Firebase Authentication for the CIO Dashboard.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** (or select an existing project)
3. Enter a project name (e.g., `cio-dashboard-app`)
4. For Google Analytics, you can disable it (not required for this app)
5. Click **"Create project"**
6. Wait for the project to be created (this may take a minute)
7. Click **"Continue"** when prompted

## Step 2: Enable Email/Password Authentication

1. In the Firebase Console, click **"Authentication"** in the left sidebar
2. Click **"Get Started"**
3. Click the **"Sign-in method"** tab
4. Find **"Email/Password"** and click the pencil/edit icon
5. Enable the toggle switch
6. Click **"Save"**

## Step 3: Register Your Web App

1. In Firebase Console, click the **gear icon** (Project Settings) in the top-left
2. Scroll down to **"Your apps"** section
3. Click the **web icon** (`</>`) to add a web app
4. Enter an app name (e.g., `CIO Dashboard Web`)
5. Click **"Register app"**
6. **Copy the Firebase configuration values** - you'll need these for Step 4
7. Click **"Continue"** through the remaining steps (you can skip these for now)
8. Click **"Continue to console"**

The configuration will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "cio-dashboard-app.firebaseapp.com",
  projectId: "cio-dashboard-app",
  storageBucket: "cio-dashboard-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## Step 4: Create a Test User

1. In Firebase Console, go to **Authentication** → **Users**
2. Click **"Add user"**
3. Enter test credentials:
   - **Email:** `test@example.com` (or your preferred email)
   - **Password:** `TestPass123!` (use a strong password)
4. Click **"Add user"**

**Important:** Remember these credentials - you'll use them to log in to the app.

## Step 5: Generate Firebase Service Account Key (for Backend)

1. In Firebase Console, go to **Project Settings** → **Service Accounts**
2. Click **"Generate new private key"**
3. Select a service account (or create a new one)
4. Click **"Generate private key"**
5. **Save the JSON file securely** - this contains sensitive credentials
6. **DO NOT** commit this file to Git
7. Open the JSON file to get the values needed for Step 6

The JSON file will contain:
```json
{
  "type": "service_account",
  "project_id": "cio-dashboard-app",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxx@cio-dashboard-app.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxx%40cio-dashboard-app.iam.gserviceaccount.com"
}
```

## Step 6: Configure Frontend Environment Variables

Create or update the `.env` file in the project root (same directory as `package.json`):

```env
# Firebase Configuration (from Step 3)
VITE_FIREBASE_API_KEY=AIzaSy... (your actual API key)
VITE_FIREBASE_AUTH_DOMAIN=cio-dashboard-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cio-dashboard-app
VITE_FIREBASE_STORAGE_BUCKET=cio-dashboard-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# API Configuration
VITE_API_URL=http://localhost:8001

# Tenant Configuration
VITE_TENANT_ID=american_logics
```

**Replace the placeholder values with your actual Firebase configuration from Step 3.**

## Step 7: Configure Backend Environment Variables

Create or update the `.env` file in the `backend` directory:

```env
# Firebase Admin SDK Configuration (from Step 5 - JSON file)
FIREBASE_PROJECT_ID=cio-dashboard-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@cio-dashboard-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_PRIVATE_KEY_ID=abc123...
FIREBASE_CLIENT_ID=123456789

# Existing Configuration
DATA_SOURCE=csv
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004
DEBUG=True
ENVIRONMENT=development
DEFAULT_TENANT=american_logics
TENANT_HEADER=X-Tenant-ID
TENANT_FROM_SUBDOMAIN=false
```

**Important:** 
- Copy the values from the JSON file you downloaded in Step 5
- The `private_key` must be enclosed in quotes with `\n` for line breaks
- Keep the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts

## Step 8: Configure Firebase Authorized Domains

1. In Firebase Console, go to **Authentication** → **Settings**
2. Under **"Authorized domains"**, ensure `localhost` is listed
3. For production deployment, add your production frontend domain

## Credentials Required to Run the App

### Frontend (.env file - 6 values)
1. **VITE_FIREBASE_API_KEY** - From Firebase Console → Project Settings → Your Apps → Web App
2. **VITE_FIREBASE_AUTH_DOMAIN** - Usually `your-project-id.firebaseapp.com`
3. **VITE_FIREBASE_PROJECT_ID** - Your Firebase project ID
4. **VITE_FIREBASE_STORAGE_BUCKET** - Usually `your-project-id.appspot.com`
5. **VITE_FIREBASE_MESSAGING_SENDER_ID** - Numeric sender ID
6. **VITE_FIREBASE_APP_ID** - Web app ID

### Backend (backend/.env file - 5 values)
1. **FIREBASE_PROJECT_ID** - Your Firebase project ID (same as frontend)
2. **FIREBASE_CLIENT_EMAIL** - From the service account JSON file
3. **FIREBASE_PRIVATE_KEY** - From the service account JSON file (with `\n` for line breaks)
4. **FIREBASE_PRIVATE_KEY_ID** - From the service account JSON file
5. **FIREBASE_CLIENT_ID** - From the service account JSON file

### Test User Credentials (for logging in)
1. **Email** - The email you created in Step 4 (e.g., `test@example.com`)
2. **Password** - The password you created in Step 4 (e.g., `TestPass123!`)

## Step 9: Run the Application

1. **Start the backend:**
   ```bash
   cd backend
   python main.py
   ```

2. **Start the frontend:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   - Navigate to `http://localhost:3000`
   - You should be redirected to the login page
   - Enter the test user credentials from Step 4
   - Click "Sign In"
   - You should be redirected to the dashboard

## Verification Checklist

- [ ] Firebase project created
- [ ] Email/Password authentication enabled
- [ ] Web app registered in Firebase
- [ ] Test user created
- [ ] Service account key generated
- [ ] Frontend .env configured with Firebase values
- [ ] Backend .env configured with Firebase Admin values
- [ ] Frontend starts without errors
- [ ] Backend starts without errors
- [ ] Login page loads at http://localhost:3000
- [ ] Can log in with test user credentials
- [ ] Dashboard loads after login
- [ ] Dashboard data displays correctly

## Troubleshooting

### "Firebase: No Firebase App '[DEFAULT]' has been created"
- Check that all frontend environment variables are set correctly
- Verify the `.env` file is in the project root (same as `package.json`)
- Restart the frontend dev server after changing `.env`

### "auth/invalid-api-key"
- Verify the API key is correct (no extra spaces)
- Check that the API key is not truncated in the `.env` file

### Backend fails to start with Firebase error
- Verify all backend environment variables are set correctly
- Check that the private key is properly formatted with `\n` for line breaks
- Ensure the private key is enclosed in quotes in the `.env` file
- Verify the service account email matches your Firebase project

### Login fails with "auth/user-not-found"
- Verify the test user exists in Firebase Console → Authentication → Users
- Check that the email is spelled correctly

### API calls return 401 Unauthorized
- Verify the backend Firebase Admin credentials are correct
- Check that the Firebase project ID matches between frontend and backend
- Ensure the backend is initialized with Firebase Admin SDK

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` files to Git
- Never share the service account JSON file
- Never share your Firebase private key
- Only commit `.env.example` files with placeholders
- Keep your Firebase credentials secure
- Rotate Firebase keys if compromised

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK Guide](https://firebase.google.com/docs/admin/setup)