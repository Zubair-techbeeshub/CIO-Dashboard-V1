from .base import DataSourceBase
from .csv_source import CSVDataSource
from .database_source import DatabaseDataSource
from config import settings

class DataSourceFactory:
    """Factory to create appropriate data source based on configuration"""
    
    @staticmethod
    def create_data_source() -> DataSourceBase:
        """Create and return data source instance"""
        data_source = settings.DATA_SOURCE.lower()
        
        if data_source == "csv" or data_source == "excel":
            return CSVDataSource()
        elif data_source in ["postgres", "mysql", "database"]:
            return DatabaseDataSource()
        else:
            # Default to CSV
            return CSVDataSource()

# Global instance
data_source = DataSourceFactory.create_data_source()
