from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from routers import dashboard, portfolio, workforce, projects, auth, clients

# Load environment variables
load_dotenv()

app = FastAPI(
    title="CIO Dashboard API",
    description="API for CIO Dashboard - Utilities KPIs",
    version="1.0.0"
)

# CORS Configuration
# Trim whitespace to avoid origin mismatches
origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["Portfolio"])
app.include_router(workforce.router, prefix="/api/workforce", tags=["Workforce"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(clients.router, prefix="/api/admin", tags=["Client Management"])

@app.get("/")
async def root():
    return {
        "message": "CIO Dashboard API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "CIO Dashboard API",
        "version": "1.0.0"
    }

@app.get("/test")
async def test():
    return {"message": "Test endpoint working"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8001)
