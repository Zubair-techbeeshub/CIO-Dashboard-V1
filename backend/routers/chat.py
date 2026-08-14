from fastapi import APIRouter, Request, Depends
from pydantic import BaseModel
from typing import List
from auth import get_current_firebase_user

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


class ChatResponse(BaseModel):
    reply: str
    ai_generated: bool = False


def get_portfolio_knowledge() -> str:
    """Hardcoded portfolio knowledge base for rule-based chatbot"""
    return """
    American Logics CIO Portfolio Knowledge:
    - Total IT portfolio budget: $56.1M
    - Current spend: $42.8M (76.3% utilization)
    - Remaining budget: $13.3M
    - 12 active programs: 5 on track, 4 at risk, 3 under review
    - 28 applications in portfolio
    - Average application health: 78%
    - Portfolio health score: 72/100
    - Top spend categories: Applications Development $18.2M (42.5%), Infrastructure & Operations $13.6M (31.8%)
    - Cybersecurity & Risk: $5.4M (12.6%)
    - Digital & Customer Experience: $3.8M (8.9%)
    - Data & Analytics: $1.8M (4.2%)
    - Customer-facing apps avg health: 86%
    - Back-office legacy apps avg health: 64%
    - 6 applications rated amber or red due to technical debt
    - 3 programs rely on a single critical vendor
    """


def generate_rule_based_response(user_message: str) -> str:
    """Generate a chat response based on keywords in the user message"""
    message = user_message.lower()
    
    if any(word in message for word in ["budget", "spend", "money", "cost", "financial", "portfolio budget"]):
        return (
            "The total IT portfolio budget is <strong>$56.1M</strong>, with <strong>$42.8M</strong> currently spent "
            "(<strong>76.3%</strong> utilization). <strong>$13.3M</strong> remains for the fiscal year. "
            "The largest category is <strong>Applications Development</strong> at <strong>$18.2M</strong> (42.5%), "
            "followed by <strong>Infrastructure & Operations</strong> at <strong>$13.6M</strong> (31.8%). "
            "I recommend accelerating customer experience and cloud migration initiatives to avoid underspend reallocation."
        )
    
    elif any(word in message for word in ["risk", "at risk", "risky", "problems", "issues"]):
        return (
            "There are <strong>4 programs at risk</strong> out of 12 active programs. The at-risk programs show an average "
            "schedule variance of <strong>18.5%</strong> and a potential budget overrun of <strong>$1.2M</strong>. "
            "Key risk areas include legacy system migration, customer portal modernization, vendor dependency (40% of programs), "
            "and 6 applications with amber/red health scores due to technical debt. I recommend an executive portfolio review within 7 days."
        )
    
    elif any(word in message for word in ["health", "status", "programs", "applications"]):
        return (
            "The portfolio health score is <strong>72/100</strong> with <strong>12 active programs</strong> and <strong>28 applications</strong>. "
            "Program status: 5 on track, 4 at risk, 3 under review. Application health average is <strong>78%</strong>. "
            "Customer-facing applications are performing better (avg <strong>86%</strong>) than back-office legacy systems (avg <strong>64%</strong>). "
            "The top action is to review at-risk programs and update risk registers."
        )
    
    elif any(word in message for word in ["recommendation", "what should", "advice", "next steps", "do next", "suggest"]):
        return (
            "Here are my strategic recommendations for the portfolio:<br><br>"
            "<strong>Immediate:</strong> Convene a portfolio review for the 4 at-risk programs within 7 days.<br>"
            "<strong>Short-term:</strong> Reallocate 15% of contingency budget to the legacy migration program.<br>"
            "<strong>Medium-term:</strong> Establish a technical debt reduction roadmap for the 6 amber/red applications.<br>"
            "<strong>Strategic:</strong> Diversify the vendor portfolio and increase digital/customer experience investment from 8.9% to 12-15%."
        )
    
    elif any(word in message for word in ["vendor", "suppliers", "third-party"]):
        return (
            "<strong>40%</strong> of in-flight programs rely on a single critical vendor, creating concentration risk. "
            "I recommend diversifying vendor relationships and establishing secondary suppliers for critical components. "
            "This should be prioritized in the Q3 vendor management review."
        )
    
    elif any(word in message for word in ["cybersecurity", "security", "compliance", "regulatory"]):
        return (
            "Cybersecurity and risk investments total <strong>$5.4M</strong> (12.6% of spend), which is appropriate for a utilities company. "
            "Security incidents are down <strong>8.9% MoM</strong> and system uptime is <strong>99.7%</strong>. "
            "Continue vigilance, especially for compliance-related programs that are showing schedule slippage."
        )
    
    elif any(word in message for word in ["customer", "digital", "experience", "portal"]):
        return (
            "Customer-facing applications have an average health score of <strong>86%</strong>, outperforming back-office systems. "
            "Digital & Customer Experience spend is <strong>$3.8M</strong> (8.9%), which is below the utilities industry benchmark of 12-15%. "
            "I recommend accelerating approved customer portal and digital initiatives to close this gap."
        )
    
    elif any(word in message for word in ["legacy", "technical debt", "debt", "old systems"]):
        return (
            "Technical debt is concentrated in <strong>6 applications</strong> rated amber or red, with back-office legacy systems averaging "
            "<strong>64%</strong> health. The highest technical debt is in mainframe integrations and on-premise ERP modules. "
            "A medium-term technical debt reduction roadmap should be established, with priority on customer-impacting legacy systems."
        )
    
    elif any(word in message for word in ["hello", "hi", "hey"]):
        return "Hello! I am your <strong>Portfolio AI Agent</strong>. Ask me about the portfolio budget, risks, program health, recommendations, vendors, cybersecurity, or technical debt."
    
    else:
        return (
            "I can help with portfolio insights. Try asking about:<br><br>"
            "• <strong>Budget and spend</strong> (e.g., &#8220;What's the portfolio budget?&#8221;)<br>"
            "• <strong>Risks and at-risk programs</strong> (e.g., &#8220;What are the risks?&#8221;)<br>"
            "• <strong>Program and application health</strong> (e.g., &#8220;How is the portfolio health?&#8221;)<br>"
            "• <strong>Strategic recommendations</strong> (e.g., &#8220;What should I do next?&#8221;)<br>"
            "• <strong>Vendors, cybersecurity, customer experience, or technical debt</strong>"
        )


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: Request,
    chat_request: ChatRequest,
    current_user: dict = Depends(get_current_firebase_user)
):
    """Portfolio AI chatbot endpoint (rule-based due to OpenAI quota)"""
    if not chat_request.messages:
        return ChatResponse(
            reply="Hello! I'm your Portfolio AI Agent. Ask me about the portfolio budget, risks, program health, or recommendations.",
            ai_generated=False
        )
    
    # Get the last user message
    last_message = chat_request.messages[-1].content
    
    reply = generate_rule_based_response(last_message)
    
    return ChatResponse(
        reply=reply,
        ai_generated=False
    )