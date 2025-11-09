@echo off
REM Quick start script for Library Monitor on Windows

echo 🚀 Starting Library Monitor Setup...

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop for Windows first.
    exit /b 1
)

where docker-compose >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Desktop for Windows first.
    exit /b 1
)

echo ✅ Docker and Docker Compose found

REM Create .env if it doesn't exist
if not exist backend\.env (
    echo 📝 Creating backend\.env file...
    copy backend\.env.example backend\.env
    echo ✅ .env created (please review and update if needed)
)

echo 📦 Starting Docker containers...
docker-compose up -d

echo ⏳ Waiting for services to start...
timeout /t 5 /nobreak

echo.
echo ✅ Library Monitor is starting!
echo.
echo 🌐 Access points:
echo   - Frontend: http://localhost:3000
echo   - API: http://localhost:8000/api
echo   - Admin: http://localhost:8000/admin
echo.
echo 📝 Next steps:
echo   1. Visit http://localhost:3000 in your browser
echo   2. Check logs with: docker-compose logs -f
echo   3. Stop with: docker-compose down
echo.
echo 📚 Documentation:
echo   - Setup: See SETUP.md
echo   - Development: See DEVELOPMENT.md
echo   - Summary: See PROJECT_SUMMARY.md
