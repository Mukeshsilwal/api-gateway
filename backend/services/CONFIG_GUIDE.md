# Environment Configuration Guide for All Services

## Overview
This directory contains environment-specific configuration files for all microservices.

## Configuration Files Structure

### Development Environment (`application-dev.yml`)
- Local database connections
- Debug logging enabled
- Show SQL queries
- Local Kafka/Redis instances
- Relaxed security settings
- CORS enabled for local development

### Production Environment (`application-prod.yml`)
- Environment variable-based configuration
- Minimal logging
- Connection pooling optimized
- High availability settings
- Strict security
- Production URLs

## Services Configuration

### 1. Event Service (Port: 8081)
**Development:**
- Database: `event_db` on localhost:5432
- Kafka: localhost:9092
- Redis: localhost:6379

**Production:**
- Database: `${DB_URL}`
- Kafka: Cluster with 3 brokers
- Redis: Cluster mode

### 2. Booking Service (Port: 8082)
**Development:**
- Database: `booking_db` on localhost:5432
- Seat hold duration: 15 minutes
- Lock timeout: 300 seconds

**Production:**
- High connection pool (50 max)
- Optimized for high throughput

### 3. Payment Service (Port: 8083)
**Development:**
- Database: `payment_db` on localhost:5432
- Test payment gateway credentials
- UAT/Staging gateway URLs

**Production:**
- Production payment gateway URLs
- Secure credential management via env vars
- Enhanced retry logic (5 attempts)

**Payment Gateways:**
- eSewa: Merchant ID, Secret Key
- Khalti: Public/Secret Keys
- IME Pay: Merchant Code, Username, Password

### 4. Hotel Service (Port: 8087)
**Development:**
- Database: `hotel_db` on localhost:5432
- Room hold: 15 minutes
- Max rooms per booking: 5

**Production:**
- Optimized connection pooling
- 24-hour cancellation window

### 5. Auth Service (Port: 8084)
**Development:**
- Database: `auth_db` on localhost:5432
- JWT expiration: 1 hour
- Refresh token: 7 days
- Debug security logging

**Production:**
- Secure JWT secret from env
- Session management with Redis
- Max 5 concurrent sessions per user

### 6. Web BFF (Port: 8080)
**Development:**
- No database (gateway/aggregator only)
- Redis: localhost:6379 (caching & sessions)
- Circuit breakers with 10s wait duration
- Retry: 3 attempts with exponential backoff
- CORS: localhost:3000, localhost:5173
- Rate limit: 100 requests/minute

**Production:**
- Redis cluster for caching
- Enhanced circuit breakers (30-60s wait)
- Rate limiting: 1000 req/min
- Bulkhead pattern for isolation
- 500 Tomcat threads, 10000 max connections
- Production CORS origins

**Resilience Patterns:**
- Circuit Breaker: 50% failure threshold
- Retry: Exponential backoff (2x multiplier)
- Rate Limiter: Per-service limits
- Bulkhead: Concurrent call limits
- Timeout: Service-specific timeouts

## Environment Variables Required for Production

### Database
```bash
DB_URL=jdbc:postgresql://prod-db:5432/{db_name}
DB_USERNAME=postgres
DB_PASSWORD=<secure_password>
```

### Kafka
```bash
KAFKA_BOOTSTRAP_SERVERS=kafka-1:9092,kafka-2:9092,kafka-3:9092
```

### Redis
```bash
REDIS_HOST=redis-cluster
REDIS_PORT=6379
REDIS_PASSWORD=<secure_password>
```

### Eureka
```bash
EUREKA_SERVER_URL=http://eureka-server:8761/eureka/
```

### Auth Service
```bash
JWT_SECRET=<secure_random_secret>
JWT_EXPIRATION=3600000
JWT_REFRESH_EXPIRATION=604800000
```

### Payment Service
```bash
# eSewa
ESEWA_MERCHANT_ID=<merchant_id>
ESEWA_SECRET_KEY=<secret_key>

# Khalti
KHALTI_PUBLIC_KEY=<public_key>
KHALTI_SECRET_KEY=<secret_key>

# IME Pay
IMEPAY_MERCHANT_CODE=<merchant_code>
IMEPAY_USERNAME=<username>
IMEPAY_PASSWORD=<password>
```

### Application URLs
```bash
APP_URL=https://ticketkatum.com
ALLOWED_ORIGINS=https://ticketkatum.com,https://www.ticketkatum.com
```

## Running with Specific Profile

### Development
```bash
java -jar service.jar --spring.profiles.active=dev
```

### Production
```bash
java -jar service.jar --spring.profiles.active=prod
```

### Docker
```dockerfile
ENV SPRING_PROFILES_ACTIVE=prod
```

## Common Configuration Patterns

### Database Connection Pool
- **Dev**: 20 max, 5 min idle
- **Prod**: 50 max, 20 min idle

### Kafka Settings
- **Dev**: acks=1, retries=3
- **Prod**: acks=all, retries=5

### Logging
- **Dev**: DEBUG level, console + file
- **Prod**: WARN/INFO level, file only with rotation

### Tomcat Threads
- **Dev**: Default (200)
- **Prod**: 500 max threads, 10000 max connections

## Security Best Practices

1. **Never commit secrets** to version control
2. Use **environment variables** for sensitive data
3. Rotate **JWT secrets** regularly
4. Use **strong passwords** for databases
5. Enable **SSL/TLS** in production
6. Implement **rate limiting**
7. Use **Redis** for session management

## Monitoring & Health Checks

All services expose:
- `/actuator/health` - Health status
- `/actuator/info` - Application info
- `/actuator/metrics` - Metrics
- `/actuator/prometheus` - Prometheus metrics

## Troubleshooting

### Service won't start
1. Check database connectivity
2. Verify Kafka is running
3. Check Redis connection
4. Review application logs

### Database connection issues
1. Verify credentials
2. Check network connectivity
3. Ensure database exists
4. Check connection pool settings

### Kafka connection issues
1. Verify bootstrap servers
2. Check network connectivity
3. Ensure topics exist
4. Review consumer group settings

## Performance Tuning

### Database
- Adjust connection pool based on load
- Enable connection testing
- Set appropriate timeouts

### Kafka
- Tune batch size and linger time
- Adjust buffer memory
- Configure compression

### Redis
- Set appropriate pool sizes
- Configure timeouts
- Use connection pooling

## Migration from Dev to Prod

1. Update all environment variables
2. Change profile to `prod`
3. Verify database migrations
4. Test payment gateway integration
5. Monitor logs for errors
6. Check health endpoints
7. Verify Eureka registration
