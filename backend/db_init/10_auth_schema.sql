-- Auth schema and seed data for local Postgres

-- Ensure UUID generation is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Clients/Tenants table with subscription management
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    industry VARCHAR(100),
    company_size VARCHAR(50),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    license_start_date DATE,
    license_end_date DATE,
    max_users INTEGER DEFAULT 10,
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- monthly, yearly
    monthly_cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table with subscription dates
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    department VARCHAR(100),
    job_title VARCHAR(100),
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    subscription_start_date DATE,
    subscription_end_date DATE,
    last_login TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User sessions (optional, for session management)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User activity log
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(255),
    details JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clients_client_id ON clients(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_domain ON clients(domain);
CREATE INDEX IF NOT EXISTS idx_clients_active ON clients(is_active);
CREATE INDEX IF NOT EXISTS idx_clients_license_dates ON clients(license_start_date, license_end_date);

CREATE INDEX IF NOT EXISTS idx_users_client_id ON users(client_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_subscription_dates ON users(subscription_start_date, subscription_end_date);

CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at);

-- Insert default client (American Logics)
INSERT INTO clients (
    client_id, name, domain, industry, company_size, contact_email,
    license_start_date, license_end_date, max_users, subscription_plan,
    monthly_cost
)
VALUES (
    'american_logics',
    'American Logics',
    'americanlogics.com',
    'Technology Consulting',
    '51-200',
    'admin@americanlogics.com',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year',
    50,
    'enterprise',
    999.99
)
ON CONFLICT (client_id) DO NOTHING;

-- Insert default admin user for American Logics (password: americanlogics321)
INSERT INTO users (
    client_id, email, password_hash, first_name, last_name, role,
    subscription_start_date, subscription_end_date, email_verified
)
SELECT
    c.id,
    'admin@americanlogics.com',
    '$2b$12$svfro/4EmCuHEBlhkFwjVufTnzuKmKwhnBnC5ULhXGMJ1czKOBnu6',
    'Admin',
    'User',
    'admin',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year',
    true
FROM clients c
WHERE c.client_id = 'american_logics'
ON CONFLICT (email) DO NOTHING;

-- Optional demo clients and users
INSERT INTO clients (
    client_id, name, domain, industry, company_size, contact_email,
    license_start_date, license_end_date, max_users, subscription_plan,
    monthly_cost
)
VALUES
    (
        'tech_corp',
        'Tech Corp Inc',
        'techcorp.com',
        'Software Development',
        '201-500',
        'admin@techcorp.com',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '1 year',
        100,
        'enterprise',
        1999.99
    ),
    (
        'data_solutions',
        'Data Solutions LLC',
        'datasolutions.com',
        'Data Analytics',
        '11-50',
        'admin@datasolutions.com',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '6 months',
        25,
        'professional',
        499.99
    )
ON CONFLICT (client_id) DO NOTHING;

-- Demo users
INSERT INTO users (
    client_id, email, password_hash, first_name, last_name, role,
    department, job_title, subscription_start_date, subscription_end_date, email_verified
)
SELECT
    c.id,
    'admin@techcorp.com',
    '$2b$12$haCMeUv8yDB29X4L7YnLC.OA40fuzm2DQzCQOggrle8Q.RLa9Yuge',
    'John',
    'Smith',
    'admin',
    'IT',
    'CIO',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year',
    true
FROM clients c
WHERE c.client_id = 'tech_corp'
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (
    client_id, email, password_hash, first_name, last_name, role,
    department, job_title, subscription_start_date, subscription_end_date, email_verified
)
SELECT
    c.id,
    'admin@datasolutions.com',
    '$2b$12$5v7uR9jPlPcx9J3PeMDQ3u84lm35x1gP.pt85ttucteQUjQRQgE.y',
    'Sarah',
    'Johnson',
    'admin',
    'Analytics',
    'Data Director',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '6 months',
    true
FROM clients c
WHERE c.client_id = 'data_solutions'
ON CONFLICT (email) DO NOTHING;
