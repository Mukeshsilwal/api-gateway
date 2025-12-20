# Kafka Logging Configuration Guide

## Problem
Kafka produces excessive console logging, making it difficult to see application logs.

## Solution
Reduce Kafka logging levels in `application.yml` files.

## Logging Levels Explained

### TRACE
- Most verbose
- Shows every detail
- Use only for deep debugging

### DEBUG
- Detailed information
- Good for development debugging
- Shows SQL queries, method calls

### INFO
- General information
- Default level
- Shows startup info, configuration

### WARN
- Warning messages only
- Potential issues
- **Recommended for Kafka in development**

### ERROR
- Error messages only
- Critical issues
- **Recommended for Kafka in production**

## Configuration Changes

### For Development (application-dev.yml)
```yaml
logging:
  level:
    root: INFO
    com.ticketkatum: DEBUG              # Your application code
    org.springframework.kafka: WARN     # Spring Kafka framework
    org.apache.kafka: WARN              # Apache Kafka client
    org.hibernate.SQL: DEBUG            # SQL queries (optional)
```

### For Production (application-prod.yml)
```yaml
logging:
  level:
    root: WARN
    com.ticketkatum: INFO
    org.springframework.kafka: ERROR
    org.apache.kafka: ERROR
    org.hibernate.SQL: WARN
```

## Services to Update

Apply these changes to all services:
1. ✅ event-service
2. booking-service
3. payment-service
4. hotel-service
5. auth-service
6. web-bff

## Quick Fix for All Services

Run this pattern for each service:

```yaml
# In application.yml or application-dev.yml
logging:
  level:
    org.springframework.kafka: WARN
    org.apache.kafka: WARN
```

## Additional Tips

### 1. File-based Logging
Redirect Kafka logs to a separate file:
```yaml
logging:
  file:
    name: logs/kafka.log
  pattern:
    file: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
```

### 2. Logback Configuration
Create `logback-spring.xml` for more control:
```xml
<logger name="org.apache.kafka" level="WARN"/>
<logger name="org.springframework.kafka" level="WARN"/>
```

### 3. Specific Kafka Components
Fine-tune specific Kafka components:
```yaml
logging:
  level:
    org.apache.kafka.clients.consumer: WARN
    org.apache.kafka.clients.producer: WARN
    org.apache.kafka.common.metrics: ERROR
```

## Restart Required
After changing logging configuration:
1. Stop the service
2. Restart the service
3. Verify reduced logging

## Verification
After restart, you should see:
- ✅ Less Kafka connection messages
- ✅ No Kafka heartbeat logs
- ✅ No consumer/producer metadata logs
- ✅ Only your application logs clearly visible
- ⚠️ Kafka errors still visible (important!)
