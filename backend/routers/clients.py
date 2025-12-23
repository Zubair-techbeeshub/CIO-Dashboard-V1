from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date
from sqlalchemy import create_engine, text
from config import settings

from tenant import get_tenant

router = APIRouter()

# Database connection
engine = create_engine(settings.database_url)

# Security scheme
security = HTTPBearer()

# Pydantic models
class ClientCreate(BaseModel):
    client_id: str
    name: str
    domain: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    contact_email: EmailStr
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    license_start_date: date
    license_end_date: date
    max_users: int = 10
    subscription_plan: str = "basic"
    billing_cycle: str = "monthly"
    monthly_cost: float = 0.0

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    license_start_date: Optional[date] = None
    license_end_date: Optional[date] = None
    max_users: Optional[int] = None
    subscription_plan: Optional[str] = None
    billing_cycle: Optional[str] = None
    monthly_cost: Optional[float] = None
    is_active: Optional[bool] = None

class UserCreate(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: str = "user"
    department: Optional[str] = None
    job_title: Optional[str] = None
    phone: Optional[str] = None
    subscription_start_date: date
    subscription_end_date: date

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    job_title: Optional[str] = None
    phone: Optional[str] = None
    subscription_start_date: Optional[date] = None
    subscription_end_date: Optional[date] = None
    is_active: Optional[bool] = None

class ClientResponse(BaseModel):
    id: str
    client_id: str
    name: str
    domain: Optional[str]
    industry: Optional[str]
    company_size: Optional[str]
    contact_email: str
    contact_phone: Optional[str]
    address: Optional[str]
    is_active: bool
    license_start_date: Optional[date]
    license_end_date: Optional[date]
    max_users: int
    subscription_plan: str
    billing_cycle: str
    monthly_cost: float
    created_at: str
    updated_at: str

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    role: str
    department: Optional[str]
    job_title: Optional[str]
    phone: Optional[str]
    is_active: bool
    email_verified: bool
    subscription_start_date: Optional[date]
    subscription_end_date: Optional[date]
    last_login: Optional[str]
    created_at: str

def get_current_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated admin user"""
    from .auth import verify_token

    token_data = verify_token(credentials.credentials)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Get user from database with role check
    query = """
    SELECT u.id, u.email, u.role, c.client_id
    FROM users u
    JOIN clients c ON u.client_id = c.id
    WHERE u.id = :user_id AND u.is_active = true AND u.role = 'admin'
    """

    with engine.connect() as conn:
        result = conn.execute(text(query), {"user_id": token_data["user_id"]})
        user = result.fetchone()

    if not user:
        raise HTTPException(status_code=403, detail="Admin access required")

    return user

@router.post("/clients", response_model=ClientResponse)
async def create_client(client_data: ClientCreate, admin_user: tuple = Depends(get_current_admin_user)):
    """Create a new client (Admin only)"""
    try:
        # Check if client_id already exists
        check_query = "SELECT COUNT(*) FROM clients WHERE client_id = :client_id"
        with engine.connect() as conn:
            result = conn.execute(text(check_query), {"client_id": client_data.client_id})
            if result.fetchone()[0] > 0:
                raise HTTPException(status_code=400, detail="Client ID already exists")

        # Insert new client
        insert_query = """
        INSERT INTO clients (
            client_id, name, domain, industry, company_size, contact_email,
            contact_phone, address, license_start_date, license_end_date,
            max_users, subscription_plan, billing_cycle, monthly_cost
        )
        VALUES (:client_id, :name, :domain, :industry, :company_size, :contact_email,
                :contact_phone, :address, :license_start_date, :license_end_date,
                :max_users, :subscription_plan, :billing_cycle, :monthly_cost)
        RETURNING id, created_at, updated_at
        """

        with engine.connect() as conn:
            result = conn.execute(text(insert_query), {
                "client_id": client_data.client_id, "name": client_data.name, "domain": client_data.domain,
                "industry": client_data.industry, "company_size": client_data.company_size, "contact_email": client_data.contact_email,
                "contact_phone": client_data.contact_phone, "address": client_data.address, "license_start_date": client_data.license_start_date,
                "license_end_date": client_data.license_end_date, "max_users": client_data.max_users, "subscription_plan": client_data.subscription_plan,
                "billing_cycle": client_data.billing_cycle, "monthly_cost": client_data.monthly_cost
            })
            new_client = result.fetchone()
            conn.commit()

        return ClientResponse(
            id=str(new_client.id),
            client_id=client_data.client_id,
            name=client_data.name,
            domain=client_data.domain,
            industry=client_data.industry,
            company_size=client_data.company_size,
            contact_email=client_data.contact_email,
            contact_phone=client_data.contact_phone,
            address=client_data.address,
            is_active=True,
            license_start_date=client_data.license_start_date,
            license_end_date=client_data.license_end_date,
            max_users=client_data.max_users,
            subscription_plan=client_data.subscription_plan,
            billing_cycle=client_data.billing_cycle,
            monthly_cost=client_data.monthly_cost,
            created_at=new_client.created_at.isoformat(),
            updated_at=new_client.updated_at.isoformat()
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create client: {str(e)}")

@router.get("/clients", response_model=List[ClientResponse])
async def list_clients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    admin_user: tuple = Depends(get_current_admin_user)
):
    """List all clients (Admin only)"""
    try:
        query = """
        SELECT id, client_id, name, domain, industry, company_size, contact_email,
               contact_phone, address, is_active, license_start_date, license_end_date,
               max_users, subscription_plan, billing_cycle, monthly_cost,
               created_at, updated_at
        FROM clients
        ORDER BY created_at DESC
        LIMIT %s OFFSET %s
        """

        with engine.connect() as conn:
            result = conn.execute(text(query), (limit, skip))
            clients = result.fetchall()

        return [
            ClientResponse(
                id=str(client.id),
                client_id=client.client_id,
                name=client.name,
                domain=client.domain,
                industry=client.industry,
                company_size=client.company_size,
                contact_email=client.contact_email,
                contact_phone=client.contact_phone,
                address=client.address,
                is_active=client.is_active,
                license_start_date=client.license_start_date,
                license_end_date=client.license_end_date,
                max_users=client.max_users,
                subscription_plan=client.subscription_plan,
                billing_cycle=client.billing_cycle,
                monthly_cost=float(client.monthly_cost),
                created_at=client.created_at.isoformat(),
                updated_at=client.updated_at.isoformat()
            )
            for client in clients
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list clients: {str(e)}")

@router.get("/clients/{client_id}", response_model=ClientResponse)
async def get_client(client_id: str, admin_user: tuple = Depends(get_current_admin_user)):
    """Get client details (Admin only)"""
    try:
        query = """
        SELECT id, client_id, name, domain, industry, company_size, contact_email,
               contact_phone, address, is_active, license_start_date, license_end_date,
               max_users, subscription_plan, billing_cycle, monthly_cost,
               created_at, updated_at
        FROM clients
        WHERE client_id = %s
        """

        with engine.connect() as conn:
            result = conn.execute(text(query), (client_id,))
            client = result.fetchone()

        if not client:
            raise HTTPException(status_code=404, detail="Client not found")

        return ClientResponse(
            id=str(client.id),
            client_id=client.client_id,
            name=client.name,
            domain=client.domain,
            industry=client.industry,
            company_size=client.company_size,
            contact_email=client.contact_email,
            contact_phone=client.contact_phone,
            address=client.address,
            is_active=client.is_active,
            license_start_date=client.license_start_date,
            license_end_date=client.license_end_date,
            max_users=client.max_users,
            subscription_plan=client.subscription_plan,
            billing_cycle=client.billing_cycle,
            monthly_cost=float(client.monthly_cost),
            created_at=client.created_at.isoformat(),
            updated_at=client.updated_at.isoformat()
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get client: {str(e)}")

@router.put("/clients/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: str,
    client_data: ClientUpdate,
    admin_user: tuple = Depends(get_current_admin_user)
):
    """Update client details (Admin only)"""
    try:
        # Build update query dynamically
        update_fields = []
        values = []

        for field, value in client_data.dict(exclude_unset=True).items():
            if value is not None:
                update_fields.append(f"{field} = %s")
                values.append(value)

        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")

        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        values.append(client_id)

        query = f"""
        UPDATE clients
        SET {', '.join(update_fields)}
        WHERE client_id = %s
        RETURNING id, client_id, name, domain, industry, company_size, contact_email,
                  contact_phone, address, is_active, license_start_date, license_end_date,
                  max_users, subscription_plan, billing_cycle, monthly_cost,
                  created_at, updated_at
        """

        with engine.connect() as conn:
            result = conn.execute(text(query), values)
            updated_client = result.fetchone()
            conn.commit()

        if not updated_client:
            raise HTTPException(status_code=404, detail="Client not found")

        return ClientResponse(
            id=str(updated_client.id),
            client_id=updated_client.client_id,
            name=updated_client.name,
            domain=updated_client.domain,
            industry=updated_client.industry,
            company_size=updated_client.company_size,
            contact_email=updated_client.contact_email,
            contact_phone=updated_client.contact_phone,
            address=updated_client.address,
            is_active=updated_client.is_active,
            license_start_date=updated_client.license_start_date,
            license_end_date=updated_client.license_end_date,
            max_users=updated_client.max_users,
            subscription_plan=updated_client.subscription_plan,
            billing_cycle=updated_client.billing_cycle,
            monthly_cost=float(updated_client.monthly_cost),
            created_at=updated_client.created_at.isoformat(),
            updated_at=updated_client.updated_at.isoformat()
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update client: {str(e)}")

@router.post("/clients/{client_id}/users", response_model=UserResponse)
async def create_user_for_client(
    client_id: str,
    user_data: UserCreate,
    admin_user: tuple = Depends(get_current_admin_user)
):
    """Create a user for a specific client (Admin only)"""
    try:
        # Get client ID
        client_query = "SELECT id FROM clients WHERE client_id = %s AND is_active = true"
        with engine.connect() as conn:
            result = conn.execute(text(client_query), (client_id,))
            client = result.fetchone()

        if not client:
            raise HTTPException(status_code=404, detail="Client not found")

        # Check if email already exists
        email_check = "SELECT COUNT(*) FROM users WHERE email = %s"
        with engine.connect() as conn:
            result = conn.execute(text(email_check), (user_data.email,))
            if result.fetchone()[0] > 0:
                raise HTTPException(status_code=400, detail="Email already exists")

        # Hash password (default password for new users)
        import bcrypt
        default_password = "password123"
        password_hash = bcrypt.hashpw(default_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Insert new user
        insert_query = """
        INSERT INTO users (
            client_id, email, password_hash, first_name, last_name, role,
            department, job_title, phone, subscription_start_date, subscription_end_date
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id, created_at
        """

        with engine.connect() as conn:
            result = conn.execute(text(insert_query), (
                str(client.id), user_data.email, password_hash, user_data.first_name,
                user_data.last_name, user_data.role, user_data.department,
                user_data.job_title, user_data.phone, user_data.subscription_start_date,
                user_data.subscription_end_date
            ))
            new_user = result.fetchone()
            conn.commit()

        return UserResponse(
            id=str(new_user.id),
            email=user_data.email,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            role=user_data.role,
            department=user_data.department,
            job_title=user_data.job_title,
            phone=user_data.phone,
            is_active=True,
            email_verified=False,
            subscription_start_date=user_data.subscription_start_date,
            subscription_end_date=user_data.subscription_end_date,
            last_login=None,
            created_at=new_user.created_at.isoformat()
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

@router.get("/clients/{client_id}/users", response_model=List[UserResponse])
async def list_users_for_client(
    client_id: str,
    admin_user: tuple = Depends(get_current_admin_user)
):
    """List users for a specific client (Admin only)"""
    try:
        query = """
        SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.department,
               u.job_title, u.phone, u.is_active, u.email_verified,
               u.subscription_start_date, u.subscription_end_date,
               u.last_login, u.created_at
        FROM users u
        JOIN clients c ON u.client_id = c.id
        WHERE c.client_id = %s
        ORDER BY u.created_at DESC
        """

        with engine.connect() as conn:
            result = conn.execute(text(query), (client_id,))
            users = result.fetchall()

        return [
            UserResponse(
                id=str(user.id),
                email=user.email,
                first_name=user.first_name,
                last_name=user.last_name,
                role=user.role,
                department=user.department,
                job_title=user.job_title,
                phone=user.phone,
                is_active=user.is_active,
                email_verified=user.email_verified,
                subscription_start_date=user.subscription_start_date,
                subscription_end_date=user.subscription_end_date,
                last_login=user.last_login.isoformat() if user.last_login else None,
                created_at=user.created_at.isoformat()
            )
            for user in users
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list users: {str(e)}")