#!/usr/bin/env python3
"""
Data Migration Script for YugabyteDB
Migrates CSV data to database tables
"""

import pandas as pd
import os
from pathlib import Path
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import sys

# Load environment variables
load_dotenv()

# Database configuration
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5433")
DB_NAME = os.getenv("DB_NAME", "cio_dashboard")
DB_USER = os.getenv("DB_USER", "yugabyte")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

def get_tenant_directories():
    """Get all tenant directories"""
    data_dir = Path(__file__).parent / "data"
    return [d for d in data_dir.iterdir() if d.is_dir() and d.name.startswith("tenant_")]

def extract_tenant_id(dir_name):
    """Extract tenant ID from directory name"""
    return dir_name.replace("tenant_", "")

def migrate_executive_summary(engine, tenant_id, csv_path):
    """Migrate executive summary data"""
    try:
        df = pd.read_csv(csv_path)
        with engine.connect() as conn:
            # Clear existing data for this tenant
            conn.execute(text("DELETE FROM executive_summary_metrics WHERE tenant_id = :tenant_id"), {"tenant_id": tenant_id})
            conn.commit()

            # Insert new data
            for idx, row in df.iterrows():
                conn.execute(text("""
                    INSERT INTO executive_summary_metrics
                    (tenant_id, metric_name, metric_value, metric_unit, display_order)
                    VALUES (:tenant_id, :metric_name, :metric_value, :metric_unit, :display_order)
                """), {
                    "tenant_id": tenant_id,
                    "metric_name": row['Metric'],
                    "metric_value": float(row['Value']) if pd.notna(row['Value']) else 0,
                    "metric_unit": row.get('Unit', ''),
                    "display_order": idx
                })
            conn.commit()
        print(f"✓ Migrated executive summary for {tenant_id}")
    except Exception as e:
        print(f"✗ Failed to migrate executive summary for {tenant_id}: {e}")

def migrate_portfolio_programs(engine, tenant_id, csv_path):
    """Migrate portfolio programs data"""
    try:
        df = pd.read_csv(csv_path)
        with engine.connect() as conn:
            conn.execute(text("DELETE FROM portfolio_programs WHERE tenant_id = :tenant_id"), {"tenant_id": tenant_id})
            conn.commit()

            for _, row in df.iterrows():
                conn.execute(text("""
                    INSERT INTO portfolio_programs
                    (tenant_id, program_name, budget_type, annual_budget, ytd_actual, target_ytd,
                     variance_percentage, status, poc, top3_issues)
                    VALUES (:tenant_id, :program_name, :budget_type, :annual_budget, :ytd_actual, :target_ytd,
                           :variance_percentage, :status, :poc, :top3_issues)
                """), {
                    "tenant_id": tenant_id,
                    "program_name": row['Program Name'],
                    "budget_type": row['Budget Type'],
                    "annual_budget": float(row['Annual Budget ($M)']) if pd.notna(row['Annual Budget ($M)']) else 0,
                    "ytd_actual": float(row['YTD Actual ($M)']) if pd.notna(row['YTD Actual ($M)']) else 0,
                    "target_ytd": float(row['Target YTD ($M)']) if pd.notna(row['Target YTD ($M)']) else 0,
                    "variance_percentage": float(row['Variance %']) if pd.notna(row['Variance %']) else 0,
                    "status": row['Status'],
                    "poc": row['POC'],
                    "top3_issues": row['Top3Issues']
                })
            conn.commit()
        print(f"✓ Migrated portfolio programs for {tenant_id}")
    except Exception as e:
        print(f"✗ Failed to migrate portfolio programs for {tenant_id}: {e}")

def migrate_application_health(engine, tenant_id, csv_path):
    """Migrate application health data"""
    try:
        df = pd.read_csv(csv_path)
        with engine.connect() as conn:
            conn.execute(text("DELETE FROM application_health WHERE tenant_id = :tenant_id"), {"tenant_id": tenant_id})
            conn.commit()

            for _, row in df.iterrows():
                conn.execute(text("""
                    INSERT INTO application_health
                    (tenant_id, application_name, category, health_score, uptime_percentage,
                     response_time_ms, error_rate, user_satisfaction)
                    VALUES (:tenant_id, :application_name, :category, :health_score, :uptime_percentage,
                           :response_time_ms, :error_rate, :user_satisfaction)
                """), {
                    "tenant_id": tenant_id,
                    "application_name": row.get('Application Name', ''),
                    "category": row.get('Category', ''),
                    "health_score": float(row.get('Health Score', 0)) if pd.notna(row.get('Health Score', 0)) else 0,
                    "uptime_percentage": float(row.get('Uptime %', 0)) if pd.notna(row.get('Uptime %', 0)) else 0,
                    "response_time_ms": int(row.get('Response Time (ms)', 0)) if pd.notna(row.get('Response Time (ms)', 0)) else 0,
                    "error_rate": float(row.get('Error Rate %', 0)) if pd.notna(row.get('Error Rate %', 0)) else 0,
                    "user_satisfaction": float(row.get('User Satisfaction', 0)) if pd.notna(row.get('User Satisfaction', 0)) else 0
                })
            conn.commit()
        print(f"✓ Migrated application health for {tenant_id}")
    except Exception as e:
        print(f"✗ Failed to migrate application health for {tenant_id}: {e}")

def migrate_technology_projects(engine, tenant_id, csv_path):
    """Migrate technology projects data"""
    try:
        df = pd.read_csv(csv_path)
        with engine.connect() as conn:
            conn.execute(text("DELETE FROM technology_projects WHERE tenant_id = :tenant_id"), {"tenant_id": tenant_id})
            conn.commit()

            for _, row in df.iterrows():
                conn.execute(text("""
                    INSERT INTO technology_projects
                    (tenant_id, project_name, project_manager, start_date, end_date, budget, spent,
                     progress_percentage, status, priority, risk_level)
                    VALUES (:tenant_id, :project_name, :project_manager, :start_date, :end_date, :budget, :spent,
                           :progress_percentage, :status, :priority, :risk_level)
                """), {
                    "tenant_id": tenant_id,
                    "project_name": row.get('Project Name', ''),
                    "project_manager": row.get('Project Manager', ''),
                    "start_date": row.get('Start Date'),
                    "end_date": row.get('End Date'),
                    "budget": float(row.get('Budget ($M)', 0)) if pd.notna(row.get('Budget ($M)', 0)) else 0,
                    "spent": float(row.get('Spent ($M)', 0)) if pd.notna(row.get('Spent ($M)', 0)) else 0,
                    "progress_percentage": float(row.get('Progress %', 0)) if pd.notna(row.get('Progress %', 0)) else 0,
                    "status": row.get('Status', ''),
                    "priority": row.get('Priority', ''),
                    "risk_level": row.get('Risk Level', '')
                })
            conn.commit()
        print(f"✓ Migrated technology projects for {tenant_id}")
    except Exception as e:
        print(f"✗ Failed to migrate technology projects for {tenant_id}: {e}")

def migrate_workforce_metrics(engine, tenant_id, csv_path):
    """Migrate workforce metrics data"""
    try:
        df = pd.read_csv(csv_path)
        with engine.connect() as conn:
            conn.execute(text("DELETE FROM workforce_metrics WHERE tenant_id = :tenant_id"), {"tenant_id": tenant_id})
            conn.commit()

            for _, row in df.iterrows():
                conn.execute(text("""
                    INSERT INTO workforce_metrics
                    (tenant_id, department, total_employees, vacant_positions, turnover_rate,
                     average_tenure, training_hours, satisfaction_score)
                    VALUES (:tenant_id, :department, :total_employees, :vacant_positions, :turnover_rate,
                           :average_tenure, :training_hours, :satisfaction_score)
                """), {
                    "tenant_id": tenant_id,
                    "department": row.get('Department', ''),
                    "total_employees": int(row.get('Total Employees', 0)) if pd.notna(row.get('Total Employees', 0)) else 0,
                    "vacant_positions": int(row.get('Vacant Positions', 0)) if pd.notna(row.get('Vacant Positions', 0)) else 0,
                    "turnover_rate": float(row.get('Turnover Rate %', 0)) if pd.notna(row.get('Turnover Rate %', 0)) else 0,
                    "average_tenure": float(row.get('Average Tenure (Years)', 0)) if pd.notna(row.get('Average Tenure (Years)', 0)) else 0,
                    "training_hours": int(row.get('Training Hours', 0)) if pd.notna(row.get('Training Hours', 0)) else 0,
                    "satisfaction_score": float(row.get('Satisfaction Score', 0)) if pd.notna(row.get('Satisfaction Score', 0)) else 0
                })
            conn.commit()
        print(f"✓ Migrated workforce metrics for {tenant_id}")
    except Exception as e:
        print(f"✗ Failed to migrate workforce metrics for {tenant_id}: {e}")

def migrate_project_summary(engine, tenant_id, csv_path):
    """Migrate project summary data"""
    try:
        df = pd.read_csv(csv_path)
        with engine.connect() as conn:
            conn.execute(text("DELETE FROM project_summary WHERE tenant_id = :tenant_id"), {"tenant_id": tenant_id})
            conn.commit()

            for _, row in df.iterrows():
                conn.execute(text("""
                    INSERT INTO project_summary (tenant_id, metric_name, metric_value)
                    VALUES (:tenant_id, :metric_name, :metric_value)
                """), {
                    "tenant_id": tenant_id,
                    "metric_name": row['Metric'],
                    "metric_value": int(row['Value']) if pd.notna(row['Value']) else 0
                })
            conn.commit()
        print(f"✓ Migrated project summary for {tenant_id}")
    except Exception as e:
        print(f"✗ Failed to migrate project summary for {tenant_id}: {e}")

def migrate_project_completion_trend(engine, tenant_id, csv_path):
    """Migrate project completion trend data"""
    try:
        df = pd.read_csv(csv_path)
        with engine.connect() as conn:
            conn.execute(text("DELETE FROM project_completion_trend WHERE tenant_id = :tenant_id"), {"tenant_id": tenant_id})
            conn.commit()

            for _, row in df.iterrows():
                conn.execute(text("""
                    INSERT INTO project_completion_trend
                    (tenant_id, month, year, completed_projects, total_projects, completion_rate)
                    VALUES (:tenant_id, :month, :year, :completed_projects, :total_projects, :completion_rate)
                """), {
                    "tenant_id": tenant_id,
                    "month": row.get('Month', ''),
                    "year": int(row.get('Year', 2024)) if pd.notna(row.get('Year', 2024)) else 2024,
                    "completed_projects": int(row.get('Completed', 0)) if pd.notna(row.get('Completed', 0)) else 0,
                    "total_projects": int(row.get('Total', 0)) if pd.notna(row.get('Total', 0)) else 0,
                    "completion_rate": float(row.get('Completion Rate %', 0)) if pd.notna(row.get('Completion Rate %', 0)) else 0
                })
            conn.commit()
        print(f"✓ Migrated project completion trend for {tenant_id}")
    except Exception as e:
        print(f"✗ Failed to migrate project completion trend for {tenant_id}: {e}")

def migrate_vulnerability_trend(engine, tenant_id, csv_path):
    """Migrate vulnerability trend data"""
    try:
        df = pd.read_csv(csv_path)
        with engine.connect() as conn:
            conn.execute(text("DELETE FROM vulnerability_trend WHERE tenant_id = :tenant_id"), {"tenant_id": tenant_id})
            conn.commit()

            for _, row in df.iterrows():
                conn.execute(text("""
                    INSERT INTO vulnerability_trend
                    (tenant_id, month, year, vulnerability_count, severity_level)
                    VALUES (:tenant_id, :month, :year, :vulnerability_count, :severity_level)
                """), {
                    "tenant_id": tenant_id,
                    "month": row.get('Month', ''),
                    "year": int(row.get('Year', 2024)) if pd.notna(row.get('Year', 2024)) else 2024,
                    "vulnerability_count": int(row.get('Count', 0)) if pd.notna(row.get('Count', 0)) else 0,
                    "severity_level": row.get('Severity', '')
                })
            conn.commit()
        print(f"✓ Migrated vulnerability trend for {tenant_id}")
    except Exception as e:
        print(f"✗ Failed to migrate vulnerability trend for {tenant_id}: {e}")

def main():
    """Main migration function"""
    print("🚀 Starting data migration to YugabyteDB...")

    try:
        engine = create_engine(DATABASE_URL)
        print("✓ Connected to database")
    except Exception as e:
        print(f"✗ Failed to connect to database: {e}")
        sys.exit(1)

    tenant_dirs = get_tenant_directories()
    if not tenant_dirs:
        print("✗ No tenant directories found")
        sys.exit(1)

    for tenant_dir in tenant_dirs:
        tenant_id = extract_tenant_id(tenant_dir.name)
        print(f"\n📁 Processing tenant: {tenant_id}")

        # Define CSV files and their migration functions
        migrations = [
            ("executive_summary.csv", migrate_executive_summary),
            ("portfolio_programs.csv", migrate_portfolio_programs),
            ("application_health.csv", migrate_application_health),
            ("technology_projects.csv", migrate_technology_projects),
            ("workforce_metrics.csv", migrate_workforce_metrics),
            ("project_summary.csv", migrate_project_summary),
            ("project_completion_trend.csv", migrate_project_completion_trend),
            ("vulnerability_trend.csv", migrate_vulnerability_trend),
        ]

        for csv_file, migrate_func in migrations:
            csv_path = tenant_dir / csv_file
            if csv_path.exists():
                migrate_func(engine, tenant_id, csv_path)
            else:
                print(f"⚠️  {csv_file} not found for {tenant_id}")

    print("\n✅ Data migration completed!")

if __name__ == "__main__":
    main()