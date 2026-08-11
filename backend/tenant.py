from fastapi import Request, HTTPException
from config import settings
import re

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

        # Note: Database authentication has been removed.
        # Tenant validation now only checks format, not database existence.
        # This allows the application to work without database authentication.
        return True

    @staticmethod
    def get_tenant_data_dir(tenant_id: str) -> str:
        """Get tenant-specific data directory"""
        return f"tenant_{tenant_id}"

    @staticmethod
    def get_client_info(tenant_id: str) -> dict:
        """Get client information from database"""
        # Note: Database authentication has been removed.
        # This function is disabled as it depends on the authentication database.
        # Future implementation with Firebase will map Firebase UIDs to client metadata.
        return None

# Dependency for FastAPI routes
def get_tenant(request: Request) -> str:
    """FastAPI dependency to get current tenant"""
    tenant_id = TenantManager.get_tenant_id(request)

    # Note: Database validation disabled - authentication removed
    # Only basic format validation is performed
    if not TenantManager.validate_tenant(tenant_id):
        raise HTTPException(status_code=400, detail="Invalid tenant ID format")

    return tenant_id
