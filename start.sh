#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================"
echo "  E-Commerce Microservices"
echo "  Starting all services with Docker..."
echo "========================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "[ERROR] Docker is not running. Please start Docker first."
    exit 1
fi

cd infrastructure/docker

MONITORING=""
NO_BUILD=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --monitoring) MONITORING="--profile monitoring" ;;
        --no-build) NO_BUILD="--no-build" ;;
        *) echo "Usage: $0 [--monitoring] [--no-build]" && exit 1 ;;
    esac
    shift
done

echo "[1/3] Building and starting core services..."
docker compose up -d --build $MONITORING

echo ""
echo "[2/3] Waiting for services to be ready..."
sleep 20

echo ""
echo "[3/3] Done!"
echo ""
echo "========================================"
echo "  All services are starting up!"
echo "  Run 'docker compose ps' to check status."
echo "========================================"
echo ""
echo "  Access URLs:"
echo "  - Frontend Web:      http://localhost:3000"
echo "  - Frontend Admin:    http://localhost:3000/admin"
echo "  - API Gateway:       http://localhost:8080"
echo "  - Eureka Dashboard:  http://localhost:8761"
echo "  - Config Server:     http://localhost:8888"
echo ""
echo "  Monitoring (start with --monitoring):"
echo "  - Kibana:            http://localhost:5601"
echo "  - Prometheus:        http://localhost:9090"
echo "  - Grafana:           http://localhost:3001"
echo "  - Jaeger:            http://localhost:16686"
echo ""
echo "  Stop all services:   docker compose down"
echo "========================================"
