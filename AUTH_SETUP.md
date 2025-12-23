# YugabyteDB Authentication & Client Management Setup

This guide covers setting up authentication and multi-tenant client management using YugabyteDB.

## Overview

The system now includes:
- **User Authentication**: JWT-based login with password hashing
- **Client Management**: Multi-tenant client onboarding and management
- **Subscription Management**: License and user subscription tracking
- **Admin Panel**: Client and user management APIs

## Database Schema

### Clients Table
```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id VARCHAR(100) UNIQUE NOT NULL,        -- e.g., 'american_logics'
    name VARCHAR(255) NOT NULL,                    -- e.g., 'American Logics'
    domain VARCHAR(255),                           -- e.g., 'american-logics.com'
    industry VARCHAR(100),                         -- e.g., 'Technology Consulting'
    company_size VARCHAR(50),                      -- e.g., '51-200'
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    license_start_date DATE,                       -- When license starts
    license_end_date DATE,                         -- When license expires
    max_users INTEGER DEFAULT 10,                  -- Maximum allowed users
    subscription_plan VARCHAR(50) DEFAULT 'basic', -- basic, professional, enterprise
    billing_cycle VARCHAR(20) DEFAULT 'monthly',   -- monthly, yearly
    monthly_cost DECIMAL(10,2),                    -- Monthly subscription cost
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,           -- bcrypt hashed password
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',               -- user, admin, manager
    department VARCHAR(100),
    job_title VARCHAR(100),
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    subscription_start_date DATE,                  -- User subscription start
    subscription_end_date DATE,                    -- User subscription end
    last_login TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Setup Instructions

### 1. Update Environment Variables

Edit `backend/.env` with your YugabyteDB credentials:

```env
DATA_SOURCE=csv
DB_HOST=us-east-1.a72dffe2-ebd1-49fa-81cc-3ab1f16be337.aws.yugabyte.cloud
DB_PORT=5433
DB_NAME=yugabyte
DB_USER=your_username
DB_PASSWORD=your_actual_password
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
AUTO_REFRESH_ENABLED=false
REFRESH_INTERVAL_MINUTES=30
```

### 2. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Run Authentication Setup

```bash
cd backend
python setup_auth.py
```

This creates:
- Authentication tables
- Default clients (American Logics, Tech Corp, Data Solutions)
- Admin users for each client

### 4. Start the Application

```bash
# Backend
cd backend
python main.py

# Frontend (new terminal)
npm run dev
```

## API Endpoints

### Authentication
```
POST /api/auth/login
GET  /api/auth/me
GET  /api/auth/verify
POST /api/auth/logout
```

### Client Management (Admin Only)
```
GET    /api/admin/clients                    # List all clients
POST   /api/admin/clients                    # Create new client
GET    /api/admin/clients/{client_id}        # Get client details
PUT    /api/admin/clients/{client_id}        # Update client
GET    /api/admin/clients/{client_id}/users  # List client users
POST   /api/admin/clients/{client_id}/users  # Create user for client
```

## Default Test Accounts

| Client | Email | Password | Role |
|--------|-------|----------|------|
| American Logics | admin@american-logics.com | password123 | admin |
| Tech Corp Inc | admin@techcorp.com | password123 | admin |
| Data Solutions LLC | admin@datasolutions.com | password123 | admin |

## Usage Examples

### Login
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: american_logics" \
  -d '{"email":"admin@american-logics.com","password":"password123"}'
```

### Create New Client (Admin Only)
```bash
curl -X POST "http://localhost:8000/api/admin/clients" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "client_id": "new_client",
    "name": "New Client Inc",
    "contact_email": "admin@newclient.com",
    "license_start_date": "2025-01-01",
    "license_end_date": "2025-12-31",
    "max_users": 25,
    "subscription_plan": "professional",
    "monthly_cost": 499.99
  }'
```

### Create User for Client (Admin Only)
```bash
curl -X POST "http://localhost:8000/api/admin/clients/new_client/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "email": "user@newclient.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user",
    "department": "IT",
    "job_title": "Developer",
    "subscription_start_date": "2025-01-01",
    "subscription_end_date": "2025-12-31"
  }'
```

## Security Features

- **Password Hashing**: bcrypt with salt
- **JWT Tokens**: Secure authentication with expiration
- **License Validation**: Automatic license expiry checking
- **Subscription Management**: User-level subscription tracking
- **Role-Based Access**: Admin-only client management
- **Multi-Tenant Isolation**: Client data isolation

## Subscription Management

### License Levels
- **Basic**: 10 users, core features
- **Professional**: 50 users, advanced features
- **Enterprise**: Unlimited users, premium features

### Automatic Validation
- Login requests check license validity
- Expired licenses block access
- User subscriptions are validated per login
- Admin can update license dates

## Monitoring & Activity

The system includes activity logging for:
- User logins
- Client creation/updates
- User management actions
- License changes

## Troubleshooting

### Connection Issues
1. Verify YugabyteDB credentials in `.env`
2. Check SSL requirements (YugabyteDB Managed requires SSL)
3. Ensure database user has proper permissions

### Authentication Issues
1. Verify JWT_SECRET is set
2. Check password hashing (bcrypt)
3. Validate license and subscription dates

### Client Management Issues
1. Ensure admin role for client operations
2. Check client_id uniqueness
3. Verify license date formats

## Next Steps

1. **Email Integration**: Add email verification and password reset
2. **Audit Logging**: Enhanced activity tracking
3. **Billing Integration**: Automated billing and invoicing
4. **User Self-Service**: Password change, profile management
5. **Advanced Permissions**: Granular role-based access control