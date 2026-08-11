# Firebase Authentication Setup Guide

This guide provides step-by-step instructions for setting up Firebase Authentication for the CIO Dashboard application.

## STEP 1 — Create Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Give the project an appropriate name (e.g., "cio-dashboard")
4. Google Analytics can be enabled or disabled as appropriate for your use case
5. Click "Create project"

**Note:** Do not put actual credentials in the repository.

## STEP 2 — Enable Firebase Authentication

1. Open the Firebase Console for your project
2. Navigate to "Authentication" from the left sidebar
3. Click "Get Started"
4. Select "Sign-in method" tab
5. Find "Email/Password" and click the edit icon
6. Enable "Email/Password" sign-in provider
7. Click "Save"

**Important:** This application uses Email + Password authentication for the first implementation. Do not enable Google/GitHub/social login unless specifically requested later.

## STEP 3 — Register the Web Application

1. In Firebase Console, click the gear icon (Project Settings)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register the application with a name (e.g., "CIO Dashboard Web")
5. Copy the Firebase configuration values - you will need these:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

6. Click "Continue" to complete registration

## STEP 4 — Configure Frontend Environment Variables

Create or update the `.env` file in the project root with the following Firebase configuration:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_senderer_id
VITE_FIREBASE_APP_ID=your_app_id

# Existing Configuration
VITE_API_URL=http://localhost:8001
VITE_TENANT_ID=american_logics
```

**IMPORTANT:**
- Do not commit `.env` to Git
- Create/update `.env.example` with placeholders only

Example `.env.example`:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# API Configuration
VITE_API_URL=http://localhost:8001
VITE_TENANT_ID=american_logics
```

## STEP 5 — Firebase Authorized Domains

1. In Firebase Console, go to Authentication → Settings
2. Under "Authorized domains", ensure `localhost` is listed for development
3. For production deployment, add your production frontend domain (e.g., `your-domain.com`)
4. Make sure your frontend URL is properly configured

## STEP 6 — Create a Test User

1. In Firebase Console, go to Authentication → Users
2. Click "Add user"
3. Enter test credentials:
   - Email: `test@example.com` (or your preferred test email)
   - Password: `YourSecurePassword123!` (use a strong password)
4. Click "Add user"

**Important:** Do not put real passwords into the repository. This test user will be used to test the Login page.

## STEP 7 — Generate Firebase Service Account for Backend

For the backend Firebase Admin SDK:

1. In Firebase Console, go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Select a service account (or create a new one)
4. Click "Generate private key"
5. **IMPORTANT:** Save the JSON file securely - this contains sensitive credentials
6. **DO NOT** commit this file to Git
7. **DO NOT** place this file in frontend code

The JSON file will contain:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

## STEP 8 — Configure Backend Environment Variables

For the backend, create or update `backend/.env` with:

```env
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Existing Configuration
DATA_SOURCE=csv
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004
DEBUG=True
ENVIRONMENT=development
DEFAULT_TENANT=american_logics
TENANT_HEADER=X-Tenant-ID
TENANT_FROM_SUBDOMAIN=false
```

**IMPORTANT:** 
- The private key must handle newlines correctly
- In environment files, use `\n` for line breaks
- Do not commit actual credentials to Git

Update `backend/.env.example`:
```env
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Existing Configuration
DATA_SOURCE=csv
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004
DEBUG=True
ENVIRONMENT=development
DEFAULT_TENANT=american_logics
TENANT_HEADER=X-Tenant-ID
TENANT_FROM_SUBDOMAIN=false
```

## STEP 9 — Install Required Dependencies

**Frontend:**
```bash
npm install firebase
```

**Backend:**
```bash
pip install firebase-admin
```

Add to `backend/requirements.txt`:
```
firebase-admin>=6.0.0
```

## STEP 10 — Local Development Testing

After completing the Firebase setup:

1. Start the backend:
```bash
cd backend
python main.py
```

2. Start the frontend:
```bash
npm run dev
```

3. Open `http://localhost:3000` in your browser
4. You should be redirected to the login page
5. Enter your test user credentials
6. Verify successful login and dashboard access

## TROUBLESHOOTING

### Common Issues:

1. **"Firebase: No Firebase App '[DEFAULT]' has been created"**
   - Ensure Firebase is initialized with correct configuration
   - Check that environment variables are loaded properly

2. **"auth/invalid-api-key"**
   - Verify your Firebase API key is correct
   - Check that the API key is not truncated in .env file

3. **"auth/user-not-found" or "auth/wrong-password"**
   - Verify the test user exists in Firebase Console
   - Check email and password are correct

4. **Backend token verification fails**
   - Ensure Firebase Admin SDK is initialized with correct credentials
   - Check that private key is properly formatted with `\n` for line breaks
   - Verify project ID matches between frontend and backend

5. **CORS errors**
   - Ensure your frontend domain is in Firebase authorized domains
   - Check backend CORS configuration includes your frontend URL

## SECURITY CONSIDERATIONS

1. **Never commit Firebase credentials to Git**
2. **Never share service account keys**
3. **Use environment variables for all sensitive data**
4. **Rotate Firebase keys if compromised**
5. **Enable Firebase security rules if using Firestore/Realtime Database**
6. **Monitor Firebase Console for suspicious activity**
7. **Use strong passwords for test users**

## PRODUCTION DEPLOYMENT

For production deployment:

1. **Use production Firebase project** (separate from development)
2. **Set proper authorized domains** in Firebase Console
3. **Use secure environment variable management** (e.g., AWS Secrets Manager, Azure Key Vault)
4. **Enable Firebase App Check** for additional security
5. **Configure Firebase Analytics** for monitoring
6. **Set up Firebase Crashlytics** for error tracking
7. **Review Firebase security rules** for any database usage
8. **Enable Firebase Authentication monitoring**
9. **Set up proper rate limiting** on backend APIs
10. **Use HTTPS only** in production

## SUPPORT

For Firebase-specific issues:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK Guide](https://firebase.google.com/docs/admin/setup)

For application-specific issues, refer to the main project documentation.