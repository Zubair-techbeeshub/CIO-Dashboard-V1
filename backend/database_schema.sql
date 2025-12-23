-- YugabyteDB Schema for CIO Dashboard
-- Multi-tenant database schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Executive Summary Metrics
CREATE TABLE IF NOT EXISTS executive_summary_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,2),
    metric_unit VARCHAR(50),
    display_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, metric_name)
);

-- Portfolio Programs
CREATE TABLE IF NOT EXISTS portfolio_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    program_name VARCHAR(255) NOT NULL,
    budget_type VARCHAR(50),
    annual_budget DECIMAL(12,2),
    ytd_actual DECIMAL(12,2),
    target_ytd DECIMAL(12,2),
    variance_percentage DECIMAL(5,2),
    status VARCHAR(20),
    poc VARCHAR(255),
    top3_issues TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Application Health
CREATE TABLE IF NOT EXISTS application_health (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    application_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    health_score DECIMAL(5,2),
    uptime_percentage DECIMAL(5,2),
    response_time_ms INTEGER,
    error_rate DECIMAL(5,2),
    user_satisfaction DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Technology Projects
CREATE TABLE IF NOT EXISTS technology_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    project_manager VARCHAR(255),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12,2),
    spent DECIMAL(12,2),
    progress_percentage DECIMAL(5,2),
    status VARCHAR(50),
    priority VARCHAR(20),
    risk_level VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workforce Metrics
CREATE TABLE IF NOT EXISTS workforce_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    total_employees INTEGER,
    vacant_positions INTEGER,
    turnover_rate DECIMAL(5,2),
    average_tenure DECIMAL(5,2),
    training_hours INTEGER,
    satisfaction_score DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Skills Distribution
CREATE TABLE IF NOT EXISTS skills_distribution (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    employee_count INTEGER,
    demand_level VARCHAR(20),
    proficiency_level DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Delivery Performance
CREATE TABLE IF NOT EXISTS delivery_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    planned_value DECIMAL(10,2),
    actual_value DECIMAL(10,2),
    variance DECIMAL(10,2),
    variance_percentage DECIMAL(5,2),
    period VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spend Categories
CREATE TABLE IF NOT EXISTS spend_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    budgeted_amount DECIMAL(12,2),
    actual_spend DECIMAL(12,2),
    variance DECIMAL(12,2),
    variance_percentage DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Monthly Spend Trend
CREATE TABLE IF NOT EXISTS monthly_spend_trend (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    month VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    total_spend DECIMAL(12,2),
    capex_spend DECIMAL(12,2),
    opex_spend DECIMAL(12,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, month, year)
);

-- Project Summary
CREATE TABLE IF NOT EXISTS project_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, metric_name)
);

-- Project Completion Trend
CREATE TABLE IF NOT EXISTS project_completion_trend (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    month VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    completed_projects INTEGER,
    total_projects INTEGER,
    completion_rate DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, month, year)
);

-- Vulnerability Trend
CREATE TABLE IF NOT EXISTS vulnerability_trend (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    month VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    vulnerability_count INTEGER,
    severity_level VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Active Incidents
CREATE TABLE IF NOT EXISTS active_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    incident_id VARCHAR(100) NOT NULL,
    title VARCHAR(500),
    severity VARCHAR(20),
    status VARCHAR(50),
    assigned_to VARCHAR(255),
    created_date TIMESTAMP WITH TIME ZONE,
    resolved_date TIMESTAMP WITH TIME ZONE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_executive_summary_tenant ON executive_summary_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_programs_tenant ON portfolio_programs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_application_health_tenant ON application_health(tenant_id);
CREATE INDEX IF NOT EXISTS idx_technology_projects_tenant ON technology_projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workforce_metrics_tenant ON workforce_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_skills_distribution_tenant ON skills_distribution(tenant_id);
CREATE INDEX IF NOT EXISTS idx_delivery_performance_tenant ON delivery_performance(tenant_id);
CREATE INDEX IF NOT EXISTS idx_spend_categories_tenant ON spend_categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_monthly_spend_trend_tenant ON monthly_spend_trend(tenant_id);
CREATE INDEX IF NOT EXISTS idx_project_summary_tenant ON project_summary(tenant_id);
CREATE INDEX IF NOT EXISTS idx_project_completion_trend_tenant ON project_completion_trend(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vulnerability_trend_tenant ON vulnerability_trend(tenant_id);
CREATE INDEX IF NOT EXISTS idx_active_incidents_tenant ON active_incidents(tenant_id);

-- Insert default tenant
INSERT INTO tenants (tenant_id, name, domain) VALUES
('american_logics', 'American Logics', 'american-logics.com')
ON CONFLICT (tenant_id) DO NOTHING;