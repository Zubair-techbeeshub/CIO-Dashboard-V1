import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Project paths
    BASE_DIR = Path(__file__).resolve().parent
    DATA_DIR = BASE_DIR.parent / "data"
    
    # Data source configuration
    DATA_SOURCE = os.getenv("DATA_SOURCE", "csv")
    
    # Database configuration
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "cio_dashboard")
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    
    # External API configuration
    EXTERNAL_API_URL = os.getenv("EXTERNAL_API_URL", "")
    EXTERNAL_API_KEY = os.getenv("EXTERNAL_API_KEY", "")
    
    # CORS
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    
    # Multi-tenant configuration
    TENANT_HEADER = os.getenv("TENANT_HEADER", "X-Tenant-ID")
    TENANT_FROM_SUBDOMAIN = os.getenv("TENANT_FROM_SUBDOMAIN", "false").lower() == "true"
    DEFAULT_TENANT = os.getenv("DEFAULT_TENANT", "american_logics")
    
    @property
    def database_url(self):
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

settings = Settings()
