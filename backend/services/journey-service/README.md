# Journey Service

Intelligent journey orchestration and optimization service for Ticket Katum Tourism Super App.

## Overview

The Journey Service automatically generates optimized travel itineraries from trip data, manages journey segments, provides AI-powered suggestions, and calculates journey metrics.

## Features

- **Journey Generation**: Auto-create journeys from trip data and bookings
- **Segment Management**: Full CRUD for journey segments (travel, stay, activity, meal, rest, transit)
- **Optimization Engine**: Route, time, and cost optimization with scoring
- **AI Suggestions**: Smart recommendations for hotels, activities, restaurants, POIs
- **External Integration**: Seamless integration with trip, booking, hotel, and event services
- **Event Streaming**: Kafka events for journey lifecycle
- **Caching**: Redis caching for performance
- **Async Processing**: Non-blocking optimization and suggestion generation

## Tech Stack

- **Java 17**
- **Spring Boot 3.2.0**
- **PostgreSQL** - Primary database
- **Redis** - Caching
- **Kafka** - Event streaming
- **WebFlux** - Reactive HTTP client
- **Flyway** - Database migrations
- **Lombok** - Boilerplate reduction
- **Swagger/OpenAPI** - API documentation

## Quick Start

### Prerequisites

```bash
# Java 17+
java -version

# PostgreSQL 14+
psql --version

# Redis 6+
redis-cli --version

# Kafka 3.0+
kafka-topics.sh --version

# Maven 3.8+
mvn -version
```

### Setup

1. **Create Database**:
```bash
createdb journey_db
```

2. **Configure Application**:
Edit `src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/journey_db
    username: postgres
    password: your_password
```

3. **Run Migrations**:
```bash
mvn flyway:migrate
```

4. **Build**:
```bash
mvn clean install -DskipTests
```

5. **Run**:
```bash
mvn spring-boot:run
```

6. **Verify**:
```bash
curl http://localhost:8087/actuator/health
```

## API Documentation

### Swagger UI
```
http://localhost:8087/swagger-ui.html
```

### Key Endpoints

#### Generate Journey
```http
POST /api/journey/generate?tripId=1
Headers:
  X-User-Id: 1
```

#### Get Journey
```http
GET /api/journey/{journeyId}
```

#### Add Segment
```http
POST /api/journey/{journeyId}/segments
Content-Type: application/json

{
  "segmentType": "TRAVEL",
  "startTime": "2025-06-15T08:00:00",
  "endTime": "2025-06-15T14:00:00",
  "locationFrom": "Kathmandu",
  "locationTo": "Pokhara",
  "estimatedCost": 1500.00
}
```

## Architecture

### Database Schema

- **journeys** - Main journey data
- **journey_segments** - Journey segments
- **journey_suggestions** - AI suggestions
- **journey_waypoints** - Route waypoints
- **journey_optimizations** - Optimization history
- **journey_preferences** - User preferences

### Event Topics

- `journey.created` - Journey created
- `journey.updated` - Journey updated
- `journey.optimized` - Optimization completed
- `journey.segment.added` - Segment added
- `journey.suggestion.generated` - Suggestions generated

### Cache Keys

- `journeys` - Journey data (TTL: 30 min)
- `suggestions` - Suggestions (TTL: 15 min)
- `tripData` - External trip data (TTL: 10 min)

## Configuration

### External Services

```yaml
journey:
  external-services:
    trip-service-url: http://localhost:8083
    booking-service-url: http://localhost:8084
    hotel-service-url: http://localhost:8085
    event-service-url: http://localhost:8086
```

### Optimization

```yaml
journey:
  optimization:
    enabled: true
    max-iterations: 100
    timeout-seconds: 30
  suggestions:
    max-per-journey: 10
    cache-ttl-minutes: 60
```

## Development

### Run Tests
```bash
mvn test
```

### Build Docker Image
```bash
mvn spring-boot:build-image
```

### Run with Docker
```bash
docker run -p 8087:8087 journey-service:1.0.0
```

## Monitoring

### Health Check
```bash
curl http://localhost:8087/actuator/health
```

### Metrics
```bash
curl http://localhost:8087/actuator/metrics
```

### Prometheus
```bash
curl http://localhost:8087/actuator/prometheus
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

Copyright © 2025 Ticket Katum. All rights reserved.
