#!/bin/bash
set -e

echo "Starting Deployment Script..."

# Check for .env file
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

# Build and Start Services
echo "Building and Starting Services with Docker Compose..."
docker compose up -d --build

echo "Waiting for services to be ready..."
# A simple wait loop or just let the user know
sleep 30

echo "Deployment Complete!"
echo "Services are running in Docker containers."
echo "Frontend URL: http://localhost:3001"
echo "Web BFF URL: http://localhost:8080"
echo "To stop: docker compose down"
