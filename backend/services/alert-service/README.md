# Alert Service

Alert and notification management service for the Smart Tourism Platform.

## Features

- **Alert Management**: Create, update, and resolve alerts
- **Severity-Based Filtering**: LOW, MEDIUM, HIGH, CRITICAL
- **Geographic Targeting**: Region, route, and district-based alerts
- **Temporal Validity**: Time-bound alert activation
- **Redis Caching**: Fast alert retrieval (10-min TTL)
- **Kafka Events**: Alert event publishing

## Technology Stack

- Java 21
- Spring Boot 3.x
- PostgreSQL
- Redis (caching)
- Kafka (event streaming)

## API Endpoints

- `POST /api/alerts` - Create alert
- `GET /api/alerts/active` - Get active alerts
- `GET /api/alerts/region/{region}` - Get alerts by region
- `GET /api/alerts/route/{route}` - Get alerts by route
- `GET /api/alerts/severity` - Get alerts by severity
- `PUT /api/alerts/{id}/resolve` - Resolve alert

## Alert Types

- `WEATHER` - Weather warnings
- `ROAD_BLOCK` - Road closures
- `DELAY` - Service delays
- `STRIKE` - Strikes/bandhs
- `EMERGENCY` - Emergency situations
- `SAFETY` - Safety warnings
- `MAINTENANCE` - Maintenance notices
- `EVENT` - Special events

## Quick Start

### Run Locally
```bash
cd backend/services/alert-service
mvn spring-boot:run
```

Service runs on: `http://localhost:8089/alert-service`

### Docker
```bash
docker build -t alert-service .
docker run -p 8089:8089 alert-service
```

## Configuration

Key environment variables:
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_HOST` - Redis server
- `KAFKA_BOOTSTRAP_SERVERS` - Kafka brokers

## API Documentation

Swagger UI: `http://localhost:8089/alert-service/swagger-ui.html`

## Health Check

`GET /actuator/health`
