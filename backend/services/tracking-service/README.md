# Tracking Service

Real-time GPS location tracking and monitoring service for the Tourism Super App.

## Overview

The Tracking Service provides real-time location tracking capabilities for buses, tourists, guides, and vehicles. It includes WebSocket support for live updates, Redis caching for performance, and Kafka integration for event-driven architecture.

## Features

### Core Features
- ✅ **Real-time GPS Tracking** - Track location with GPS coordinates, altitude, speed, and heading
- ✅ **WebSocket Broadcasting** - Live location updates via WebSocket channels
- ✅ **Redis Caching** - High-performance caching for latest locations
- ✅ **Kafka Events** - Event-driven architecture with location update events
- ✅ **Point of Interest (POI)** - Nearby POI search with distance calculation
- ✅ **Location History** - Store and retrieve historical location data
- ✅ **Offline Support** - Handle offline location updates
- ✅ **Battery Monitoring** - Track device battery levels

### Entity Types
- `BUS` - Public transport buses
- `TOURIST` - Individual tourists
- `GUIDE` - Tour guides
- `VEHICLE` - Private vehicles

## Tech Stack

- **Framework**: Spring Boot 3.2
- **Language**: Java 21
- **Database**: PostgreSQL 14+
- **Cache**: Redis 6+
- **Message Queue**: Kafka 3.0+
- **WebSocket**: STOMP over SockJS
- **API Documentation**: Swagger/OpenAPI 3.0

## Architecture

```
┌─────────────┐
│   Client    │
│  (Mobile/   │
│    Web)     │
└──────┬──────┘
       │
       │ HTTP/WebSocket
       │
┌──────▼──────────────────────────────────────┐
│         Tracking Service (Port 8089)        │
│                                              │
│  ┌────────────┐  ┌─────────────┐           │
│  │ Controller │  │  WebSocket  │           │
│  └─────┬──────┘  └──────┬──────┘           │
│        │                │                   │
│  ┌─────▼────────────────▼──────┐           │
│  │      TrackingService         │           │
│  └────┬──────────┬──────────┬───┘           │
│       │          │          │               │
│  ┌────▼────┐ ┌──▼───┐  ┌───▼────┐          │
│  │  Redis  │ │ Kafka│  │Postgres│          │
│  │  Cache  │ │Events│  │   DB   │          │
│  └─────────┘ └──────┘  └────────┘          │
└──────────────────────────────────────────────┘
```

## Database Schema

### location_tracking
```sql
- tracking_id (PK)
- trip_id
- entity_type (BUS, TOURIST, GUIDE, VEHICLE)
- entity_id
- latitude, longitude, altitude
- accuracy, speed, heading
- timestamp
- is_offline
- battery_level
- created_at
```

### point_of_interest
```sql
- poi_id (PK)
- name, description
- category
- latitude, longitude
- region, city, address
- phone, website
- rating
- is_active
- created_at, updated_at
```

## API Endpoints

### Location Tracking

#### Update Location
```http
POST /api/tracking/location
Content-Type: application/json

{
  "tripId": 1,
  "entityType": "BUS",
  "entityId": 123,
  "latitude": 27.7172,
  "longitude": 85.3240,
  "altitude": 1400.0,
  "accuracy": 10.0,
  "speed": 45.5,
  "heading": 90.0,
  "timestamp": "2025-12-24T22:00:00",
  "isOffline": false,
  "batteryLevel": 85
}
```

#### Get Latest Location
```http
GET /api/tracking/{entityType}/{entityId}/latest
```

#### Get Location History
```http
GET /api/tracking/{entityType}/{entityId}/history?hours=24
```

#### Get Trip Locations
```http
GET /api/tracking/trip/{tripId}
```

### Point of Interest

#### Find Nearby POIs
```http
GET /api/poi/nearby?latitude=27.7172&longitude=85.3240&radiusKm=5
```

#### Find POIs by Category
```http
GET /api/poi/category/{category}?region=Kathmandu
```

## WebSocket Integration

### Connect to WebSocket
```javascript
const socket = new SockJS('http://localhost:8089/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function(frame) {
    console.log('Connected: ' + frame);
    
    // Subscribe to trip updates
    stompClient.subscribe('/topic/tracking/1', function(message) {
        const location = JSON.parse(message.body);
        console.log('Location update:', location);
        updateMap(location);
    });
    
    // Subscribe to entity updates
    stompClient.subscribe('/topic/tracking/BUS/123', function(message) {
        const location = JSON.parse(message.body);
        console.log('Bus location:', location);
    });
});
```

### WebSocket Channels
- `/topic/tracking/{tripId}` - Trip-specific updates
- `/topic/tracking/{entityType}/{entityId}` - Entity-specific updates

## Kafka Events

### Published Events

#### location.updated
```json
{
  "eventType": "location.updated",
  "tripId": 1,
  "entityType": "BUS",
  "entityId": 123,
  "latitude": 27.7172,
  "longitude": 85.3240,
  "timestamp": "2025-12-24T22:00:00"
}
```

**Topic**: `tracking-events`

## Redis Caching

### Cache Keys
```
location:{entityType}:{entityId}
```

### Cache Strategy
- **TTL**: 5 minutes (300 seconds)
- **Strategy**: Cache-first retrieval
- **Update**: Automatic on location update

## Setup & Installation

### Prerequisites
```bash
# Java 21
java -version

# PostgreSQL 14+
psql --version

# Redis 6+
redis-cli --version

# Kafka 3.0+
kafka-topics.sh --version
```

### Database Setup
```bash
# Create database
createdb tracking_db

# Run migrations (automatic on startup)
# Or manually:
mvn flyway:migrate
```

### Build & Run
```bash
# Build
mvn clean install -DskipTests

# Run
mvn spring-boot:run

# Or with custom profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Docker
```bash
# Build image
docker build -t tracking-service:latest .

# Run container
docker run -p 8089:8089 \
  -e DATABASE_URL=jdbc:postgresql://host.docker.internal:5432/tracking_db \
  -e REDIS_HOST=host.docker.internal \
  -e KAFKA_BOOTSTRAP_SERVERS=host.docker.internal:9092 \
  tracking-service:latest
```

## Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/tracking_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=admin

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# JWT
JWT_SECRET=your-secret-key

# WebSocket
WEBSOCKET_ALLOWED_ORIGINS=http://localhost:3000
```

### Application Properties
See `application.yml` for full configuration options.

## Testing

### Manual Testing
```bash
# Health check
curl http://localhost:8089/actuator/health

# Update location
curl -X POST http://localhost:8089/api/tracking/location \
  -H "Content-Type: application/json" \
  -d '{
    "tripId": 1,
    "entityType": "BUS",
    "entityId": 123,
    "latitude": 27.7172,
    "longitude": 85.3240,
    "timestamp": "2025-12-24T22:00:00"
  }'

# Get latest location
curl http://localhost:8089/api/tracking/BUS/123/latest

# Get location history
curl "http://localhost:8089/api/tracking/BUS/123/history?hours=24"
```

### Swagger UI
```
http://localhost:8089/swagger-ui.html
```

## Performance

### Metrics
- **Location Update**: < 100ms (p95)
- **Cache Hit Rate**: > 85%
- **WebSocket Latency**: < 50ms
- **Database Query**: < 50ms (indexed)

### Optimization
- Redis caching for latest locations
- Database indexes on frequently queried columns
- Connection pooling (HikariCP)
- Async Kafka publishing

## Monitoring

### Actuator Endpoints
```
/actuator/health      - Health status
/actuator/info        - Application info
/actuator/metrics     - Metrics
/actuator/prometheus  - Prometheus metrics
```

### Logging
```bash
# View logs
tail -f logs/tracking-service.log

# Search for errors
grep "ERROR" logs/tracking-service.log
```

## Integration

### With Timeline Service
```java
// Timeline Service can subscribe to location events
@KafkaListener(topics = "tracking-events")
public void handleLocationUpdate(LocationEvent event) {
    // Update ETA based on current location
    timelineService.updateETA(event.getTripId(), event);
}
```

### With Alert Service
```java
// Alert Service can monitor for geofence violations
@KafkaListener(topics = "tracking-events")
public void handleLocationUpdate(LocationEvent event) {
    // Check if location is outside geofence
    if (isOutsideGeofence(event)) {
        alertService.sendAlert(event.getTripId(), "Geofence violation");
    }
}
```

## Troubleshooting

### Common Issues

**Issue**: WebSocket connection fails
```bash
# Check WebSocket configuration
# Verify CORS settings in WebSocketConfig.java
# Check firewall rules
```

**Issue**: Redis connection timeout
```bash
# Check Redis is running
redis-cli ping

# Verify Redis host/port in application.yml
```

**Issue**: Kafka events not publishing
```bash
# Check Kafka is running
kafka-topics.sh --list --bootstrap-server localhost:9092

# Verify topic exists
kafka-topics.sh --describe --topic tracking-events --bootstrap-server localhost:9092
```

## Development

### Code Structure
```
src/main/java/com/ticketkatum/trackingservice/
├── config/              # Configuration classes
├── controller/          # REST controllers
├── dto/                 # Data transfer objects
├── entity/              # JPA entities
├── repository/          # Data repositories
└── service/             # Business logic
```

### Adding New Features
1. Create entity in `entity/`
2. Create repository in `repository/`
3. Create DTO in `dto/`
4. Implement service in `service/`
5. Create controller in `controller/`
6. Add migration script in `db/migration/`

## Contributing

1. Follow existing code patterns
2. Write tests for new features
3. Update documentation
4. Use conventional commits

## License

Proprietary - Ticket Katum

## Support

For issues or questions, contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: December 24, 2025  
**Status**: Production Ready
