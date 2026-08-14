from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from typing import Optional
from ai_service import generate_section_summary, get_fallback_summary
from data_sources.factory import data_source
from auth import get_current_firebase_user
import os

router = APIRouter()


class SummaryRequest(BaseModel):
    section: str
    title: Optional[str] = None
    data: Optional[dict] = None


async def get_section_data(section: str, tenant_id: str):
    """Fetch real dashboard data for the given section"""
    try:
        if section == "executive":
            return await data_source.load_executive_summary(tenant_id)
        elif section == "portfolio":
            return {
                "spend_trend": await data_source.load_spend_trend(tenant_id),
                "spend_categories": await data_source.load_spend_categories(tenant_id),
            }
        elif section == "cockpit":
            return {
                "programs": await data_source.load_portfolio_programs(tenant_id),
                "applications": await data_source.load_application_health(tenant_id),
            }
        elif section == "operations":
            return {
                "technology_projects": await data_source.load_technology_projects(tenant_id),
                "delivery_performance": await data_source.load_delivery_performance(tenant_id),
                "incidents": await data_source.load_active_incidents(tenant_id),
            }
        elif section == "workforce":
            return {
                "workforce_metrics": await data_source.load_workforce_metrics(tenant_id),
                "skills_distribution": await data_source.load_skills_distribution(tenant_id),
            }
        elif section == "financial":
            return {
                "spend_trend": await data_source.load_spend_trend(tenant_id),
                "spend_categories": await data_source.load_spend_categories(tenant_id),
            }
        else:
            return {}
    except Exception as e:
        print(f"Error loading section data: {e}")
        return {}


@router.post("/generate")
async def generate_summary(
    request: Request,
    summary_request: SummaryRequest,
    current_user: dict = Depends(get_current_firebase_user)
):
    """Generate AI summary for a dashboard section"""
    section_titles = {
        "executive": "Executive Summary",
        "portfolio": "Portfolio Summary",
        "cockpit": "Portfolio Cockpit",
        "operations": "Program Health",
        "workforce": "People Productivity",
        "financial": "Financial Overview"
    }
    
    title = summary_request.title or section_titles.get(summary_request.section, "Dashboard Section")
    tenant_id = request.headers.get("X-Tenant-ID", "american_logics")
    
    # Fetch real dashboard data
    real_data = await get_section_data(summary_request.section, tenant_id)
    
    # Merge with any data sent from frontend
    combined_data = {**real_data, **(summary_request.data or {})}
    
    # Check if AI is configured
    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("VITE_AI_API_KEY")
    
    if not api_key:
        return {
            "success": True,
            "ai_generated": False,
            "content": get_fallback_summary(summary_request.section),
            "message": "AI not configured. Using fallback summary."
        }
    
    try:
        content = generate_section_summary(
            summary_request.section,
            title,
            combined_data
        )
        return {
            "success": True,
            "ai_generated": True,
            "content": content
        }
    except Exception as e:
        return {
            "success": True,
            "ai_generated": False,
            "content": get_fallback_summary(summary_request.section),
            "message": f"AI generation failed: {str(e)}"
        }