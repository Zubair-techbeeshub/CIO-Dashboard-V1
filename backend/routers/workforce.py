from fastapi import APIRouter, HTTPException, Request, Depends
from data_sources.factory import data_source
from auth import get_current_firebase_user

router = APIRouter()

@router.get("/metrics")
async def get_workforce_metrics(request: Request, current_user: dict = Depends(get_current_firebase_user)):
    """Get workforce metrics data"""
    tenant_id = request.headers.get("X-Tenant-ID", "american_logics")
    try:
        data = await data_source.load_workforce_metrics(tenant_id)
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/skills")
async def get_skills_distribution(request: Request, current_user: dict = Depends(get_current_firebase_user)):
    """Get skills distribution"""
    tenant_id = request.headers.get("X-Tenant-ID", "american_logics")
    try:
        data = await data_source.load_skills_distribution(tenant_id)
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))