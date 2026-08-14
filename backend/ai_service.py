import os
import json
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
    """Build a detailed prompt for dashboard section summary"""
    
    data_text = ""
    if section_data:
        # Convert data to a readable JSON string
        data_text = f"\n\nCURRENT DASHBOARD DATA (use these exact numbers in your summary):\n{json.dumps(section_data, indent=2, default=str)[:4000]}"
    else:
        data_text = "\n\nNo specific dashboard data was provided for this section. Generate a general, comprehensive summary based on the section title."
    
    return (
        f"You are writing a detailed executive summary for the \"{section_title}\" section of a CIO dashboard "
        f"at a utilities company. The audience is the Chief Information Officer who needs actionable insights.{data_text}\n\n"
        f"INSTRUCTIONS - FOLLOW EXACTLY:\n"
        f"1. Write at minimum 4 detailed paragraphs (400-600 words total)\n"
        f"2. ALWAYS reference specific numbers, percentages, and metrics from the data above\n"
        f"3. Wrap every key metric and percentage in <strong> tags (e.g., <strong>76.3%</strong>)\n"
        f"4. Include the following sections using <h3> headers:\n"
        f"   - <h3>📊 Performance Overview</h3>\n"
        f"   - <h3>🔍 Key Insights</h3> (at least 4 bullet points)\n"
        f"   - <h3>⚠️ Risks and Opportunities</h3>\n"
        f"   - <h3>🎯 Strategic Recommendations</h3> (at least 4 actionable items)\n"
        f"5. Do NOT be vague. Use the exact figures from the data.\n"
        f"6. Use HTML only. NO Markdown.\n"
        f"7. Format numbers professionally (e.g., 'budget utilization is <strong>76.3%</strong>')\n"
        f"8. If a metric is missing or data is empty, state it explicitly rather than guessing.\n"
        f"\n"
        f"EXAMPLE OUTPUT FORMAT:\n"
        f"<h3>📊 Performance Overview</h3>\n"
        f"<p>The technology portfolio is operating at a strong level overall. Budget utilization stands at <strong>76.3%</strong>, "
        f"indicating disciplined cost management while leaving headroom for strategic investments. System uptime is <strong>99.7%</strong>, "
        f"well above industry benchmarks and reflecting robust operational resilience.</p>\n"
        f"<h3>🔍 Key Insights</h3>\n<ul>\n"
        f"<li>Revenue growth of <strong>16.2%</strong> year-over-year demonstrates technology investments are supporting business expansion.</li>\n"
        f"<li>IT spend as a percentage of revenue is <strong>4.1%</strong>, efficient for a utilities company.</li>\n"
        f"</ul>\n\n"
        f"Now generate the full summary for the \"{section_title}\" section based on the data provided."
    )


def generate_section_summary(section_id: str, section_title: str, section_data: dict = None) -> str:
    """Generate detailed AI summary for a dashboard section using OpenAI"""
    
    print(f"[AI Summary] Generating for section: {section_id}")
    print(f"[AI Summary] Data received: {json.dumps(section_data, default=str)[:500] if section_data else 'NONE'}")
    
    client = get_openai_client()
    model = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
    
    system_prompt = (
        "You are a senior business analyst, CIO advisor, and expert data interpreter. "
        "Your task is to generate detailed, data-rich executive summaries for a CIO dashboard. "
        "You MUST use the actual numbers and percentages provided in the user data. "
        "Always bold key figures using <strong> tags. "
        "Write in a professional, executive tone. "
        "Use HTML only, no markdown. "
        "Be comprehensive and detailed, not brief."
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
            max_tokens=1500,
            top_p=0.9
        )
        
        content = response.choices[0].message.content or ""
        print(f"[AI Summary] Generated {len(content)} characters")
        return content
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