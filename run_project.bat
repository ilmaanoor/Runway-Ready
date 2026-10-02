@echo off
title Runway Ready - Fashion Show Management System
color 0A
echo ====================================================================
echo        RUNWAY READY - FASHION SHOW SEATING & ACCESS SYSTEM
echo ====================================================================
echo.
echo [1/3] Initializing SQLite Database and Starting Python Backend...
start "Runway Ready - Python Flask Backend" cmd /k "cd /d \"%~dp0backend\" && python app.py"

echo [2/3] Starting Frontend React Application...
start "Runway Ready - Frontend UI" cmd /k "cd /d \"%~dp0frontend\" && npm run dev"

echo [3/3] Opening browser at http://localhost:5173...
timeout /t 3 >nul
start http://localhost:5173

echo.
echo ====================================================================
echo  Servers running! You can inspect database in backend/runway_ready.db
echo ====================================================================
