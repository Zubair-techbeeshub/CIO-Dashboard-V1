from fastapi import Request, HTTPException
from config import settings
import re
from sqlalchemy import create_engine, text

# Database connection for tenant resolution
engine = create_engine(settings.database_url)

class TenantManager:
    """Multi-tenant management utilities"""

    @staticmethod
    def get_tenant_id(request: Request) -> str:
        """Extract tenant ID from request headers or subdomain"""

        # Try header first
        tenant_header = request.headers.get(settings.TENANT_HEADER)
        if tenant_header:
            return tenant_header.lower().replace(" ", "_")

        # Try subdomain if enabled
        if settings.TENANT_FROM_SUBDOMAIN:
            host = request.headers.get("host", "")
            # Extract subdomain from host (e.g., client1.techbeeshub.com -> client1)
            match = re.match(r"^([^\.]+)\..*\..*$", host)
            if match:
                subdomain = match.group(1)
                # Skip common subdomains
                if subdomain not in ["www", "api", "app", "staging", "dev"]:
                    return subdomain.lower().replace(" ", "_")

        # Return default tenant
        return settings.DEFAULT_TENANT

    @staticmethod
    def validate_tenant(tenant_id: str) -> bool:
        """Validate tenant ID format and existence"""
        # Basic validation - alphanumeric, underscore, hyphen only
        if not re.match(r"^[a-zA-Z0-9_-]+$", tenant_id):
            return False

        # Check if tenant exists in database
        try:
            query = "SELECT COUNT(*) FROM clients WHERE client_id = :client_id AND is_active = true"
            with engine.connect() as conn:
                result = conn.execute(text(query), {"client_id": tenant_id})
                count = result.fetchone()[0]
                return count > 0
        except:
            # If database is not available, fall back to basic validation
            return True

    @staticmethod
    def get_tenant_data_dir(tenant_id: str) -> str:
        """Get tenant-specific data directory"""
        return f"tenant_{tenant_id}"

    @staticmethod
    def get_client_info(tenant_id: str) -> dict:
        """Get client information from database"""
        try:
            query = """
            SELECT id, client_id, name, domain, industry, company_size,
                   license_start_date, license_end_date, max_users,
                   subscription_plan, is_active
            FROM clients
            WHERE client_id = :client_id AND is_active = true
            """
            with engine.connect() as conn:
                result = conn.execute(text(query), {"client_id": tenant_id})
                client = result.fetchone()

            if client:
                return {
                    "id": str(client.id),
                    "client_id": client.client_id,
                    "name": client.name,
                    "domain": client.domain,
                    "industry": client.industry,
                    "company_size": client.company_size,
                    "license_start_date": client.license_start_date.isoformat() if client.license_start_date else None,
                    "license_end_date": client.license_end_date.isoformat() if client.license_end_date else None,
                    "max_users": client.max_users,
                    "subscription_plan": client.subscription_plan,
                    "is_active": client.is_active
                }
        except Exception as e:
            print(f"Error getting client info: {e}")

        return None

# Dependency for FastAPI routes
def get_tenant(request: Request) -> str:
    """FastAPI dependency to get current tenant"""
    tenant_id = TenantManager.get_tenant_id(request)

    if not TenantManager.validate_tenant(tenant_id):
        raise HTTPException(status_code=400, detail="Invalid or inactive tenant")

    return tenant_id
