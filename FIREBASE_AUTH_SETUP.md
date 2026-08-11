# Firebase Authentication Setup Guide

This document provides a complete step-by-step implementation guide for adding Firebase Authentication to the CIO Dashboard application. This guide is specifically written for this repository and references the actual files and architecture found in the codebase.

## TABLE OF CONTENTS

1. [Firebase Project Setup](#section-1---firebase-project-setup)
2. [Frontend Firebase Setup](#section-2---frontend-firebase-setup)
3. [Backend Firebase Setup](#section-3---backend-firebase-setup)
4. [Recommended Authentication Architecture](#section-4---recommended-authentication-architecture)
5. [Migration Steps](#section-5---migration-steps)
6. [Security Considerations](#section-6---security-considerations)
7. [Local Development](#section-7---local-development)
8. [Testing Checklist](#section-8---testing-checklist)

---

## SECTION 1 — FIREBASE PROJECT SETUP

### 1.1 Create or Select Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Project name: e.g., "cio-dashboard"
   - Enable Google Analytics (optional but recommended)
   - Select or create a Google Analytics account

### 1.2 Enable Firebase Authentication

1. In Firebase Console, navigate to **Build** → **Authentication**
2. Click **Get Started**
3. Select the **Sign-in method** tab
4. Enable **Email/Password**:
   - Click on Email/Password
   - Toggle **Enable** to ON
   - Click **Save**

### 1.3 Configure Authorized Domains

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Navigate to the **General** tab
3. Scroll to **Your apps** section
4. Under your web app, find **Authorized domains**
5. Add the following domains:
   - `localhost` (for local development)
   - `127.0.0.1` (for local development)
   - Your production domain (e.g., `your-domain.com`)
   - Any Vercel/Firebase Hosting domains

### 1.4 Register Web Application

1. In Firebase Console, go to **Project Settings**
2. Click the **</>** (web) icon under "Your apps"
3. Register your app:
   - App nickname: e.g., "CIO Dashboard Web"
   - Hosting setup: Not set up yet (skip for now)
4. Copy the **Firebase SDK configuration snippet**

### 1.5 Obtain Firebase Configuration

After registering your web app, you'll receive configuration values similar to:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "cio-dashboard.firebaseapp.com",
  projectId: "cio-dashboard",
  storageBucket: "cio-dashboard.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 1.6 Configure Frontend .env File

Create or update `.env` in the frontend root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Existing Configuration
VITE_API_URL=
VITE_TENANT_ID=american_logics
```

**IMPORTANT:** Never commit real credentials to the repository. Use `.env.example` for template values only.

---

## SECTION 2 — FRONTEND FIREBASE SETUP

### 2.1 Install Required npm Packages

From the project root directory:

```bash
npm install firebase
```

### 2.2 Create Firebase Initialization File

Create file: `src/firebase.ts`

```typescript
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;
let auth: Auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
}

export { app, auth };
```

### 2.3 Create Firebase Authentication Context

Create file: `src/contexts/FirebaseAuthContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  UserCredential
} from 'firebase/auth';
import { auth } from '../firebase';

interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const FirebaseAuthContext = createContext<AuthContextType | undefined>(undefined);

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

interface FirebaseAuthProviderProps {
  children: ReactNode;
}

export const FirebaseAuthProvider: React.FC<FirebaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<UserCredential> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  };

  const logout = async (): Promise<void> => {
    await firebaseSignOut(auth);
  };

  return (
    <FirebaseAuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
};
```

### 2.4 Create Login Component

Create file: `src/components/Login.tsx`

```typescript
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useFirebaseAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <LogIn size={32} />
          </div>
          <h1>CIO Dashboard</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>© 2026 American Logics. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
```

### 2.5 Create Protected Route Component

Create file: `src/components/ProtectedRoute.tsx`

```typescript
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useFirebaseAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

### 2.6 Update App.tsx

Modify `src/App.tsx`:

```typescript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FirebaseAuthProvider } from './contexts/FirebaseAuthContext';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/Dashboard.css';

function App() {
  return (
    <FirebaseAuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </FirebaseAuthProvider>
  );
}

export default App;
```

### 2.7 Update Dashboard Component

Modify `src/components/Dashboard.tsx` to use Firebase auth:

```typescript
import React, { useState } from 'react';
import { LayoutDashboard, Menu, X, Home, Briefcase, Target, Activity, Users, LogOut } from 'lucide-react';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import ExecutiveSummary from './ExecutiveSummary';
import FinancialSection from './FinancialSection';
import PortfolioCockpit from './PortfolioCockpit';
import ProjectSection from './ProjectSection';
import WorkforceSection from './WorkforceSection';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('executive');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useFirebaseAuth();

  // ... rest of the component remains the same
};
```

### 2.8 Update dataService.ts for Firebase ID Token

Modify `src/services/dataService.ts` to include Firebase ID token in API requests:

```typescript
import { getAuth } from 'firebase/auth';
import { auth } from '../firebase';

// ... existing functions ...

async function apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
  const API_BASE_URL = getApiBaseUrl();
  const tenantId = getTenantId();
  const url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;

  // Get Firebase ID token
  const firebaseAuth = getAuth();
  const idToken = await firebaseAuth.currentUser?.getIdToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Tenant-ID': tenantId,
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}
```

### 2.9 Add Login Styles to Dashboard.css

Add the login page styles to `src/styles/Dashboard.css` (these were removed during auth cleanup and need to be restored):

```css
/* Login Page Styles */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.login-header {
  margin-bottom: 2rem;
}

.login-header h1 {
  color: #333;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #666;
  font-size: 0.9rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  text-align: left;
}

.form-group label {
  display: block;
  color: #333;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.password-input {
  position: relative;
}

.password-input input {
  padding-right: 3rem;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 0;
}

.login-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-top: 0.5rem;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #fcc;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.login-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e1e5e9;
  color: #666;
  font-size: 0.85rem;
}
```

---

## SECTION 3 — BACKEND FIREBASE SETUP

### 3.1 Install Firebase Admin SDK

From the backend directory:

```bash
cd backend
pip install firebase-admin
```

### 3.2 Generate Firebase Service Account

1. In Firebase Console, go to **Project Settings** → **Service accounts**
2. Click **Generate new private key**
3. Select JSON format
4. Click **Generate**
5. **IMPORTANT:** Save this file securely. Never commit it to the repository.

### 3.3 Configure Backend Environment Variables

Update `backend/.env` or create it:

```env
# Firebase Admin Configuration
FIREBASE_SERVICE_ACCOUNT_PATH=path/to/service-account.json
# OR use individual credentials (alternative approach)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Existing Configuration
DATA_SOURCE=csv
DATABASE_URL=postgresql://username:password@host:port/database
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
DEFAULT_TENANT=american_logics
```

### 3.4 Create Firebase Authentication Module

Create file: `backend/firebase_auth.py`

```python
import os
import json
from firebase_admin import credentials, auth, initialize_app
from typing import Optional, Dict
from fastapi import HTTPException, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Initialize Firebase Admin
firebase_app = None
security = HTTPBearer()

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    global firebase_app
    
    if firebase_app:
        return firebase_app
    
    try:
        # Try to load from service account file
        service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
        if service_account_path and os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
        else:
            # Fallback to environment variables
            firebase_config = {
                "type": "service_account",
                "project_id": os.getenv("FIREBASE_PROJECT_ID"),
                "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID", ""),
                "private_key": os.getenv("FIREBASE_PRIVATE_KEY", "").replace("\\n", "\n"),
                "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
                "client_id": os.getenv("FIREBASE_CLIENT_ID", ""),
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_CERT_URL", "")
            }
            cred = credentials.Certificate(firebase_config)
        
        firebase_app = initialize_app(cred)
        return firebase_app
    except Exception as e:
        print(f"Warning: Firebase initialization failed: {e}")
        return None

async def verify_firebase_token(token: str) -> Optional[Dict]:
    """Verify Firebase ID token and return decoded user info"""
    try:
        initialize_firebase()
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token expired")
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")

async def get_current_firebase_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> Dict:
    """FastAPI dependency to get current Firebase user"""
    token = credentials.credentials
    decoded_token = await verify_firebase_token(token)
    
    return {
        "uid": decoded_token.get("uid"),
        "email": decoded_token.get("email"),
        "email_verified": decoded_token.get("email_verified", False),
        "name": decoded_token.get("name"),
        "picture": decoded_token.get("picture"),
    }
```

### 3.5 Update main.py to Include Firebase Auth

Modify `backend/main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.staticfiles import StaticFiles
import re
from dotenv import load_dotenv
import os

from routers import dashboard, portfolio, workforce, projects
import firebase_auth  # Import Firebase auth module

# Load environment variables
load_dotenv()

# Initialize Firebase
firebase_auth.initialize_firebase()

app = FastAPI(
    title="CIO Dashboard API",
    description="API for CIO Dashboard - Utilities KPIs",
    version="1.0.0"
)

# ... rest of main.py remains the same
```

### 3.6 Protect API Endpoints

Update each router to use Firebase authentication. For example, in `backend/routers/dashboard.py`:

```python
from fastapi import APIRouter, HTTPException, Request, Depends
from data_sources.factory import data_source
from firebase_auth import get_current_firebase_user

router = APIRouter()

@router.get("/executive-summary")
async def get_executive_summary(
    request: Request,
    current_user: dict = Depends(get_current_firebase_user)
):
    """Get executive summary KPIs"""
    tenant_id = request.headers.get("X-Tenant-ID", "american_logics")
    try:
        data = await data_source.load_executive_summary(tenant_id)
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Apply similar pattern to other endpoints
```

### 3.7 Map Firebase UID to Application User

Create a mapping system in `backend/routers/user_mapping.py`:

```python
from sqlalchemy import create_engine, text
from config import settings
from typing import Optional, Dict

engine = create_engine(settings.database_url)

def get_user_by_firebase_uid(firebase_uid: str) -> Optional[Dict]:
    """Get application user by Firebase UID"""
    try:
        query = """
        SELECT u.id, u.email, u.first_name, u.last_name, u.role,
               u.department, u.job_title, c.client_id, c.name as client_name
        FROM users u
        JOIN clients c ON u.client_id = c.id
        WHERE u.firebase_uid = :firebase_uid AND u.is_active = true
        """
        with engine.connect() as conn:
            result = conn.execute(text(query), {"firebase_uid": firebase_uid})
            user = result.fetchone()
        
        if user:
            return {
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
                "department": user.department,
                "job_title": user.job_title,
                "client_id": user.client_id,
                "client_name": user.client_name,
            }
    except Exception as e:
        print(f"Error mapping Firebase user: {e}")
    
    return None

def link_firebase_user(firebase_uid: str, email: str) -> Optional[Dict]:
    """Link Firebase UID to existing user by email"""
    try:
        query = """
        UPDATE users
        SET firebase_uid = :firebase_uid
        WHERE email = :email AND firebase_uid IS NULL
        RETURNING id, email, first_name, last_name, role, client_id
        """
        with engine.connect() as conn:
            result = conn.execute(text(query), {
                "firebase_uid": firebase_uid,
                "email": email
            })
            user = result.fetchone()
            conn.commit()
        
        if user:
            return {
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
                "client_id": user.client_id,
            }
    except Exception as e:
        print(f"Error linking Firebase user: {e}")
    
    return None
```

### 3.8 Update Database Schema

Add `firebase_uid` column to users table:

```sql
ALTER TABLE users ADD COLUMN firebase_uid VARCHAR(255) UNIQUE;
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
```

### 3.9 Update requirements.txt

Add to `backend/requirements.txt`:

```
firebase-admin>=6.0.0
```

---

## SECTION 4 — RECOMMENDED AUTHENTICATION ARCHITECTURE

### Architecture Overview

```
User
  │
  │ Firebase login (email/password)
  v
React Frontend
  │
  │ Firebase Authentication SDK
  │ signInWithEmailAndPassword()
  v
Firebase Authentication
  │
  │ Firebase ID Token (JWT)
  v
React Frontend
  │
  │ getIdToken() → Bearer token
  │ Authorization: Bearer <Firebase ID Token>
  v
FastAPI Backend
  │
  │ Firebase Admin SDK
  │ verify_id_token()
  v
Authenticated User
  │
  │ Map Firebase UID → Application User
  v
Application Database
  │
  │ User metadata, client/tenant info
  v
Dashboard APIs
```

### Layer Responsibilities

#### 1. Firebase Authentication
- User identity management
- Email/password authentication
- Token generation and validation
- Session management
- Security (password hashing, token expiration)

#### 2. React Frontend
- UI for login/logout
- Firebase SDK integration
- Token storage and refresh
- API request authentication
- User session state management

#### 3. FastAPI Backend
- Firebase ID token verification
- User authorization
- Firebase UID to application user mapping
- Tenant isolation
- API endpoint protection

#### 4. Application Database
- User metadata (name, role, department)
- Client/tenant information
- License management
- Business data (dashboard metrics, projects, etc.)

### Data Flow

1. **Login Flow:**
   - User enters email/password in React frontend
   - Frontend calls Firebase `signInWithEmailAndPassword()`
   - Firebase validates credentials and returns user object
   - Frontend stores Firebase user in context
   - Frontend obtains ID token via `getIdToken()`

2. **API Request Flow:**
   - Frontend makes API request with `Authorization: Bearer <id_token>`
   - FastAPI receives request and extracts token
   - FastAPI calls Firebase Admin SDK `verify_id_token()`
   - Firebase validates token and returns decoded user info
   - FastAPI maps Firebase UID to application user
   - FastAPI processes request with user context
   - Response returned to frontend

3. **Logout Flow:**
   - User clicks logout in React frontend
   - Frontend calls Firebase `signOut()`
   - Firebase clears session
   - Frontend clears local auth state
   - Frontend redirects to login page

---

## SECTION 5 — MIGRATION STEPS

### Phase A: Firebase Project Setup
- [ ] Create Firebase project
- [ ] Enable Email/Password authentication
- [ ] Configure authorized domains
- [ ] Register web application
- [ ] Obtain Firebase configuration
- [ ] Configure frontend `.env` file

### Phase B: Frontend Firebase Setup
- [ ] Install Firebase npm package
- [ ] Create `src/firebase.ts`
- [ ] Create `src/contexts/FirebaseAuthContext.tsx`
- [ ] Create `src/components/Login.tsx`
- [ ] Create `src/components/ProtectedRoute.tsx`
- [ ] Update `src/App.tsx`
- [ ] Update `src/components/Dashboard.tsx`
- [ ] Update `src/services/dataService.ts`
- [ ] Add login styles to `src/styles/Dashboard.css`

### Phase C: Frontend Login Screen
- [ ] Test Firebase initialization
- [ ] Test login form rendering
- [ ] Test Firebase authentication flow
- [ ] Test authentication state persistence
- [ ] Test logout functionality

### Phase D: Firebase ID Token Acquisition
- [ ] Test ID token retrieval
- [ ] Test token refresh mechanism
- [ ] Test token expiration handling
- [ ] Test token inclusion in API headers

### Phase E: FastAPI Token Verification
- [ ] Install Firebase Admin SDK
- [ ] Generate Firebase service account
- [ ] Configure backend environment variables
- [ ] Create `backend/firebase_auth.py`
- [ ] Initialize Firebase in `backend/main.py`
- [ ] Test token verification endpoint

### Phase F: Protect Dashboard APIs
- [ ] Update `backend/routers/dashboard.py` with auth dependency
- [ ] Update `backend/routers/portfolio.py` with auth dependency
- [ ] Update `backend/routers/workforce.py` with auth dependency
- [ ] Update `backend/routers/projects.py` with auth dependency
- [ ] Test protected endpoints with valid token
- [ ] Test protected endpoints with invalid token

### Phase G: Map Firebase User to Application User
- [ ] Add `firebase_uid` column to users table
- [ ] Create `backend/routers/user_mapping.py`
- [ ] Implement user mapping logic
- [ ] Create user linking endpoint
- [ ] Test Firebase UID to user mapping

### Phase H: Test Authentication
- [ ] Test complete login flow
- [ ] Test API access with authentication
- [ ] Test token expiration handling
- [ ] Test logout flow
- [ ] Test unauthorized access attempts
- [ ] Test tenant isolation with auth

### Phase I: Remove Temporary Authentication Bypasses
- [ ] Remove any test endpoints that bypassed auth
- [ ] Remove temporary mock authentication
- [ ] Update documentation
- [ ] Clean up temporary environment variables

---

## SECTION 6 — SECURITY CONSIDATIONS

### Critical Security Rules

1. **Never expose Firebase Admin private keys in frontend code**
   - Admin SDK credentials are for server-side only
   - Frontend should only use web SDK configuration

2. **Never commit service account JSON files**
   - Add `*.json` service account files to `.gitignore`
   - Use environment variables for sensitive configuration
   - Consider using secret management systems in production

3. **Never commit .env files containing secrets**
   - Use `.env.example` for template values
   - Document required environment variables
   - Use different .env files for different environments

4. **Firebase web API keys are not equivalent to Admin private keys**
   - Web API keys are visible in browser (this is normal)
   - Admin private keys must remain server-side
   - Backend verification is still required for security

5. **Backend must verify ID tokens**
   - Never trust tokens from frontend without verification
   - Always use Firebase Admin SDK for verification
   - Implement proper error handling for invalid tokens

6. **Do not trust tenant/client information supplied blindly by the browser**
   - Validate tenant information against database
   - Use Firebase UID for user identification
   - Implement proper tenant isolation

7. **Validate the authenticated Firebase user's UID/email against application records**
   - Map Firebase UID to application user
   - Verify user permissions and roles
   - Check license/subscription status

8. **Handle token expiration gracefully**
   - Implement token refresh logic
   - Provide clear error messages
   - Redirect to login when token expires

9. **Use HTTPS in production**
   - All Firebase communications require HTTPS
   - API requests should use HTTPS
   - Configure SSL certificates properly

10. **Configure Firebase authorized domains correctly**
    - Only allow domains you control
    - Test with localhost during development
    - Update for production domains

### Additional Security Best Practices

- Implement rate limiting on authentication endpoints
- Log authentication attempts for security monitoring
- Implement account lockout after failed attempts
- Use strong password requirements (enforced by Firebase)
- Implement email verification for new users
- Consider implementing multi-factor authentication
- Regularly rotate Firebase service account keys
- Monitor Firebase Console for suspicious activity
- Keep Firebase Admin SDK updated to latest version

---

## SECTION 7 — LOCAL DEVELOPMENT

### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.frontend.example .env
   # Edit .env with your Firebase configuration
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Access application:**
   - Open browser to `http://localhost:3000`
   - Vite proxy will forward API requests to backend

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Place Firebase service account:**
   - Save service account JSON file securely
   - Set `FIREBASE_SERVICE_ACCOUNT_PATH` in .env
   - Alternatively, use individual environment variables

4. **Start development server:**
   ```bash
   python main.py
   # OR
   uvicorn main:app --reload --port 8001
   ```

5. **Access API documentation:**
   - Open browser to `http://localhost:8001/docs`
   - Interactive API documentation via Swagger UI

### Required Environment Variables

#### Frontend (.env)
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# API Configuration
VITE_API_URL=  # Leave empty for Vite proxy
VITE_TENANT_ID=american_logics
```

#### Backend (.env)
```env
# Firebase Admin Configuration
FIREBASE_SERVICE_ACCOUNT_PATH=path/to/service-account.json
# OR
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Data Source Configuration
DATA_SOURCE=csv

# Database Configuration (for user metadata)
DATABASE_URL=postgresql://user:password@host:port/database

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Tenant Configuration
DEFAULT_TENANT=american_logics
TENANT_HEADER=X-Tenant-ID
```

---

## SECTION 8 — TESTING CHECKLIST

### Frontend Testing

- [ ] Firebase initializes without errors
- [ ] Login page renders correctly
- [ ] Login form accepts email/password
- [ ] Invalid password shows error message
- [ ] Valid credentials authenticate successfully
- [ ] User session persists across page refreshes
- [ ] Logout works correctly
- [ ] Protected routes redirect to login when not authenticated
- [ ] Protected routes allow access when authenticated
- [ ] ID token is obtained after login
- [ ] ID token is included in API requests
- [ ] Token refresh works automatically

### Backend Testing

- [ ] Firebase Admin SDK initializes without errors
- [ ] Valid Firebase token is accepted
- [ ] Invalid token is rejected with 401
- [ ] Expired token is rejected with 401
- [ ] Correct Firebase UID is extracted from token
- [ ] User email is extracted from token
- [ ] Firebase UID maps to application user
- [ ] Client/tenant information is retrieved correctly
- [ ] Tenant isolation works with authenticated users
- [ ] License/subscription validation works
- [ ] Protected endpoints return 401 without token
- [ ] Protected endpoints return data with valid token

### End-to-End Testing

- [ ] User can access login page
- [ ] User can enter credentials
- [ ] User receives Firebase ID token after login
- [ ] User is redirected to dashboard after login
- [ ] Frontend sends token to FastAPI in Authorization header
- [ ] FastAPI verifies token successfully
- [ ] Dashboard API returns data
- [ ] All dashboard sections load correctly
- [ ] Portfolio APIs work with authentication
- [ ] Workforce APIs work with authentication
- [ ] Project APIs work with authentication
- [ ] User can logout
- [ ] Logout clears session
- [ ] User is redirected to login after logout
- [ ] Protected APIs are inaccessible after logout

### Error Handling Testing

- [ ] Network errors during login are handled gracefully
- [ ] Firebase initialization failures are handled
- [ ] Token verification failures show user-friendly errors
- [ ] API errors are displayed to users
- [ ] Session expiration prompts re-authentication
- [ ] CORS errors are resolved

---

## CONCLUSION

This guide provides a complete roadmap for implementing Firebase Authentication in the CIO Dashboard application. Follow the migration steps systematically and test each phase before proceeding to the next.

The key principles are:
1. Firebase handles identity authentication
2. Application database handles business logic and user metadata
3. Backend always verifies Firebase tokens
4. Frontend manages Firebase authentication state
5. Security is maintained through proper token handling

For questions or issues, refer to the [Firebase Documentation](https://firebase.google.com/docs) and the [FastAPI Documentation](https://fastapi.tiangolo.com/).
