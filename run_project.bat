@echo off
title Runway Ready — Project Launcher

echo.
echo  ================================================
echo   RUNWAY READY — FASHION EVENT SEATING SYSTEM
echo  ================================================
echo.

:: Step 1: Sync DB to scratch folder so VS Code shows correct data
echo [1/3] Syncing database to VS Code workspace...
python -c "import shutil,os; src=r'C:\Users\Ilmaa Noor\runway-ready\backend\runway_ready.db'; dst=r'C:\Users\Ilmaa Noor\.gemini\antigravity\scratch\runway-ready\backend\runway_ready.db'; os.makedirs(os.path.dirname(dst),exist_ok=True); shutil.copyfile(src,dst) if os.path.exists(src) else None; print('  DB synced successfully!' if os.path.exists(src) else '  No DB yet — will create on first run')" 2>&1

:: Step 2: Start Python Flask Backend in a new window
echo [2/3] Starting Python Flask Backend (SQLite Database)...
start "Runway Ready — Flask Backend" cmd /k "cd /d C:\Users\Ilmaa Noor\runway-ready\backend && echo Starting Flask Backend... && python app.py"

:: Wait 3 seconds for Flask to start
timeout /t 3 /nobreak >nul

:: Step 3: Start React Frontend in a new window
echo [3/3] Starting React Frontend (Vite Dev Server)...
start "Runway Ready — React Frontend" cmd /k "cd /d C:\Users\Ilmaa Noor\runway-ready\frontend && echo Starting React Frontend... && npm run dev"

echo.
echo  ================================================
echo   Both servers are starting in separate windows!
echo  ================================================
echo.
echo   Backend:   http://127.0.0.1:5000
echo   Frontend:  http://localhost:5173
echo.
echo   Admin Login:       admin@runway.com / admin123
echo   Coordinator Login: coordinator@runway.com / staff123
echo.
echo   Press any key to close this launcher window...
pause >nul
