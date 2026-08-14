from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from typing import Optional
from ai_service import generate_section_summary, get_fallback_summary
from auth import get_current_firebase_user
import os

router = APIRouter()


class SummaryRequest(BaseModel):
    section: str
    title: Optional[str] = None
    data: Optional[dict] = None


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
            summary_request.data
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