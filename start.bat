@echo off
REM Quick start script for TTBA project on Windows

echo.
echo 🎮 TTBA Project - Quick Start
echo ================================
echo.

REM Check Node.js
node --version >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed
    echo Please install Node.js 16+ from https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js: %NODE_VERSION%
echo.

REM Install backend dependencies if needed
if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

REM Install frontend dependencies if needed
if not exist "frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo 🚀 Starting services...
echo.
echo 📝 Remember:
echo   1. Backend will run on: http://localhost:3001
echo   2. Frontend will run on: http://localhost:3000
echo   3. Two command windows will open
echo   4. Keep both windows open while playing
echo.
echo Press any key to continue...
pause >nul

REM Start backend in new window
echo Starting backend server...
start "TTBA Backend" cmd /k "cd backend && npm start"

REM Give backend time to start
timeout /t 2 /nobreak

REM Start frontend in new window
echo Starting frontend server...
start "TTBA Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Services started!
echo   Backend: http://localhost:3001
echo   Frontend: http://localhost:3000
echo.
echo 📖 Check the command windows for any errors
echo 🎮 Open http://localhost:3000 in your browser
echo.
pause

