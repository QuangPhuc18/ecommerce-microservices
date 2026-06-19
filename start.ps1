#!/usr/bin/env pwsh
param(
    [switch]$Monitoring,
    [switch]$NoBuild
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  E-Commerce Microservices" -ForegroundColor Cyan
Write-Host "  Starting all services with Docker..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    $null = docker info 2>&1 | Out-Null
} catch {
    Write-Host "[ERROR] Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Set-Location "infrastructure/docker"

$composeArgs = @("up", "-d")
if (-not $NoBuild) {
    $composeArgs += "--build"
}
if ($Monitoring) {
    $composeArgs += "--profile", "monitoring"
}

Write-Host "[1/3] Building and starting core services..." -ForegroundColor Yellow
& docker compose @composeArgs

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to start services. Check Docker logs." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[2/3] Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

Write-Host ""
Write-Host "[3/3] Done!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  All services are starting up!" -ForegroundColor Cyan
Write-Host "  Run 'docker compose ps' to check status." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Access URLs:" -ForegroundColor White
Write-Host "  - Frontend Web:      http://localhost:3000" -ForegroundColor Green
Write-Host "  - Frontend Admin:    http://localhost:3000/admin" -ForegroundColor Green
Write-Host "  - API Gateway:       http://localhost:8080" -ForegroundColor Green
Write-Host "  - Eureka Dashboard:  http://localhost:8761" -ForegroundColor Green
Write-Host "  - Config Server:     http://localhost:8888" -ForegroundColor Green
Write-Host ""
Write-Host "  Monitoring (start with -Monitoring flag):" -ForegroundColor White
Write-Host "  - Kibana:            http://localhost:5601" -ForegroundColor Green
Write-Host "  - Prometheus:        http://localhost:9090" -ForegroundColor Green
Write-Host "  - Grafana:           http://localhost:3001" -ForegroundColor Green
Write-Host "  - Jaeger:            http://localhost:16686" -ForegroundColor Green
Write-Host ""
Write-Host "  Stop all services:   docker compose down" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

Read-Host "Press Enter to exit"
