# Kafka Not Running - Quick Fix Guide

## Problem
Service shows repeated error messages:
```
Connection to node -1 (localhost/127.0.0.1:9092) could not be established. Broker may not be available.
```

## Root Cause
Kafka broker is not running, but the service is configured to use Kafka.

## Solutions

### Option 1: Start Kafka (Recommended for Production)

#### Using Docker:
```bash
# Start Kafka with Docker Compose
cd monitoring
docker-compose up -d kafka zookeeper
```

#### Using Local Installation:
```bash
# Start Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties

# Start Kafka (in another terminal)
bin/kafka-server-start.sh config/server.properties
```

### Option 2: Suppress Error Messages (Quick Fix)

Add to `application-dev.yml`:
```yaml
logging:
  level:
    org.apache.kafka.clients.admin.AdminClient: ERROR
    org.apache.kafka.clients.NetworkClient: ERROR
```

### Option 3: Disable Kafka Temporarily

Add to `application-dev.yml`:
```yaml
spring:
  kafka:
    enabled: false
  autoconfigure:
    exclude:
      - org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration
```

### Option 4: Make Kafka Optional

Modify your Kafka configuration class:
```java
@Configuration
@ConditionalOnProperty(name = "spring.kafka.enabled", havingValue = "true", matchIfMissing = false)
public class KafkaConfig {
    // Your Kafka configuration
}
```

## Recommended Approach

**For Development:**
1. Apply Option 2 (suppress errors) - ✅ Already applied
2. Start Kafka when you need event-driven features
3. Restart the service

**For Production:**
- Always run Kafka
- Use clustered setup
- Monitor Kafka health

## Restart Service
After making changes:
```bash
# Stop the service (Ctrl+C)
# Restart it
mvn spring-boot:run
```

## Verify Kafka is Running
```bash
# Check if Kafka is listening on port 9092
netstat -an | findstr 9092

# Or using PowerShell
Test-NetConnection -ComputerName localhost -Port 9092
```

## Current Status
✅ Logging suppressed for AdminClient and NetworkClient
⚠️ Kafka is still not running - events won't be published/consumed
