#!/bin/bash

# MySQL Docker Stop Script for Pump Application

echo "Stopping MySQL and phpMyAdmin containers..."

# Navigate to the resources directory where docker-compose.yml is located
cd "$(dirname "$0")" || exit

# Stop Docker containers (keeps volumes and data)
docker compose -p pump stop

echo "Containers stopped successfully!"
echo ""
echo "To start the containers again, run: ./start-mysql.sh"
echo "To completely remove containers and data, run: ./delete-mysql.sh"
echo ""
echo "Container status:"
docker compose ps
