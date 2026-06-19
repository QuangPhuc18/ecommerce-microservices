@echo off
title E-Commerce Microservices - Docker Stop
cd /d "%~dp0"

echo Stopping all services...
cd infrastructure\docker
docker compose down

echo.
echo All services stopped.
pause
