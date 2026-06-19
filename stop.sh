#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/infrastructure/docker"

echo "Stopping all services..."
docker compose down
echo "All services stopped."
