from fastapi import APIRouter, HTTPException, Request
from data_sources.factory import data_source

router = APIRouter()

@router.get("/metrics")
async def get_workforce_metrics(request: Request):
    """Get workforce metrics data"""
    tenant_id = request.headers.get("X-Tenant-ID", "american_logics")
    try:
        data = await data_source.load_workforce_metrics(tenant_id)
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/skills")
async def get_skills_distribution(request: Request):
    """Get skills distribution"""
    tenant_id = request.headers.get("X-Tenant-ID", "american_logics")
    try:
        data = await data_source.load_skills_distribution(tenant_id)
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
