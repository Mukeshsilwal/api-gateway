#!/bin/bash

# API Gateway - Rebuild and Deploy Script
# This script rebuilds the Docker image with all the latest fixes

echo "=========================================="
echo "API Gateway - Docker Rebuild Script"
echo "=========================================="
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/backend" || exit 1

echo "Step 1: Cleaning old builds..."
./mvnw clean

echo ""
echo "Step 2: Compiling with Maven..."
./mvnw compile -pl monolith-app -am

if [ $? -ne 0 ]; then
    echo "❌ Maven compilation failed!"
    exit 1
fi

echo ""
echo "Step 3: Building Docker image..."
docker build -t api-gateway:latest .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ Build Complete!"
echo "=========================================="
echo ""
echo "To run the application:"
echo "  docker run -p 8080:8080 api-gateway:latest"
echo ""
echo "Or with environment variables:"
echo "  docker run -p 8080:8080 \\"
echo "    -e DB_URL=jdbc:postgresql://host.docker.internal:5432/portfolio_db \\"
echo "    -e DB_USERNAME=postgres \\"
echo "    -e DB_PASSWORD=admin \\"
echo "    api-gateway:latest"
echo ""
