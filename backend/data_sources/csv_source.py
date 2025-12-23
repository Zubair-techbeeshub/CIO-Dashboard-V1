import pandas as pd
from pathlib import Path
from typing import Any, Dict, List
from .base import DataSourceBase
from config import settings

class CSVDataSource(DataSourceBase):
    """Load data from CSV files"""
    
    def __init__(self):
        self.base_data_dir = settings.DATA_DIR
    
    def _get_tenant_data_dir(self, tenant_id: str) -> Path:
        """Get tenant-specific data directory"""
        # Convert tenant ID to directory format (american-logics -> tenant_american_logics)
        tenant_dir_name = f"tenant_{tenant_id.replace('-', '_')}"
        return self.base_data_dir / tenant_dir_name
    
    def _read_csv(self, filename: str, tenant_id: str = None) -> pd.DataFrame:
        """Read CSV file and return cleaned dataframe"""
        if tenant_id:
            data_dir = self._get_tenant_data_dir(tenant_id)
        else:
            data_dir = self.base_data_dir
            
        filepath = data_dir / filename
        df = pd.read_csv(filepath)
        return self.clean_dataframe(df)
    
    async def load_executive_summary(self, tenant_id: str = None) -> Dict[str, Any]:
        """Load executive summary KPIs"""
        df = self._read_csv("executive_summary.csv", tenant_id)
        metrics = {}
        for _, row in df.iterrows():
            try:
                metrics[row['Metric']] = float(row['Value'])
            except (ValueError, TypeError):
                metrics[row['Metric']] = row['Value']
        
        proj_summary = self._read_csv("project_summary.csv", tenant_id)
        proj_metrics = {}
        for _, row in proj_summary.iterrows():
            try:
                proj_metrics[row['Metric']] = float(row['Value'])
            except (ValueError, TypeError):
                proj_metrics[row['Metric']] = row['Value']
        
        completion_trend = self._read_csv("project_completion_trend.csv", tenant_id)
        vuln_trend = self._read_csv("vulnerability_trend.csv", tenant_id)
        
        # Convert completion trend to proper format
        completion_records = []
        for _, row in completion_trend.iterrows():
            completion_records.append({
                "Month": row['Month'],
                "Completed": int(row['Completed'])
            })
        
        vuln_records = []
        for _, row in vuln_trend.iterrows():
            vuln_records.append({
                "Month": row['Month'],
                "Count": int(row['Count'])
            })
        
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
                "completionTrend": completion_records
            },
            "vulnerabilityTrend": vuln_records
        }
    
    async def load_portfolio_programs(self, tenant_id: str = None) -> List[Dict[str, Any]]:
        """Load portfolio programs data"""
        df = self._read_csv("portfolio_programs.csv", tenant_id)
        programs = []
        
        for _, row in df.iterrows():
            programs.append({
                "programName": row['Program Name'],
                "budgetType": row['Budget Type'],
                "annualBudget": float(row['Annual Budget ($M)']),
                "ytdActual": float(row['YTD Actual ($M)']),
                "targetYtd": float(row['Target YTD ($M)']),
                "variance": float(row['Variance %']),
                "status": row['Status'],
                "poc": row['POC'],
                "top3Issues": row['Top3Issues'].split('|') if pd.notna(row['Top3Issues']) else []
            })
        
        return programs
    
    async def load_application_health(self, tenant_id: str = None) -> List[Dict[str, Any]]:
        """Load application health data"""
        df = self._read_csv("application_health.csv", tenant_id)
        apps = []
        
        for _, row in df.iterrows():
            apps.append({
                "application": row['Application'],
                "domain": row['Domain'],
                "availability": float(row['Availability %']),
                "incidents": int(row['Incidents (90 Days)']),
                "patchCompliance": float(row['Patch Compliance %']),
                "status": row['Status'],
                "downIncidences3Months": int(row['DownIncidences3Months'])
            })
        
        return apps
    
    async def load_technology_projects(self, tenant_id: str = None) -> List[Dict[str, Any]]:
        """Load technology projects data"""
        df = self._read_csv("technology_projects.csv", tenant_id)
        df = df.fillna('')  # Replace NaN with empty string
        projects = []
        
        for _, row in df.iterrows():
            projects.append({
                "domain": row['Domain'],
                "projectName": row['Project Name'],
                "budget": float(row['Budget ($M)']) if row['Budget ($M)'] != '' else 0.0,
                "actual": float(row['Actual ($M)']) if row['Actual ($M)'] != '' else 0.0,
                "scheduleStatus": row['Schedule Status'],
                "topIssue": row['Top Issue'],
                "poc": row['POC']
            })
        
        return projects
    
    async def load_workforce_metrics(self, tenant_id: str = None) -> List[Dict[str, Any]]:
        """Load workforce metrics data"""
        df = self._read_csv("workforce_metrics.csv", tenant_id)
        metrics = []
        
        for _, row in df.iterrows():
            metrics.append({
                "resourceType": row['Resource Type'],
                "plannedHours": int(row['Planned Hours']),
                "actualHours": int(row['Actual Hours']),
                "variancePercent": float(row['Variance %']),
                "openPositions": int(row['Open Positions']),
                "utilizationRate": int(row['UtilizationRate'])
            })
        
        return metrics
    
    async def load_delivery_performance(self, tenant_id: str = None) -> List[Dict[str, Any]]:
        """Load delivery performance data"""
        df = self._read_csv("delivery_performance.csv", tenant_id)
        performance = []
        
        for _, row in df.iterrows():
            performance.append({
                "project": row['Project'],
                "milestonesOnTime": int(row['Milestones On-Time %']),
                "scopeChanges90Days": int(row['Scope Changes (90 Days)']),
                "budgetBurn": int(row['Budget Burn %']),
                "hoursBurn": int(row['Hours Burn %']),
                "avgDaysProcurementToWA": int(row['AvgDaysProcurementToWA'])
            })
        
        return performance
    
    async def load_spend_trend(self, tenant_id: str = None) -> List[Dict[str, Any]]:
        """Load monthly spend trend data"""
        df = self._read_csv("monthly_spend_trend.csv", tenant_id)
        return df.to_dict('records')
    
    async def load_spend_categories(self, tenant_id: str = None) -> List[Dict[str, Any]]:
        """Load spend categories data"""
        df = self._read_csv("spend_categories.csv", tenant_id)
        return df.to_dict('records')
    
    async def load_skills_distribution(self, tenant_id: str = None) -> List[Dict[str, Any]]:
        """Load skills distribution data"""
        df = self._read_csv("skills_distribution.csv", tenant_id)
        return df.to_dict('records')
    
    async def load_active_incidents(self) -> List[Dict[str, Any]]:
        """Load active incidents data"""
        df = self._read_csv("active_incidents.csv")
        return df.to_dict('records')
