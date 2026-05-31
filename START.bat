@echo off
title Sla3Li - B2B Marketplace
echo.
echo  ========================================
echo   Sla3Li B2B Marketplace - Starting...
echo  ========================================
echo.

:: Start backend
echo  [1/2] Starting Backend API (port 5000)...
start "Sla3Li Backend" cmd /k "cd backend && npx nodemon --exec \"node --experimental-sqlite\" server.js"

timeout /t 2 /nobreak >nul

:: Start frontend
echo  [2/2] Starting Frontend (port 5173)...
start "Sla3Li Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo  ========================================
echo   Platform is starting up!
echo  ========================================
echo.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000/api
echo.
echo   Test Accounts:
echo   - Admin:      admin@sla3li.dz / admin123
echo   - Wholesaler: wholesaler1@sla3li.dz / pass123
echo   - Retailer:   retailer1@sla3li.dz / pass123
echo   - Driver:     driver1@sla3li.dz / pass123
echo.
echo  Opening browser...
timeout /t 2 /nobreak >nul
start http://localhost:5173

pause
