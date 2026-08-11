from fastapi import APIRouter, HTTPException, Request, Depends
from data_sources.factory import data_source
# from auth import get_current_firebase_user  # TEMPORARILY DISABLED FOR DEBUGGING

router = APIRouter()

@router.get("/technology")
async def get_technology_projects(request: Request):  # TEMPORARILY DISABLED: current_user: dict = Depends(get_current_firebase_user)
    """Get technology projects data"""
    tenant_id = request.headers.get("X-Tenant-ID", "american_logics")
    try:
        data = await data_source.load_technology_projects(tenant_id)
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/delivery-performance")
async def get_delivery_performance(request: Request):  # TEMPORARILY DISABLED: current_user: dict = Depends(get_current_firebase_user)
    """Get project delivery performance"""
    tenant_id = request.headers.get("X-Tenant-ID", "american_logics")
    try:
        data = await data_source.load_delivery_performance(tenant_id)
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/delivery")
async def get_delivery_performance_alt(request: Request):  # TEMPORARILY DISABLED: current_user: dict = Depends(get_current_firebase_user)
    """Get project delivery performance (alternative endpoint)"""
    tenant_id = request.headers.get("X-Tenant-ID", "american_logics")
    try:
        data = await data_source.load_delivery_performance(tenant_id)
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/incidents")
async def get_active_incidents(request: Request):  # TEMPORARILY DISABLED: current_user: dict = Depends(get_current_firebase_user)
    """Get active incidents"""
    tenant_id = request.headers.get("X-Tenant-ID", "american_logics")
    try:
        data = await data_source.load_active_incidents(tenant_id)
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))