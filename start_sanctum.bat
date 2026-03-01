@echo off
title SanctumOS Launcher
color 0f
cls

echo ========================================================
echo   SANCTUM OS v1.0.0
echo   Initializing The Ghost...
echo ========================================================
echo.

cd /d "F:\SanctumOS - Local"

echo [1/2] Opening Gateway (http://localhost:3000)...
start "" "http://localhost:3000"

echo [2/2] Igniting Next.js Engine...
echo.
echo Press 'Ctrl + C' to stop the server when done.
echo.

npm run dev

pause
