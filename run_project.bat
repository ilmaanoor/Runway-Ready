@echo off
title Runway Ready - Frontend Server
color 0A
echo ====================================================================
echo        RUNWAY READY - FASHION SHOW SEATING & ACCESS SYSTEM
echo ====================================================================
echo.
echo [1/2] Navigating to Frontend directory...
cd /d "%~dp0frontend"
echo.
echo [2/2] Starting Local Web Development Server (npm run dev)...
echo.
npm run dev
pause
