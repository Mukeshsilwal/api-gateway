# Smart Tourism Platform - Quick Start Guide

## Prerequisites

- Java 21
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Kafka 3+
- Maven 3.8+

## Database Setup

### 1. Create Database
```sql
CREATE DATABASE ticketkatum;
```

### 2. Run Migrations
Migrations run automatically via Flyway on service startup.

## Start Infrastructure

### Using Docker Compose
```bash
# Start PostgreSQL, Redis, Kafka
docker-compose up -d postgres redis kafka
```

### Manual Start
```bash
# PostgreSQL
pg_ctl start

# Redis
redis-server

# Kafka (with Zookeeper)
zookeeper-server-start config/zookeeper.properties
kafka-server-start config/server.properties
```

## Start Backend Services

### Option 1: Maven (Development)
```bash
# Trip Service
cd backend/services/trip-service
mvn spring-boot:run

# Tracking Service
cd backend/services/tracking-service
mvn spring-boot:run

# Alert Service
cd backend/services/alert-service
mvn spring-boot:run

# Booking Service (if not already running)
cd backend/services/booking-service
mvn spring-boot:run

# Web-BFF (if not already running)
cd backend/services/web-bff
mvn spring-boot:run
```

### Option 2: Docker
```bash
# Build images
docker build -t trip-service backend/services/trip-service
docker build -t tracking-service backend/services/tracking-service
docker build -t alert-service backend/services/alert-service

# Run containers
docker run -p 8087:8087 trip-service
docker run -p 8088:8088 tracking-service
docker run -p 8089:8089 alert-service
```

## Verify Services

### Health Checks
```bash
curl http://localhost:8087/trip-service/actuator/health
curl http://localhost:8088/tracking-service/actuator/health
curl http://localhost:8089/alert-service/actuator/health
```

### API Documentation
- Trip Service: http://localhost:8087/trip-service/swagger-ui.html
- Tracking Service: http://localhost:8088/tracking-service/swagger-ui.html
- Alert Service: http://localhost:8089/alert-service/swagger-ui.html

## Quick Test

### Create a Trip
```bash
curl -X POST http://localhost:8087/trip-service/api/trips \
  -H "Content-Type: application/json" \
  -d '{
    "tripName": "Test Trip",
    "startDate": "2025-01-15T08:00:00",
    "endDate": "2025-01-17T18:00:00",
    "budget": 50000
  }'
```

### View Dashboard
```bash
curl http://localhost:8080/api/bff/trips/1/dashboard
```

## Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:5173

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :8087
# Kill process
kill -9 <PID>
```

### Database Connection Failed
- Check PostgreSQL is running
- Verify database exists
- Check credentials in application.yml

### Kafka Connection Failed
- Ensure Kafka and Zookeeper are running
- Check bootstrap servers configuration

## Next Steps

1. Review [Testing Guide](./testing_guide.md)
2. Check [Environment Variables](./ENV_VARIABLES.md)
3. Read service-specific READMEs
