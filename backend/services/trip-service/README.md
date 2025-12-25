# Trip Service

Trip planning, creation, and management microservice for the Ticket Katum Smart Tourism Platform.

## Overview

The Trip Service is responsible for managing the complete lifecycle of tourist trips, from planning to completion. It provides APIs for trip creation, timeline management, booking associations, and status tracking.

## Features

- **Trip Management**: Create, update, and manage trips with comprehensive metadata
- **Timeline Generation**: Automatic checkpoint generation from bookings
- **Booking Association**: Link bus, hotel, event, and guide bookings to trips
- **Group Trips**: Support for multi-participant trips with roles
- **Status Tracking**: Real-time trip status updates (Planned, In Progress, Completed, Cancelled)
- **Budget Management**: Track estimated vs actual trip costs
- **Event Publishing**: Kafka events for trip lifecycle changes

## Technology Stack

- **Framework**: Spring Boot 3.x
- **Database**: PostgreSQL
- **Caching**: Redis
- **Messaging**: Apache Kafka
- **Authentication**: JWT
- **API Documentation**: OpenAPI/Swagger
- **Containerization**: Docker

## Prerequisites

- Java 21
- Maven 3.8+
- PostgreSQL 14+
- Redis 7+
- Kafka 3.x

## Getting Started

### Local Development

1. **Clone the repository**
```bash
cd backend/services/trip-service
```

2. **Configure environment variables**
```bash
export DATABASE_URL=jdbc:postgresql://localhost:5432/ticketkatum
export DATABASE_USERNAME=postgres
export DATABASE_PASSWORD=postgres
export REDIS_HOST=localhost
export REDIS_PORT=6379
export KAFKA_BOOTSTRAP_SERVERS=localhost:9092
export JWT_SECRET=your-secret-key
```

3. **Build the service**
```bash
mvn clean install
```

4. **Run the service**
```bash
mvn spring-boot:run
```

The service will start on `http://localhost:8087/trip-service`

### Docker Deployment

1. **Build Docker image**
```bash
docker build -t trip-service:latest -f Dockerfile ../..
```

2. **Run with Docker Compose**
```bash
docker-compose up trip-service
```

## API Endpoints

### Trip Management

```
POST   /api/trips                    - Create new trip
GET    /api/trips/{tripId}           - Get trip details
PUT    /api/trips/{tripId}           - Update trip
DELETE /api/trips/{tripId}           - Cancel trip
GET    /api/trips/user/{userId}      - Get user's trips
```

### Timeline Management

```
POST   /api/trips/{tripId}/checkpoints  - Add checkpoint
GET    /api/trips/{tripId}/timeline     - Get trip timeline
PUT    /api/trips/{tripId}/checkpoints/{checkpointId} - Update checkpoint
```

### Booking Association

```
POST   /api/trips/{tripId}/bookings     - Add booking to trip
GET    /api/trips/{tripId}/bookings     - Get trip bookings
DELETE /api/trips/{tripId}/bookings/{bookingId} - Remove booking
```

### Status Management

```
PUT    /api/trips/{tripId}/status       - Update trip status
GET    /api/trips/active                - Get active trips
```

## Database Schema

### Core Tables

- **trips**: Main trip entity
- **trip_checkpoints**: Timeline checkpoints
- **trip_bookings**: Booking associations
- **trip_participants**: Group trip participants

See [database migrations](../../database/migrations/) for complete schema.

## Configuration

### Application Properties

Key configuration in `application.yml`:

```yaml
server:
  port: 8087
  servlet:
    context-path: /trip-service

spring:
  datasource:
    url: ${DATABASE_URL}
  kafka:
    bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS}
  data:
    redis:
      host: ${REDIS_HOST}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection URL | `jdbc:postgresql://localhost:5432/ticketkatum` |
| `DATABASE_USERNAME` | Database username | `postgres` |
| `DATABASE_PASSWORD` | Database password | `postgres` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `KAFKA_BOOTSTRAP_SERVERS` | Kafka servers | `localhost:9092` |
| `JWT_SECRET` | JWT signing secret | Required |

## Event Publishing

### Kafka Topics

The service publishes events to the following topics:

- `trip-events`: Trip lifecycle events
  - `trip.created`
  - `trip.updated`
  - `trip.started`
  - `trip.completed`
  - `trip.cancelled`

### Event Schema

```json
{
  "eventType": "trip.created",
  "tripId": 123,
  "userId": 456,
  "timestamp": "2025-12-24T15:00:00Z",
  "data": {
    "tripName": "Weekend Pokhara Trip",
    "startDate": "2025-12-28",
    "endDate": "2025-12-30"
  }
}
```

## Testing

### Run Unit Tests

```bash
mvn test
```

### Run Integration Tests

```bash
mvn verify -P integration-tests
```

### Test Coverage

```bash
mvn jacoco:report
```

## Monitoring

### Health Check

```
GET /trip-service/actuator/health
```

### Metrics

```
GET /trip-service/actuator/metrics
GET /trip-service/actuator/prometheus
```

### API Documentation

Swagger UI available at:
```
http://localhost:8087/trip-service/swagger-ui.html
```

## Architecture

### Layers

```
Controller Layer (REST APIs)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Database (PostgreSQL)
```

### Inter-Service Communication

- **Synchronous**: WebClient for REST calls to other services
- **Asynchronous**: Kafka for event publishing
- **Caching**: Redis for frequently accessed data

## Development Guidelines

### Code Style

- Follow Spring Boot best practices
- Use Lombok for boilerplate reduction
- Write comprehensive JavaDoc for public APIs
- Maintain 80%+ test coverage

### Commit Messages

```
feat: Add trip timeline generation
fix: Resolve checkpoint ordering issue
docs: Update API documentation
test: Add integration tests for trip creation
```

## Troubleshooting

### Common Issues

**Database Connection Failed**
```
Check DATABASE_URL, DATABASE_USERNAME, DATABASE_PASSWORD
Ensure PostgreSQL is running
```

**Kafka Connection Error**
```
Verify KAFKA_BOOTSTRAP_SERVERS
Check Kafka broker status
```

**Redis Connection Timeout**
```
Verify REDIS_HOST and REDIS_PORT
Check Redis server status
```

## Contributing

1. Create feature branch from `main`
2. Implement changes with tests
3. Run `mvn clean verify` to ensure build passes
4. Submit pull request

## License

Proprietary - Ticket Katum

## Contact

For questions or support, contact the development team.
