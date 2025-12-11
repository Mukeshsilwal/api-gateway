# Testing Guide - Ticket Katum Microservices

## Environment Setup Testing

### 1. Test Environment Variables Loading

```bash
# Navigate to project
cd "c:\New folder\Ticket-Katum-gateway"

# Create .env file
cp .env.example .env

# Edit .env with test values
# Minimum required:
DB_USERNAME=ticketkatum
DB_PASSWORD=test_password_123
KONG_DB_PASSWORD=kong_test_123
REDIS_PASSWORD=redis_test_123
RABBITMQ_USERNAME=ticketkatum
RABBITMQ_PASSWORD=rabbit_test_123
JWT_SECRET=$(openssl rand -base64 64)
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### 2. Verify Docker Compose Configuration

```bash
# Validate docker-compose.yml
docker-compose config

# Expected: No errors, all environment variables resolved
```

### 3. Start Infrastructure Services

```bash
# Start only infrastructure (no application services)
docker-compose up -d postgres redis rabbitmq kafka zookeeper

# Wait for services to be healthy
docker-compose ps

# Expected: All services showing "healthy" status
```

### 4. Test Database Connection

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U ticketkatum -d ticketkatum

# Run test query
SELECT version();

# Expected: PostgreSQL version displayed
\q
```

### 5. Test Redis Connection

```bash
# Connect to Redis
docker-compose exec redis-cache redis-cli -a ${REDIS_PASSWORD}

# Test commands
PING
SET test "Hello"
GET test

# Expected: PONG, OK, "Hello"
exit
```

### 6. Test RabbitMQ

```bash
# Access RabbitMQ Management UI
# Open browser: http://localhost:15672
# Login: ticketkatum / ${RABBITMQ_PASSWORD}

# Expected: Dashboard loads successfully
```

### 7. Test Kafka

```bash
# List Kafka topics
docker-compose exec kafka kafka-topics --list --bootstrap-server localhost:9092

# Create test topic
docker-compose exec kafka kafka-topics --create \
  --topic test-topic \
  --bootstrap-server localhost:9092 \
  --partitions 1 \
  --replication-factor 1

# Expected: Topic created successfully
```

## Service Testing

### 8. Start All Services

```bash
# Start all services
docker-compose up -d

# Monitor logs
docker-compose logs -f
```

### 9. Test Auth Service (Port 8089)

```bash
# Health check
curl http://localhost:8089/actuator/health

# Expected:
# {"status":"UP"}

# Prometheus metrics
curl http://localhost:8089/actuator/prometheus

# Expected: Metrics output
```

### 10. Test Hotel Service

```bash
# Health check
curl http://localhost:8087/actuator/health

# Test endpoint (if available)
curl http://localhost:8087/api/hotels

# Expected: JSON response or 401 if auth required
```

### 11. Test Web BFF

```bash
# Health check
curl http://localhost:8081/actuator/health

# Swagger UI
# Open browser: http://localhost:8081/swagger-ui.html

# Expected: API documentation loads
```

### 12. Test Kong Gateway

```bash
# Kong status
curl http://localhost:8001/status

# List services
curl http://localhost:8001/services

# Expected: Kong configuration displayed
```

## Monitoring Stack Testing

### 13. Test Prometheus

```bash
# Access Prometheus UI
# Open browser: http://localhost:9090

# Run query
up{job="spring-boot-services"}

# Expected: All services showing up=1
```

### 14. Test Grafana

```bash
# Access Grafana
# Open browser: http://localhost:3000
# Login: admin / admin

# Add Prometheus data source:
# URL: http://prometheus:9090

# Expected: Connection successful
```

### 15. Test Jaeger Tracing

```bash
# Access Jaeger UI
# Open browser: http://localhost:16686

# Search for traces
# Service: hotel-service

# Expected: Traces displayed (after making some requests)
```

### 16. Test ELK Stack

```bash
# Access Kibana
# Open browser: http://localhost:5601

# Create index pattern: ticket-katum-*

# Expected: Logs visible in Discover tab
```

## Integration Testing

### 17. Test Service-to-Service Communication

```bash
# Make request through BFF to hotel service
curl http://localhost:8081/api/bff/hotels/search?city=Kathmandu

# Expected: Hotel search results
```

### 18. Test Authentication Flow

```bash
# Register user (if endpoint exists)
curl -X POST http://localhost:8089/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Login
curl -X POST http://localhost:8089/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test123!"
  }'

# Expected: JWT token returned
```

### 19. Test Circuit Breaker

```bash
# Stop hotel service
docker-compose stop hotel-service

# Make request through BFF
curl http://localhost:8081/api/bff/hotels/1

# Expected: Circuit breaker opens, fallback response

# Restart service
docker-compose start hotel-service
```

### 20. Test Caching

```bash
# First request (cache miss)
time curl http://localhost:8087/api/hotels/1

# Second request (cache hit)
time curl http://localhost:8087/api/hotels/1

# Expected: Second request significantly faster
```

## Performance Testing

### 21. Load Test with Apache Bench

```bash
# Install Apache Bench
# Ubuntu: sudo apt-get install apache2-utils
# Windows: Download from Apache website

# Run load test
ab -n 1000 -c 10 http://localhost:8087/api/hotels

# Expected:
# - No errors
# - Requests per second > 100
# - 95th percentile < 200ms
```

### 22. Stress Test

```bash
# Gradually increase load
ab -n 10000 -c 50 http://localhost:8087/api/hotels

# Monitor:
# - CPU usage: docker stats
# - Memory usage: docker stats
# - Response times

# Expected: System remains stable
```

## Security Testing

### 23. Test CORS

```bash
# Test CORS from unauthorized origin
curl -H "Origin: http://evil.com" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS http://localhost:8081/api/bff/hotels

# Expected: CORS error
```

### 24. Test Rate Limiting (if configured)

```bash
# Make rapid requests
for i in {1..200}; do
  curl http://localhost:8000/api/hotels
done

# Expected: 429 Too Many Requests after limit
```

### 25. Test JWT Validation

```bash
# Request with invalid token
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:8081/api/bff/hotels

# Expected: 401 Unauthorized
```

## Failure Testing

### 26. Test Database Failover

```bash
# Stop database
docker-compose stop postgres

# Make request
curl http://localhost:8087/api/hotels

# Expected: Service degraded but doesn't crash

# Restart database
docker-compose start postgres

# Expected: Service recovers automatically
```

### 27. Test Redis Failover

```bash
# Stop Redis
docker-compose stop redis-cache

# Make request
curl http://localhost:8087/api/hotels

# Expected: Works but slower (no cache)

# Restart Redis
docker-compose start redis-cache
```

### 28. Test Message Queue Failover

```bash
# Stop RabbitMQ
docker-compose stop rabbitmq

# Create booking
curl -X POST http://localhost:8091/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"hotelId": 1, "userId": 1}'

# Expected: Booking created, messages queued

# Restart RabbitMQ
docker-compose start rabbitmq

# Expected: Queued messages processed
```

## Cleanup

```bash
# Stop all services
docker-compose down

# Remove volumes (CAUTION: deletes all data)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

## Test Results Template

```markdown
## Test Execution Report

**Date:** YYYY-MM-DD
**Tester:** Your Name
**Environment:** Development/Staging/Production

### Infrastructure Tests
- [ ] Environment variables loaded correctly
- [ ] Docker Compose configuration valid
- [ ] PostgreSQL connection successful
- [ ] Redis connection successful
- [ ] RabbitMQ accessible
- [ ] Kafka operational

### Service Tests
- [ ] Auth Service (8089) healthy
- [ ] Hotel Service (8087) healthy
- [ ] Booking Service (8091) healthy
- [ ] Bus Service (8083) healthy
- [ ] Payment Service (8092) healthy
- [ ] Web BFF (8081) healthy
- [ ] Mobile BFF (8082) healthy

### Monitoring Tests
- [ ] Prometheus collecting metrics
- [ ] Grafana dashboards working
- [ ] Jaeger tracing operational
- [ ] Kibana logs visible

### Integration Tests
- [ ] Service-to-service communication working
- [ ] Authentication flow successful
- [ ] Circuit breaker functioning
- [ ] Caching operational

### Performance Tests
- [ ] Load test passed (>100 req/s)
- [ ] Stress test passed (system stable)
- [ ] Response times acceptable (<200ms P95)

### Security Tests
- [ ] CORS properly configured
- [ ] Rate limiting working
- [ ] JWT validation working

### Failure Tests
- [ ] Database failover successful
- [ ] Redis failover successful
- [ ] Message queue failover successful

### Issues Found
1. [Issue description]
2. [Issue description]

### Recommendations
1. [Recommendation]
2. [Recommendation]
```

## Automated Testing Script

```bash
#!/bin/bash
# test-all.sh

echo "Starting Ticket Katum Test Suite..."

# Test 1: Environment
echo "✓ Testing environment variables..."
docker-compose config > /dev/null || exit 1

# Test 2: Infrastructure
echo "✓ Testing infrastructure services..."
docker-compose up -d postgres redis rabbitmq
sleep 10
docker-compose ps | grep "healthy" || exit 1

# Test 3: Services
echo "✓ Testing application services..."
docker-compose up -d
sleep 30

# Test 4: Health checks
echo "✓ Testing health endpoints..."
curl -f http://localhost:8089/actuator/health || exit 1
curl -f http://localhost:8087/actuator/health || exit 1
curl -f http://localhost:8081/actuator/health || exit 1

# Test 5: Monitoring
echo "✓ Testing monitoring stack..."
curl -f http://localhost:9090/-/healthy || exit 1

echo "✅ All tests passed!"
```

Save as `test-all.sh` and run:
```bash
chmod +x test-all.sh
./test-all.sh
```
