from typing import Any, Dict, List
from sqlalchemy import create_engine, text
import pandas as pd
from .base import DataSourceBase
from config import settings

class DatabaseDataSource(DataSourceBase):
    """Load data from YugabyteDB (PostgreSQL-compatible)"""

    def __init__(self):
        self.engine = create_engine(settings.database_url)

    def _execute_query(self, query: str, tenant_id: str = None) -> pd.DataFrame:
        """Execute SQL query and return dataframe"""
        with self.engine.connect() as conn:
            if tenant_id:
                # Add tenant filtering if tenant_id is provided
                if "WHERE" in query:
                    query = query.replace("WHERE", f"WHERE tenant_id = '{tenant_id}' AND")
                else:
                    query += f" WHERE tenant_id = '{tenant_id}'"
            df = pd.read_sql(text(query), conn)
            return self.clean_dataframe(df)

    async def load_executive_summary(self, tenant_id: str = None) -> Dict[str, Any]:
        """Load executive summary from database"""
        query = """
        SELECT
            metric_name,
            metric_value,
            metric_unit
        FROM executive_summary_metrics
        WHERE is_active = true
        ORDER BY display_order
        """
        df = self._execute_query(query, tenant_id)

        metrics = {}
        for _, row in df.iterrows():
            metrics[row['metric_name']] = row['metric_value']

        # Load project summary
        proj_query = """
        SELECT metric_name, metric_value
        FROM project_summary
        WHERE is_active = true
        """
        proj_df = self._execute_query(proj_query, tenant_id)
        proj_metrics = {}
        for _, row in proj_df.iterrows():
            proj_metrics[row['metric_name']] = row['metric_value']

        # Load completion trend
        trend_query = """
        SELECT month, year, completed_projects, total_projects, completion_rate
        FROM project_completion_trend
        WHERE is_active = true
        ORDER BY year, month
        """
        trend_df = self._execute_query(trend_query, tenant_id)

        # Load vulnerability trend
        vuln_query = """
        SELECT month, year, vulnerability_count as count, severity_level
        FROM vulnerability_trend
        WHERE is_active = true
        ORDER BY year, month
        """
        vuln_df = self._execute_query(vuln_query, tenant_id)

        return {
            "yoyRevenueGrowth": metrics.get('YoYRevenueGrowth', 0),
            "totalITSpend": metrics.get('TotalITSpend', 0),
            "itSpendAsPercentRevenue": metrics.get('ITSpendAsPercentRevenue', 0),
            "budgetUtilization": metrics.get('BudgetUtilization', 0),
            "systemUptime": metrics.get('SystemUptime', 0),
            "securityIncidentsMoM": metrics.get('SecurityIncidentsMoM', 0),
            "responseTimeMin": metrics.get('ResponseTimeMin', 0),
            "cloudSpend": metrics.get('CloudSpend', 0),
            "cloudCapacityUtilization": metrics.get('CloudCapacityUtilization', 0),
            "projectSummary": {
                "inProgress": proj_metrics.get('InProgress', 0),
                "atRisk": proj_metrics.get('AtRisk', 0),
                "completed": proj_metrics.get('Completed', 0),
                "completionTrend": trend_df.to_dict('records')
            },
            "vulnerabilityTrend": vuln_df.to_dict('records')
        }

    async def load_portfolio_programs(self, tenant_id: str = None) -> List[Dict[str, Any]]:
        """Load portfolio programs from database"""
        query = """
        SELECT
            program_name,
            budget_type,
            annual_budget,
            ytd_actual,
            target_ytd,
            variance_percentage,
            status,
            poc,
            top3_issues
        FROM portfolio_programs
        WHERE is_active = true
        ORDER BY program_name
        """
        df = self._execute_query(query, tenant_id)
        return df.to_dict('records')

    async def load_application_health(self, tenant_id: str = None) -> List[Dict[str, Any]]:
        """Load application health from database"""
        query = """
        SELECT
            application_name,
            category,
            health_score,
            uptime_percentage,
            response_time_ms,
            error_rate,
            user_satisfaction
        FROM application_health
        WHERE is_active = true
        ORDER BY application_name
        """
        df = self._execute_query(query, tenant_id)
        return df.to_dict('records')

    async def load_technology_projects(self, tenant_id: str = None) -> List[Dict[str, Any]]:
        """Load technology projects from database"""
        query = """
        SELECT
            project_name,
            project_manager,
            start_date,
            end_date,
            budget,
            spent,
            progress_percentage,
            status,
            priority,
            risk_level
        FROM technology_projects
        WHERE is_active = true
        ORDER BY project_name
        """
        df = self._execute_query(query, tenant_id)
        return df.to_dict('records')

    async def load_workforce_metrics(self, tenant_id: str = None) -> List[Dict[str, Any]]:
        """Load workforce metrics from database"""
        query = """
        SELECT
            department,
            total_employees,
            vacant_positions,
            turnover_rate,
            average_tenure,
            training_hours,
            satisfaction_score
        FROM workforce_metrics
        WHERE is_active = true
        ORDER BY department
        """
        df = self._execute_query(query, tenant_id)
        return df.to_dict('records')

    async def load_delivery_performance(self, tenant_id: str = None) -> List[Dict[str, Any]]:
        """Load delivery performance from database"""
        query = """
        SELECT
            metric_name,
            planned_value,
            actual_value,
            variance,
            variance_percentage,
            period
        FROM delivery_performance
        WHERE is_active = true
        ORDER BY metric_name
        """
        df = self._execute_query(query, tenant_id)
        return df.to_dict('records')

    async def load_spend_categories(self, tenant_id: str = None) -> List[Dict[str, Any]]:
        """Load spend categories from database"""
        query = """
        SELECT
            category_name,
            budgeted_amount,
            actual_spend,
            variance,
            variance_percentage
        FROM spend_categories
        WHERE is_active = true
        ORDER BY category_name
        """
        df = self._execute_query(query, tenant_id)
        return df.to_dict('records')

    async def load_monthly_spend_trend(self, tenant_id: str = None) -> List[Dict[str, Any]]:
        """Load monthly spend trend from database"""
        query = """
        SELECT
            month,
            year,
            total_spend,
            capex_spend,
            opex_spend
        FROM monthly_spend_trend
        WHERE is_active = true
        ORDER BY year, month
        """
        df = self._execute_query(query, tenant_id)
        return df.to_dict('records')

    async def load_skills_distribution(self, tenant_id: str = None) -> List[Dict[str, Any]]:
        """Load skills distribution from database"""
        query = """
        SELECT
            skill_name,
            employee_count,
            demand_level,
            proficiency_level
        FROM skills_distribution
        WHERE is_active = true
        ORDER BY skill_name
        """
        df = self._execute_query(query, tenant_id)
        return df.to_dict('records')

    async def load_active_incidents(self, tenant_id: str = None) -> List[Dict[str, Any]]:
        """Load active incidents from database"""
        query = """
        SELECT
            incident_id,
            title,
            severity,
            status,
            assigned_to,
            created_date,
            resolved_date,
            description
        FROM active_incidents
        WHERE is_active = true
        ORDER BY created_date DESC
        """
        df = self._execute_query(query, tenant_id)
        return df.to_dict('records')
