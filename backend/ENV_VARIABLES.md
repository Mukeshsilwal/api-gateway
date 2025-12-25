# Smart Tourism Platform - Environment Variables

## Required Environment Variables

### Database Configuration
```bash
DATABASE_URL=jdbc:postgresql://localhost:5432/ticketkatum
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
```

### Redis Configuration
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password  # Optional
```

### Kafka Configuration
```bash
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

### JWT Configuration
```bash
JWT_SECRET=your-secret-key-change-this-in-production
```

### Service URLs

#### Trip Service
```bash
TRIP_SERVICE_URL=http://localhost:8087/trip-service
```

#### Tracking Service
```bash
TRACKING_SERVICE_URL=http://localhost:8088/tracking-service
```

#### Alert Service
```bash
ALERT_SERVICE_URL=http://localhost:8089/alert-service
```

#### Booking Service
```bash
BOOKING_SERVICE_URL=http://localhost:8081/booking-service
```

#### Bus Service
```bash
BUS_SERVICE_URL=http://localhost:8082/bus-service
```

#### Hotel Service
```bash
HOTEL_SERVICE_URL=http://localhost:8083/hotel-service
```

#### Event Service
```bash
EVENT_SERVICE_URL=http://localhost:8084/event-service
```

#### Notification Service
```bash
NOTIFICATION_SERVICE_URL=http://localhost:8090/notification-service
```

### WebSocket Configuration
```bash
WEBSOCKET_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Service-Specific Variables

### Tracking Service
```bash
# Location update interval (ms)
TRACKING_LOCATION_UPDATE_INTERVAL=30000

# History retention (days)
TRACKING_HISTORY_RETENTION_DAYS=90

# Max speed threshold (km/h)
TRACKING_MAX_SPEED_KMH=200

# Geofence radius (meters)
TRACKING_GEOFENCE_RADIUS_METERS=100
```

## Example .env File

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/ticketkatum
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# JWT
JWT_SECRET=my-super-secret-jwt-key-change-in-production

# Service URLs (for local development)
TRIP_SERVICE_URL=http://localhost:8087/trip-service
TRACKING_SERVICE_URL=http://localhost:8088/tracking-service
ALERT_SERVICE_URL=http://localhost:8089/alert-service
BOOKING_SERVICE_URL=http://localhost:8081/booking-service

# WebSocket
WEBSOCKET_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Docker Compose Example

```yaml
version: '3.8'
services:
  trip-service:
    image: trip-service:latest
    environment:
      - DATABASE_URL=jdbc:postgresql://postgres:5432/ticketkatum
      - REDIS_HOST=redis
      - KAFKA_BOOTSTRAP_SERVERS=kafka:9092
    ports:
      - "8087:8087"
```

## Kubernetes ConfigMap Example

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: service-config
data:
  DATABASE_URL: "jdbc:postgresql://postgres-service:5432/ticketkatum"
  REDIS_HOST: "redis-service"
  KAFKA_BOOTSTRAP_SERVERS: "kafka-service:9092"
```

## Security Notes

⚠️ **Never commit sensitive values to version control!**

- Use environment variables or secret management
- Rotate JWT secrets regularly
- Use strong database passwords
- Enable Redis authentication in production
- Use TLS for Kafka in production
