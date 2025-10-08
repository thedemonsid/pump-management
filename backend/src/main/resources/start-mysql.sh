#!/bin/bash

# MySQL Docker Setup for Pump Application

echo "Starting MySQL and phpMyAdmin containers..."

# Navigate to the resources directory where docker-compose.yml is located
cd "$(dirname "$0")" || exit

# Start Docker containers
docker compose -p pump up -d

echo "Waiting for MySQL to be ready..."
echo "Checking MySQL health status..."

# Wait for MySQL container to be healthy
while [ "$(docker inspect --format='{{.State.Health.Status}}' pump_mysql)" != "healthy" ]; do
    echo "MySQL is starting up... ($(date +%T))"
    sleep 2
done

echo "MySQL is now healthy and ready for connections!"

echo "Setup complete!"
echo "MySQL is running on localhost:3307"
echo "phpMyAdmin is available at http://localhost:8080"
echo ""
echo "Database Connection Details:"
echo "Host: localhost"
echo "Port: 3306"
echo "Database: pump_db"
echo "Username: pump_user"
echo "Password: pump_password"
echo ""
echo "To stop the containers, run: docker compose down"
echo "To view logs, run: docker compose logs -f"
