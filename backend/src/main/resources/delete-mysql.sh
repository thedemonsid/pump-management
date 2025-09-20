#!/bin/bash

# MySQL Docker Delete Script for Pump Application
# WARNING: This will permanently delete all database data!

echo "This will completely remove MySQL containers and ALL DATA!"
echo "Are you sure you want to continue? This action cannot be undone."
read -p "Type 'YES' to confirm deletion: " confirmation

if [ "$confirmation" != "YES" ]; then
    echo "Operation cancelled."
    exit 0
fi

echo "Stopping and removing MySQL containers, volumes, and networks..."

# Navigate to the resources directory where docker-compose.yml is located
cd "$(dirname "$0")"

# Stop and remove containers, networks, volumes, and images
docker compose down -v --remove-orphans

# Additional cleanup - remove the specific volume if it still exists
docker volume rm pump_mysql_data 2>/dev/null || true

# Remove the network if it still exists
docker network rm pump_pump_network 2>/dev/null || true

echo "Cleanup complete!"
echo ""
echo "Removed:"
echo "- MySQL container (pump_mysql)"
echo "- phpMyAdmin container (pump_phpmyadmin)" 
echo "- MySQL data volume (mysql_data)"
echo "- Network (pump_network)"
echo ""
echo "To start fresh, run: ./start-mysql.sh"
