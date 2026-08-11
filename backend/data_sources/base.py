from abc import ABC, abstractmethod
from typing import Any, Dict, List
import pandas as pd

class DataSourceBase(ABC):
    """Base class for all data sources"""
    
    @abstractmethod
    async def load_executive_summary(self, tenant_id: str = None) -> Dict[str, Any]:
        """Load executive summary data"""
        pass
    
    @abstractmethod
    async def load_portfolio_programs(self, tenant_id: str = None) -> List[Dict[str, Any]]:
        """Load portfolio programs data"""
        pass
    
    @abstractmethod
    async def load_application_health(self, tenant_id: str = None) -> List[Dict[str, Any]]:
        """Load application health data"""
        pass
    
    @abstractmethod
    async def load_technology_projects(self, tenant_id: str = None) -> List[Dict[str, Any]]:
        """Load technology projects data"""
        pass
    
    @abstractmethod
    async def load_workforce_metrics(self, tenant_id: str = None) -> List[Dict[str, Any]]:
        """Load workforce metrics data"""
        pass
    
    @abstractmethod
    async def load_delivery_performance(self, tenant_id: str = None) -> List[Dict[str, Any]]:
        """Load delivery performance data"""
        pass

    @abstractmethod
    async def load_spend_trend(self, tenant_id: str = None) -> List[Dict[str, Any]]:
        """Load monthly spend trend data"""
        pass

    @abstractmethod
    async def load_spend_categories(self, tenant_id: str = None) -> List[Dict[str, Any]]:
        """Load spend categories data"""
        pass

    @abstractmethod
    async def load_skills_distribution(self, tenant_id: str = None) -> List[Dict[str, Any]]:
        """Load skills distribution data"""
        pass

    @abstractmethod
    async def load_active_incidents(self, tenant_id: str = None) -> List[Dict[str, Any]]:
        """Load active incidents data"""
        pass
    
    def clean_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and standardize dataframe"""
        # Remove empty rows
        df = df.dropna(how='all')
        
        # Strip whitespace from string columns
        string_columns = df.select_dtypes(include=['object']).columns
        for col in string_columns:
            df[col] = df[col].str.strip() if df[col].dtype == 'object' else df[col]
        
        return df
