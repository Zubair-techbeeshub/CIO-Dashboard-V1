from fastapi import APIRouter, HTTPException, Request, Depends
from data_sources.factory import data_source
from auth import get_current_firebase_user

router = APIRouter()

@router.get("/executive-summary")
async def get_executive_summary(request: Request, current_user: dict = Depends(get_current_firebase_user)):
    """Get executive summary KPIs"""
    tenant_id = request.headers.get("X-Tenant-ID", "american_logics")
    try:
        data = await data_source.load_executive_summary(tenant_id)
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/all")
async def get_all_dashboard_data(request: Request, current_user: dict = Depends(get_current_firebase_user)):
    """Get all dashboard data in one call"""
    tenant_id = request.headers.get("X-Tenant-ID", "american_logics")
    try:
        executive_summary = await data_source.load_executive_summary(tenant_id)
        portfolio_programs = await data_source.load_portfolio_programs(tenant_id)
        application_health = await data_source.load_application_health(tenant_id)
        technology_projects = await data_source.load_technology_projects(tenant_id)
        workforce_metrics = await data_source.load_workforce_metrics(tenant_id)
        delivery_performance = await data_source.load_delivery_performance(tenant_id)

        return {
            "success": True,
            "data": {
                "executiveSummary": executive_summary,
                "portfolioPrograms": portfolio_programs,
                "applicationHealth": application_health,
                "technologyProjects": technology_projects,
                "workforceMetrics": workforce_metrics,
                "deliveryPerformance": delivery_performance
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/incidents")
async def get_active_incidents(request: Request, current_user: dict = Depends(get_current_firebase_user)):
    """Get active incidents data"""
    tenant_id = request.headers.get("X-Tenant-ID", "american_logics")
    try:
        data = await data_source.load_active_incidents(tenant_id)
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
