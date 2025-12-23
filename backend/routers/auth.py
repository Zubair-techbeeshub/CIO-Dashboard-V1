from fastapi import APIRouter, HTTPException, Depends, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
import jwt
import bcrypt
import os
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from config import settings

from tenant import get_tenant

router = APIRouter()

# Database connection
engine = create_engine(settings.database_url)

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Pydantic models
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    role: str
    tenant_id: str

# Security scheme
security = HTTPBearer()

def create_access_token(data: dict) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get current authenticated user"""
    token_data = verify_token(credentials.credentials)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Get user from database with client information
    query = """
    SELECT
        u.id, u.email, u.first_name, u.last_name, u.role, u.department, u.job_title,
        u.subscription_start_date, u.subscription_end_date, u.is_active as user_active,
        c.client_id, c.name as client_name, c.is_active as client_active,
        c.license_end_date
    FROM users u
    JOIN clients c ON u.client_id = c.id
    WHERE u.id = :user_id AND u.is_active = true AND c.is_active = true
    """

    with engine.connect() as conn:
        result = conn.execute(text(query), {"user_id": token_data["user_id"]})
        user = result.fetchone()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # Check license validity
    from datetime import date
    today = date.today()
    if user.license_end_date and user.license_end_date < today:
        raise HTTPException(status_code=401, detail="Client license has expired")

    # Check user subscription validity
    if user.subscription_end_date and user.subscription_end_date < today:
        raise HTTPException(status_code=401, detail="User subscription has expired")

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
        "subscription_start_date": user.subscription_start_date.isoformat() if user.subscription_start_date else None,
        "subscription_end_date": user.subscription_end_date.isoformat() if user.subscription_end_date else None,
        "license_end_date": user.license_end_date.isoformat() if user.license_end_date else None
    }

@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, tenant_id: str = Depends(get_tenant)):
    """Authenticate user and return access token"""
    try:
        # Query user from database with client information
        query = """
        SELECT
            u.id, u.email, u.password_hash, u.first_name, u.last_name, u.role,
            u.department, u.job_title, u.subscription_start_date, u.subscription_end_date,
            u.is_active as user_active, u.email_verified,
            c.client_id, c.name as client_name, c.is_active as client_active,
            c.license_start_date, c.license_end_date
        FROM users u
        JOIN clients c ON u.client_id = c.id
        WHERE u.email = :email AND c.client_id = :client_id
        """

        with engine.connect() as conn:
            result = conn.execute(text(query), {"email": login_data.email, "client_id": tenant_id})
            user = result.fetchone()

        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Check if user account is active
        if not user.user_active:
            raise HTTPException(status_code=401, detail="Account is deactivated")

        # Check if client account is active
        if not user.client_active:
            raise HTTPException(status_code=401, detail="Client account is deactivated")

        # Check license validity
        from datetime import date
        today = date.today()
        if user.license_end_date and user.license_end_date < today:
            raise HTTPException(status_code=401, detail="Client license has expired")

        # Check user subscription validity
        if user.subscription_end_date and user.subscription_end_date < today:
            raise HTTPException(status_code=401, detail="User subscription has expired")

        # Verify password
        if not bcrypt.checkpw(login_data.password.encode('utf-8'), user.password_hash.encode('utf-8')):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Update last login
        update_query = """
        UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = :user_id
        """
        with engine.connect() as conn:
            conn.execute(text(update_query), {"user_id": str(user.id)})
            conn.commit()

        # Create user data for response
        user_data = {
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "department": user.department,
            "job_title": user.job_title,
            "client_id": user.client_id,
            "client_name": user.client_name,
            "subscription_start_date": user.subscription_start_date.isoformat() if user.subscription_start_date else None,
            "subscription_end_date": user.subscription_end_date.isoformat() if user.subscription_end_date else None,
            "license_end_date": user.license_end_date.isoformat() if user.license_end_date else None
        }

        # Create JWT token
        access_token = create_access_token({
            "sub": str(user.id),
            "email": user.email,
            "client_id": user.client_id,
            "user_id": str(user.id)
        })

        return LoginResponse(
            access_token=access_token,
            expires_in=JWT_EXPIRATION_HOURS * 3600,
            user=user_data
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout user (client-side token removal)"""
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(**current_user)

@router.get("/verify")
async def verify_token_endpoint(current_user: dict = Depends(get_current_user)):
    """Verify if token is valid"""
    return {"valid": True, "user": current_user}