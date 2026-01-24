@echo off
REM API Gateway - Rebuild and Deploy Script (Windows)
REM This script rebuilds the Docker image with all the latest fixes

echo ==========================================
echo API Gateway - Docker Rebuild Script
echo ==========================================
echo.

REM Navigate to backend directory
cd /d "%~dp0backend"

echo Step 1: Cleaning old builds...
call mvnw.cmd clean

echo.
echo Step 2: Compiling with Maven...
call mvnw.cmd compile -pl monolith-app -am

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Maven compilation failed!
    exit /b 1
)

echo.
echo Step 3: Building Docker image...
docker build -t api-gateway:latest .

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker build failed!
    exit /b 1
)

echo.
echo ==========================================
echo ✅ Build Complete!
echo ==========================================
echo.
echo To run the application:
echo   docker run -p 8080:8080 api-gateway:latest
echo.
echo Or with environment variables:
echo   docker run -p 8080:8080 ^
echo     -e DB_URL=jdbc:postgresql://host.docker.internal:5432/portfolio_db ^
echo     -e DB_USERNAME=postgres ^
echo     -e DB_PASSWORD=admin ^
echo     api-gateway:latest
echo.

pause
