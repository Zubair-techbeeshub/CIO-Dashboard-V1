import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


def get_openai_client():
    """Get OpenAI client configured with API key"""
    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("VITE_AI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable not configured")
    return OpenAI(api_key=api_key)


def build_summary_prompt(section_id: str, section_title: str, section_data: dict = None) -> str:
    """Build prompt for dashboard section summary"""
    data_text = ""
    if section_data:
        data_text = f"\n\nCurrent dashboard data (JSON):\n{str(section_data)}"
    
    return (
        f"Generate an executive summary for the \"{section_title}\" section of a CIO dashboard "
        f"for a utilities company.{data_text}\n\n"
        f"Requirements:\n"
        f"- Use HTML tags like <p>, <ul>, <li>, <strong> for formatting\n"
        f"- Include 2-3 key insights and 2-3 actionable recommendations\n"
        f"- Keep it under 250 words\n"
        f"- Focus on business value and decision-making\n"
        f"- Do not use markdown, only HTML"
    )


def generate_section_summary(section_id: str, section_title: str, section_data: dict = None) -> str:
    """Generate AI summary for a dashboard section using OpenAI"""
    client = get_openai_client()
    
    model = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
    
    system_prompt = (
        "You are a senior business analyst and CIO advisor. "
        "Generate concise, insightful executive summaries for a CIO dashboard. "
        "Use HTML tags for formatting. Be specific, actionable, and professional."
    )
    
    user_prompt = build_summary_prompt(section_id, section_title, section_data)
    
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=800,
            top_p=0.9
        )
        
        return response.choices[0].message.content or ""
    except Exception as e:
        raise Exception(f"OpenAI API error: {str(e)}")


def get_fallback_summary(section_id: str) -> str:
    """Get hardcoded fallback summary if AI is unavailable"""
    summaries = {
        "executive": "<p>The executive summary highlights strong IT portfolio performance with controlled spending and high system reliability.</p>",
        "portfolio": "<p>The portfolio summary shows a well-distributed investment across technology programs with manageable spend trends.</p>",
        "cockpit": "<p>The portfolio cockpit indicates balanced program health with active risk management across initiatives.</p>",
        "operations": "<p>The program health summary shows mixed delivery performance requiring attention to milestone management.</p>",
        "workforce": "<p>The workforce summary indicates strong utilization with opportunities to close skill gaps in key areas.</p>",
    }
    return summaries.get(section_id, "<p>Dashboard summary is currently unavailable.</p>")