#!/usr/bin/env python3
"""
Startup script for Pella.app deployment
"""
import os
import sys
from pathlib import Path

# Add current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

# Set environment variables for production
os.environ.setdefault('ENVIRONMENT', 'production')
os.environ.setdefault('DEBUG', 'False')

# Import and run the FastAPI app
from main import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get('PORT', 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        workers=1
    )