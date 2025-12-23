@echo off
echo ========================================
echo CIO Dashboard - Starting Backend and Frontend
echo ========================================
echo.

echo [1/3] Starting FastAPI Backend...
start cmd /k "cd backend && python main.py"
timeout /t 3

echo [2/3] Starting React Frontend...
start cmd /k "npm run dev"

echo.
echo ========================================
echo Dashboard is starting...
echo.
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to exit this window (servers will keep running)
pause
