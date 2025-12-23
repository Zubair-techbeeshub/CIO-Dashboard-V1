from fastapi import APIRouter, HTTPException, Request
from data_sources.factory import data_source

router = APIRouter()

@router.get("/programs")
async def get_portfolio_programs(request: Request):
    """Get portfolio programs data"""
    tenant_id = request.headers.get("X-Tenant-ID", "american_logics")
    try:
        data = await data_source.load_portfolio_programs(tenant_id)
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/applications")
async def get_application_health(request: Request):
    """Get application health data"""
    tenant_id = request.headers.get("X-Tenant-ID", "american_logics")
    try:
        data = await data_source.load_application_health(tenant_id)
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/spend-trend")
async def get_spend_trend(request: Request):
    """Get monthly spend trend"""
    tenant_id = request.headers.get("X-Tenant-ID", "american_logics")
    try:
        data = await data_source.load_spend_trend(tenant_id)
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/spend-categories")
async def get_spend_categories(request: Request):
    """Get spend by categories"""
    tenant_id = request.headers.get("X-Tenant-ID", "american_logics")
    try:
        data = await data_source.load_spend_categories(tenant_id)
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
