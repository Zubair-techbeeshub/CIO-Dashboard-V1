-- Multi-Tenant CIO Dashboard Database Schema
-- Single database with tenant isolation using tenant_id

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tenants table (one record per client)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'american_logics', 'client1', 'client2'
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255), -- e.g., 'client1.techbeeshub.com'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table (users belong to specific tenants)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user', -- 'admin', 'user', 'viewer'
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(tenant_id, email)
);

-- User sessions/tokens
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Executive Summary Metrics
CREATE TABLE executive_summary_metrics (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL,
    metric_unit VARCHAR(20),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, metric_name)
);

-- Project Summary
CREATE TABLE project_summary (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    metric VARCHAR(50) NOT NULL,
    value INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, metric)
);

-- Project Completion Trend
CREATE TABLE project_completion_trend (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    month VARCHAR(20) NOT NULL,
    completed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, month)
);

-- Vulnerability Trend
CREATE TABLE vulnerability_trend (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    month VARCHAR(20) NOT NULL,
    vulnerabilities INTEGER DEFAULT 0,
    severity VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Portfolio Programs
CREATE TABLE portfolio_programs (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    program_name VARCHAR(100) NOT NULL,
    budget_type VARCHAR(50),
    annual_budget DECIMAL,
    ytd_actual DECIMAL,
    target_ytd DECIMAL,
    variance DECIMAL,
    status VARCHAR(20),
    poc VARCHAR(100),
    top3_issues TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Application Health
CREATE TABLE application_health (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    application VARCHAR(100) NOT NULL,
    domain VARCHAR(50),
    availability DECIMAL,
    incidents INTEGER,
    patch_compliance DECIMAL,
    status VARCHAR(20),
    down_incidences_3months INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Technology Projects
CREATE TABLE technology_projects (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    domain VARCHAR(50),
    project_name VARCHAR(100) NOT NULL,
    budget DECIMAL,
    actual DECIMAL,
    schedule_status VARCHAR(50),
    top_issue TEXT,
    poc VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Workforce Metrics
CREATE TABLE workforce_metrics (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    planned_hours DECIMAL,
    actual_hours DECIMAL,
    variance DECIMAL,
    open_positions INTEGER,
    utilization_rate DECIMAL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Delivery Performance
CREATE TABLE delivery_performance (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    project VARCHAR(100) NOT NULL,
    milestones_on_time DECIMAL,
    scope_changes_90days INTEGER,
    budget_burn DECIMAL,
    hours_burn DECIMAL,
    avg_days_procurement_to_wa DECIMAL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Active Incidents
CREATE TABLE active_incidents (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    incident_id VARCHAR(50),
    title VARCHAR(200),
    severity VARCHAR(20),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- Skills Distribution
CREATE TABLE skills_distribution (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    employee_count INTEGER,
    proficiency_level VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Spend Trend
CREATE TABLE spend_trend (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    month VARCHAR(20) NOT NULL,
    amount DECIMAL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Spend Categories
CREATE TABLE spend_categories (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL,
    percentage DECIMAL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tenant_metrics ON executive_summary_metrics(tenant_id);
CREATE INDEX idx_tenant_programs ON portfolio_programs(tenant_id);
CREATE INDEX idx_tenant_projects ON technology_projects(tenant_id);
CREATE INDEX idx_tenant_workforce ON workforce_metrics(tenant_id);
CREATE INDEX idx_tenant_incidents ON active_incidents(tenant_id);

-- Sample data for american_logics tenant
INSERT INTO tenants (tenant_id, name, domain) VALUES
('american_logics', 'American Logics', 'american-logics.techbeeshub.com');

-- Insert sample executive summary metrics
INSERT INTO executive_summary_metrics (tenant_id, metric_name, metric_value, metric_unit, display_order) VALUES
('american_logics', 'YoYRevenueGrowth', 12.5, '%', 1),
('american_logics', 'TotalITSpend', 4500000, '$', 2),
('american_logics', 'ITSpendAsPercentRevenue', 3.2, '%', 3),
('american_logics', 'BudgetUtilization', 87.5, '%', 4),
('american_logics', 'SystemUptime', 99.9, '%', 5),
('american_logics', 'SecurityIncidentsMoM', -15.2, '%', 6),
('american_logics', 'ResponseTimeMin', 2.3, 'min', 7),
('american_logics', 'CloudSpend', 1200000, '$', 8),
('american_logics', 'CloudCapacityUtilization', 78.5, '%', 9);

-- Insert sample project summary
INSERT INTO project_summary (tenant_id, metric, value) VALUES
('american_logics', 'InProgress', 12),
('american_logics', 'AtRisk', 3),
('american_logics', 'Completed', 28);

-- Insert sample project completion trend
INSERT INTO project_completion_trend (tenant_id, month, completed) VALUES
('american_logics', 'Jan', 2),
('american_logics', 'Feb', 3),
('american_logics', 'Mar', 4),
('american_logics', 'Apr', 2),
('american_logics', 'May', 3),
('american_logics', 'Jun', 5);

-- Insert sample vulnerability trend
INSERT INTO vulnerability_trend (tenant_id, month, vulnerabilities, severity) VALUES
('american_logics', 'Jan', 12, 'High'),
('american_logics', 'Feb', 8, 'Medium'),
('american_logics', 'Mar', 15, 'High'),
('american_logics', 'Apr', 6, 'Low'),
('american_logics', 'May', 9, 'Medium'),
('american_logics', 'Jun', 11, 'High');

-- Insert sample portfolio programs
INSERT INTO portfolio_programs (tenant_id, program_name, budget_type, annual_budget, ytd_actual, target_ytd, variance, status, poc, top3_issues) VALUES
('american_logics', 'Digital Transformation', 'Capital', 2500000, 1800000, 2000000, -10.0, 'On Track', 'John Smith', 'Resource allocation|Budget constraints|Timeline delays'),
('american_logics', 'Cloud Migration', 'Operational', 1800000, 1200000, 1350000, -11.1, 'At Risk', 'Sarah Johnson', 'Vendor delays|Security compliance|Training requirements'),
('american_logics', 'Data Analytics Platform', 'Capital', 1200000, 800000, 900000, -11.1, 'On Track', 'Mike Davis', 'Data quality|Integration complexity|User adoption');

-- Insert sample application health
INSERT INTO application_health (tenant_id, application, domain, availability, incidents, patch_compliance, status, down_incidences_3months) VALUES
('american_logics', 'ERP System', 'Finance', 99.8, 2, 95.5, 'Healthy', 1),
('american_logics', 'CRM Platform', 'Sales', 99.5, 5, 92.3, 'Warning', 3),
('american_logics', 'HR Management', 'HR', 99.9, 1, 97.8, 'Healthy', 0),
('american_logics', 'Supply Chain', 'Operations', 98.7, 8, 89.4, 'Critical', 5);

-- Insert sample technology projects
INSERT INTO technology_projects (tenant_id, domain, project_name, budget, actual, schedule_status, top_issue, poc) VALUES
('american_logics', 'Infrastructure', 'Network Upgrade', 500000, 420000, 'On Schedule', 'Vendor delivery delay', 'Tom Wilson'),
('american_logics', 'Security', 'Zero Trust Implementation', 750000, 680000, 'Slight Delay', 'User training requirements', 'Lisa Brown'),
('american_logics', 'Applications', 'Mobile App Development', 300000, 250000, 'Ahead', 'Feature scope creep', 'David Lee');

-- Insert sample workforce metrics
INSERT INTO workforce_metrics (tenant_id, resource_type, planned_hours, actual_hours, variance, open_positions, utilization_rate) VALUES
('american_logics', 'Developers', 16000, 15200, -5.0, 3, 95.0),
('american_logics', 'Analysts', 12000, 11800, -1.7, 1, 98.3),
('american_logics', 'Infrastructure', 8000, 7800, -2.5, 2, 97.5),
('american_logics', 'Security', 6000, 5900, -1.7, 0, 98.3);

-- Insert sample delivery performance
INSERT INTO delivery_performance (tenant_id, project, milestones_on_time, scope_changes_90days, budget_burn, hours_burn, avg_days_procurement_to_wa) VALUES
('american_logics', 'Network Upgrade', 85.7, 2, 84.0, 82.5, 14.2),
('american_logics', 'Zero Trust', 77.8, 4, 90.7, 88.9, 18.5),
('american_logics', 'Mobile App', 100.0, 1, 83.3, 81.2, 9.8);

-- Insert sample active incidents
INSERT INTO active_incidents (tenant_id, incident_id, title, severity, status) VALUES
('american_logics', 'INC-2025-001', 'Database Performance Issue', 'High', 'Investigating'),
('american_logics', 'INC-2025-002', 'Email Service Outage', 'Medium', 'Resolved'),
('american_logics', 'INC-2025-003', 'VPN Connectivity Problems', 'Low', 'Monitoring');

-- Insert sample skills distribution
INSERT INTO skills_distribution (tenant_id, skill_name, employee_count, proficiency_level) VALUES
('american_logics', 'Python', 25, 'Expert'),
('american_logics', 'JavaScript', 30, 'Advanced'),
('american_logics', 'AWS', 15, 'Expert'),
('american_logics', 'SQL', 20, 'Advanced'),
('american_logics', 'React', 18, 'Intermediate');

-- Insert sample spend trend
INSERT INTO spend_trend (tenant_id, month, amount, category) VALUES
('american_logics', 'Jan', 350000, 'Infrastructure'),
('american_logics', 'Feb', 380000, 'Infrastructure'),
('american_logics', 'Mar', 420000, 'Infrastructure'),
('american_logics', 'Apr', 390000, 'Infrastructure'),
('american_logics', 'May', 410000, 'Infrastructure'),
('american_logics', 'Jun', 450000, 'Infrastructure');

-- Insert sample spend categories
INSERT INTO spend_categories (tenant_id, category, amount, percentage) VALUES
('american_logics', 'Infrastructure', 2400000, 53.3),
('american_logics', 'Applications', 1200000, 26.7),
('american_logics', 'Security', 600000, 13.3),
('american_logics', 'Operations', 300000, 6.7);</content>
<parameter name="filePath">c:\Basha\TechbeesHub\American_Logics\CIO_Dashboard\database_schema.sql