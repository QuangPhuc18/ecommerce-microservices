@echo off
title E-Commerce Microservices - Docker Start
cd /d "%~dp0"

echo ========================================
echo   E-Commerce Microservices
echo   Starting all services with Docker...
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo [1/3] Building and starting core services...
cd infrastructure\docker
docker compose up -d --build

if %errorlevel% neq 0 (
    echo [ERROR] Failed to start services. Check Docker logs.
    pause
    exit /b 1
)

echo.
echo [2/3] Waiting for services to be healthy...
timeout /t 15 /nobreak >nul

echo.
echo [3/3] Done!
echo.
echo ========================================
echo   All services are starting up!
echo   Run "docker compose ps" to check status.
echo ========================================
echo.
echo   Access URLs:
echo   - Frontend Web:      http://localhost:3000
echo   - Frontend Admin:    http://localhost:3000/admin
echo   - API Gateway:       http://localhost:8080
echo   - Eureka Dashboard:  http://localhost:8761
echo   - Config Server:     http://localhost:8888
echo.
echo   Monitoring (start with --profile monitoring):
echo   - Kibana:            http://localhost:5601
echo   - Prometheus:        http://localhost:9090
echo   - Grafana:           http://localhost:3001
echo   - Jaeger:            http://localhost:16686
echo.
echo   Stop all services:   docker compose down
echo ========================================
pause
