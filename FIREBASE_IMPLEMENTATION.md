# Firebase Authentication Implementation

This document explains the Firebase Authentication implementation in the CIO Dashboard repository.

## Architecture Overview

The authentication flow follows this architecture:

```
User
  |
  v
React Login Page
  |
  | email + password
  v
Firebase Authentication
  |
  | Firebase ID Token
  v
React
  |
  | Authorization: Bearer <Firebase ID Token>
  v
FastAPI
  |
  | Firebase Admin SDK
  | verify_id_token()
  v
Authenticated API request
  |
  v
Existing Dashboard/Data layer
```

## Implementation Files

### Frontend Files

#### `src/firebase.ts`
**Purpose:** Firebase client initialization

**Changes:** Created new file
- Initializes Firebase with configuration from environment variables
- Uses singleton pattern to prevent multiple Firebase app instances
- Exports `app` and `auth` instances for use in other components

```typescript
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
```

#### `src/contexts/FirebaseAuthContext.tsx`
**Purpose:** Firebase authentication state management

**Changes:** Created new file
- Provides authentication context to the entire application
- Exposes user state, login/logout functions, and token acquisition
- Uses Firebase's `onAuthStateChanged()` to maintain authentication state
- Sets up token function for dataService to include Firebase tokens in API calls

```typescript
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  // Set the token function for dataService
  useEffect(() => {
    setTokenFunction(async () => {
      if (user) {
        try {
          const token = await user.getIdToken();
          return token;
        } catch (error) {
          console.error('Error getting ID token:', error);
          return null;
        }
      }
      return null;
    });
  }, [user]);

  // ... login, logout, getIdToken functions
};
```

#### `src/components/Login.tsx`
**Purpose:** Login UI component

**Changes:** Created new file
- Provides a professional login screen with email and password fields
- Handles Firebase authentication errors gracefully
- Redirects to dashboard after successful login
- Shows loading state during authentication

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    await login(email, password);
    navigate('/dashboard');
  } catch (err: any) {
    // Handle various Firebase error codes
    if (err.code === 'auth/user-not-found') {
      setError('User not found. Please check your email.');
    } else if (err.code === 'auth/wrong-password') {
      setError('Incorrect password. Please try again.');
    }
    // ... other error handling
  } finally {
    setLoading(false);
  }
};
```

#### `src/components/Login.css`
**Purpose:** Login component styling

**Changes:** Created new file
- Professional dark theme matching CIO Dashboard UI
- Responsive design
- Loading spinner styles

#### `src/components/ProtectedRoute.tsx`
**Purpose:** Protected route wrapper

**Changes:** Created new file
- Redirects unauthenticated users to `/login`
- Shows loading state while authentication is being determined
- Protects dashboard routes

```typescript
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

#### `src/App.tsx`
**Purpose:** Main application routing

**Changes:** Updated to use AuthProvider and protected routes
- Wrapped application with `AuthProvider`
- Added `/login` route
- Protected `/dashboard` route with `ProtectedRoute`
- Default route redirects to `/dashboard`

```typescript
function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}
```

#### `src/services/dataService.ts`
**Purpose:** API client service

**Changes:** Updated to include Firebase tokens in API calls
- Added token function registration mechanism
- Automatically includes Firebase ID token in Authorization header
- Maintains existing API response structure

```typescript
// Global variable to store the token function
let getTokenFunction: (() => Promise<string | null>) | null = null;

export function setTokenFunction(fn: () => Promise<string | null>) {
  getTokenFunction = fn;
}

async function apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
  // ... existing code

  // Get Firebase ID token if available
  let token: string | null = null;
  if (getTokenFunction) {
    try {
      token = await getTokenFunction();
    } catch (error) {
      console.log('Error getting Firebase token:', error);
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Tenant-ID': tenantId,
    ...options.headers as Record<string, string>,
  };

  // Add Firebase token to Authorization header if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // ... rest of API call
}
```

### Backend Files

#### `backend/firebase_config.py`
**Purpose:** Firebase Admin SDK initialization

**Changes:** Created new file
- Initializes Firebase Admin SDK using environment variables
- Handles escaped newlines in private key
- Provides Firebase Auth instance for token verification
- Safe initialization (prevents multiple initializations)

```python
def initialize_firebase():
    """Initialize Firebase Admin SDK using environment variables."""
    try:
        if not firebase_admin._apps:
            project_id = os.getenv("FIREBASE_PROJECT_ID")
            client_email = os.getenv("FIREBASE_CLIENT_EMAIL")
            private_key = os.getenv("FIREBASE_PRIVATE_KEY")

            if not all([project_id, client_email, private_key]):
                raise ValueError("Missing Firebase Admin credentials...")

            # Handle escaped newlines in private key
            private_key = private_key.replace("\\n", "\n")

            cred_dict = {
                "type": "service_account",
                "project_id": project_id,
                "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID", ""),
                "private_key": private_key,
                "client_email": client_email,
                "client_id": os.getenv("FIREBASE_CLIENT_ID", ""),
                # ... other fields
            }

            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            print("Firebase Admin SDK initialized successfully")
    except Exception as e:
        print(f"Error initializing Firebase Admin SDK: {e}")
        raise
```

#### `backend/auth.py`
**Purpose:** Firebase authentication dependency

**Changes:** Created new file
- Provides `get_current_firebase_user` dependency for FastAPI
- Verifies Firebase ID tokens using Firebase Admin SDK
- Handles various token error scenarios (expired, invalid, revoked)
- Returns decoded user information
- Provides optional authentication for testing

```python
async def get_current_firebase_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify Firebase ID token and return the decoded user information."""
    try:
        token = credentials.credentials
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        decoded_token = auth.verify_id_token(token)
        
        return {
            "uid": decoded_token.get("uid"),
            "email": decoded_token.get("email"),
            "email_verified": decoded_token.get("email_verified"),
            "name": decoded_token.get("name"),
            "picture": decoded_token.get("picture"),
            "firebase": decoded_token
        }
    except firebase_admin.auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Firebase ID token has expired")
    except firebase_admin.auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid Firebase ID token")
    # ... other error handling
```

#### `backend/main.py`
**Purpose:** FastAPI application initialization

**Changes:** Updated to initialize Firebase Admin SDK on startup
- Imports and calls `initialize_firebase()` on application startup
- Handles initialization errors gracefully (logs warning but doesn't crash)

```python
from firebase_config import initialize_firebase

# Initialize Firebase Admin SDK
try:
    initialize_firebase()
    print("Firebase Admin SDK initialized successfully")
except Exception as e:
    print(f"Warning: Firebase Admin SDK initialization failed: {e}")
    print("Firebase authentication will not be available")
```

#### `backend/requirements.txt`
**Purpose:** Python dependencies

**Changes:** Added Firebase Admin SDK
- Added `firebase-admin>=7.0.0` to dependencies

#### `backend/routers/dashboard.py`
**Purpose:** Dashboard API endpoints

**Changes:** Added Firebase authentication to all endpoints
- Imported `get_current_firebase_user` from `auth`
- Added `current_user: dict = Depends(get_current_firebase_user)` to all endpoints
- Maintains existing business logic unchanged

```python
from auth import get_current_firebase_user

@router.get("/executive-summary")
async def get_executive_summary(request: Request, current_user: dict = Depends(get_current_firebase_user)):
    """Get executive summary KPIs"""
    tenant_id = request.headers.get("X-Tenant-ID", "american_logics")
    try:
        data = await data_source.load_executive_summary(tenant_id)
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

#### `backend/routers/portfolio.py`
**Purpose:** Portfolio API endpoints

**Changes:** Added Firebase authentication to all endpoints
- Imported `get_current_firebase_user` from `auth`
- Added `current_user: dict = Depends(get_current_firebase_user)` to all endpoints
- Maintains existing business logic unchanged

#### `backend/routers/projects.py`
**Purpose:** Projects API endpoints

**Changes:** Added Firebase authentication to all endpoints
- Imported `get_current_firebase_user` from `auth`
- Added `current_user: dict = Depends(get_current_firebase_user)` to all endpoints
- Maintains existing business logic unchanged

#### `backend/routers/workforce.py`
**Purpose:** Workforce API endpoints

**Changes:** Added Firebase authentication to all endpoints
- Imported `get_current_firebase_user` from `auth`
- Added `current_user: dict = Depends(get_current_firebase_user)` to all endpoints
- Maintains existing business logic unchanged

### Configuration Files

#### `.env.frontend.example`
**Purpose:** Frontend environment variables template

**Changes:** Added Firebase configuration variables
- Added `VITE_FIREBASE_API_KEY`
- Added `VITE_FIREBASE_AUTH_DOMAIN`
- Added `VITE_FIREBASE_PROJECT_ID`
- Added `VITE_FIREBASE_STORAGE_BUCKET`
- Added `VITE_FIREBASE_MESSAGING_SENDER_ID`
- Added `VITE_FIREBASE_APP_ID`

#### `backend/.env.example`
**Purpose:** Backend environment variables template

**Changes:** Added Firebase Admin SDK configuration variables
- Added `FIREBASE_PROJECT_ID`
- Added `FIREBASE_CLIENT_EMAIL`
- Added `FIREBASE_PRIVATE_KEY`
- Added `FIREBASE_PRIVATE_KEY_ID`
- Added `FIREBASE_CLIENT_ID`

#### `package.json`
**Purpose:** Frontend dependencies

**Changes:** Added Firebase SDK
- Added `firebase` to dependencies (installed via npm)

## Authentication Flow

### Login Flow

1. User navigates to `/login`
2. User enters email and password
3. Login component calls `signInWithEmailAndPassword()`
4. Firebase validates credentials
5. If successful, Firebase returns user object
6. AuthContext updates user state
7. User is redirected to `/dashboard`
8. ProtectedRoute allows access (user is authenticated)

### API Request Flow

1. Dashboard component calls dataService to fetch data
2. dataService checks if user is authenticated
3. If authenticated, calls `getIdToken()` to get Firebase ID token
4. Token is added to `Authorization: Bearer <token>` header
5. Request is sent to FastAPI backend
6. FastAPI extracts token from Authorization header
7. Firebase Admin SDK verifies token using `verify_id_token()`
8. If valid, decoded user information is returned
9. API endpoint executes with user context
10. Data is returned to frontend

### Logout Flow

1. User clicks logout button
2. AuthContext calls `signOut()`
3. Firebase clears authentication state
4. AuthContext updates user state to null
5. User is redirected to `/login`
6. ProtectedRoute blocks access to `/dashboard`

## Security Considerations

1. **Never commit Firebase credentials to Git**
   - `.env` files are in `.gitignore`
   - Only `.env.example` files are committed with placeholders

2. **Firebase tokens are short-lived**
   - Firebase ID tokens expire after 1 hour
   - Frontend automatically refreshes tokens via `getIdToken()`

3. **Backend verifies every request**
   - Every API endpoint requires valid Firebase token
   - Tokens are verified using Firebase Admin SDK
   - Invalid/expired tokens return 401 Unauthorized

4. **Password security**
   - Passwords are never sent to backend
   - Only Firebase ID tokens are sent to backend
   - Passwords are never stored in localStorage

5. **Tenant handling**
   - Currently, tenant ID is still sent via `X-Tenant-ID` header
   - Future enhancement: Map Firebase UID to tenant in database
   - Do not blindly trust tenant ID from browser

## Testing Requirements

Before claiming completion, the following tests must be performed:

### Firebase Tests
- [ ] Firebase project configured
- [ ] Email/Password provider enabled
- [ ] Test user created
- [ ] Frontend Firebase initializes successfully
- [ ] Login succeeds with valid credentials
- [ ] Invalid credentials show an error
- [ ] Password is never sent to FastAPI
- [ ] Logout works
- [ ] Authentication state persists after refresh

### Frontend Tests
- [ ] /login works
- [ ] /dashboard redirects to /login when unauthenticated
- [ ] /dashboard opens after successful login
- [ ] Refreshing dashboard preserves authentication
- [ ] Logout redirects to /login
- [ ] No old database authentication code is being used

### Backend Tests
- [ ] FastAPI starts successfully
- [ ] Firebase Admin SDK initializes
- [ ] Valid Firebase ID token accepted
- [ ] Missing token returns 401
- [ ] Invalid token returns 401
- [ ] Expired token returns 401
- [ ] Dashboard APIs work with valid token
- [ ] Dashboard APIs reject unauthenticated requests

### End-to-End Test

1. Start backend: `uvicorn main:app --reload --port 8001`
2. Start frontend: `npm run dev`
3. Open `http://localhost:3000`
4. Verify redirect to `/login`
5. Enter Firebase test-user credentials
6. Verify Firebase login
7. Verify redirect to `/dashboard`
8. Verify dashboard data loads
9. Open browser DevTools → Network
10. Verify API calls contain `Authorization: Bearer <Firebase ID Token>`
11. Verify FastAPI accepts the request
12. Logout
13. Verify redirect to login
14. Try accessing `/dashboard` again
15. Verify unauthenticated access is blocked

## Running the Application

### Frontend
```bash
npm run dev
```

### Backend
```bash
cd backend
python main.py
```

## Next Steps for Deployment

1. Create Firebase project in production environment
2. Configure production Firebase credentials
3. Set up Firebase authorized domains for production frontend
4. Use secure environment variable management (AWS Secrets Manager, etc.)
5. Enable Firebase security rules if using Firestore/Realtime Database
6. Set up Firebase Analytics for monitoring
7. Implement Firebase UID to tenant mapping in database
8. Add Firebase App Check for additional security

## Troubleshooting

### Common Issues

1. **"Firebase: No Firebase App '[DEFAULT]' has been created"**
   - Check Firebase configuration in `.env`
   - Verify environment variables are loaded

2. **"auth/invalid-api-key"**
   - Verify Firebase API key is correct
   - Check for truncated values in `.env`

3. **Backend token verification fails**
   - Verify Firebase Admin SDK credentials
   - Check private key formatting (use `\n` for line breaks)
   - Ensure project ID matches between frontend and backend

4. **CORS errors**
   - Add frontend domain to Firebase authorized domains
   - Check backend CORS configuration

## Notes

- The old database authentication system has been completely removed
- All authentication now goes through Firebase
- Existing dashboard functionality remains unchanged
- API response structures remain unchanged
- Tenant handling via `X-Tenant-ID` header remains for now
- Future enhancement: Map Firebase UID to tenant in database for proper multi-tenant security