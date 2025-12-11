# Service Discovery - Ticket Katum Microservices

## Overview

Service discovery implementation using Netflix Eureka for dynamic service registration, discovery, and client-side load balancing across all Ticket Katum microservices.

## Architecture

### Service Discovery Flow

```
┌──────────────────────────────────────────────────────────┐
│                   Eureka Server                          │
│              (Service Registry)                          │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │  Hotel     │  │  Booking   │  │  Payment   │       │
│  │  Service   │  │  Service   │  │  Service   │       │
│  │  (3 inst)  │  │  (2 inst)  │  │  (2 inst)  │       │
│  └────────────┘  └────────────┘  └────────────┘       │
└──────────────────────────────────────────────────────────┘
         ▲                    ▲                    ▲
         │                    │                    │
    Registration          Heartbeat            Discovery
         │                    │                    │
         └────────────────────┴────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │    Client          │
                    │  (Web BFF)         │
                    └────────────────────┘
```

### Service Communication

**Before Eureka (Hardcoded URLs):**
```java
String hotelServiceUrl = "http://localhost:8087";
Hotel hotel = restTemplate.getForObject(hotelServiceUrl + "/hotels/1", Hotel.class);
```

**After Eureka (Service Discovery):**
```java
@LoadBalanced
RestTemplate restTemplate;

Hotel hotel = restTemplate.getForObject("http://hotel-service/hotels/1", Hotel.class);
// Eureka resolves "hotel-service" to actual instance
// Load balancer selects from available instances
```

## Eureka Server Setup

### Configuration

**Port:** 8761 (default)  
**URL:** http://localhost:8761

**Key Settings:**
```yaml
eureka:
  server:
    enable-self-preservation: true
    eviction-interval-timer-in-ms: 60000
    renewal-percent-threshold: 0.85
```

### High Availability (HA)

**3-Node Cluster:**
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Eureka 1   │────▶│  Eureka 2   │────▶│  Eureka 3   │
│  :8761      │◀────│  :8762      │◀────│  :8763      │
└─────────────┘     └─────────────┘     └─────────────┘
       ▲                   ▲                   ▲
       └───────────────────┴───────────────────┘
              Peer-to-Peer Replication
```

**Configuration:**
```yaml
eureka:
  client:
    service-url:
      defaultZone: http://eureka1:8761/eureka/,http://eureka2:8762/eureka/,http://eureka3:8763/eureka/
```

## Service Registration

### Registered Services

| Service | Port | Instances | Health Check |
|---------|------|-----------|--------------|
| hotel-service | 8087 | 3 | /actuator/health |
| booking-service | 8091 | 2 | /actuator/health |
| bus-service | 8083 | 2 | /actuator/health |
| payment-service | 8092 | 2 | /actuator/health |
| auth-service | 8089 | 2 | /actuator/health |
| web-bff | 8081 | 2 | /actuator/health |
| mobile-bff | 8082 | 2 | /actuator/health |

### Registration Process

```
1. Service starts
2. Registers with Eureka (POST /eureka/apps/{appName})
3. Sends heartbeat every 30s (PUT /eureka/apps/{appName}/{instanceId})
4. Eureka marks unhealthy if no heartbeat for 90s
5. Service deregisters on shutdown (DELETE /eureka/apps/{appName}/{instanceId})
```

### Instance Metadata

```yaml
eureka:
  instance:
    metadata-map:
      zone: zone1
      version: 1.0.0
      management.port: 8087
      management.context-path: /actuator
```

## Client-Side Load Balancing

### Ribbon Configuration

**Load Balancing Strategies:**

1. **Round Robin (Default)**
   ```java
   @LoadBalanced
   @Bean
   public RestTemplate restTemplate() {
       return new RestTemplate();
   }
   ```

2. **Weighted Response Time**
   ```yaml
   hotel-service:
     ribbon:
       NFLoadBalancerRuleClassName: com.netflix.loadbalancer.WeightedResponseTimeRule
   ```

3. **Availability Filtering**
   ```yaml
   hotel-service:
     ribbon:
       NFLoadBalancerRuleClassName: com.netflix.loadbalancer.AvailabilityFilteringRule
   ```

### Load Balancer Metrics

```promql
# Request distribution across instances
sum(rate(http_server_requests_seconds_count[5m])) by (instance)

# Load balancer retries
ribbon_loadbalancer_retry_count_total
```

## Service-to-Service Communication

### Using RestTemplate

```java
@Service
@RequiredArgsConstructor
public class HotelServiceClient {
    
    @LoadBalanced
    private final RestTemplate restTemplate;
    
    public Hotel getHotel(Long id) {
        return restTemplate.getForObject(
            "http://hotel-service/hotels/" + id,
            Hotel.class
        );
    }
    
    public List<Hotel> searchHotels(SearchCriteria criteria) {
        return restTemplate.postForObject(
            "http://hotel-service/hotels/search",
            criteria,
            HotelList.class
        ).getHotels();
    }
}
```

### Using WebClient (Reactive)

```java
@Service
@RequiredArgsConstructor
public class HotelServiceClient {
    
    @LoadBalanced
    private final WebClient.Builder webClientBuilder;
    
    public Mono<Hotel> getHotel(Long id) {
        return webClientBuilder.build()
            .get()
            .uri("http://hotel-service/hotels/{id}", id)
            .retrieve()
            .bodyToMono(Hotel.class);
    }
}
```

### Using Feign Client

```java
@FeignClient(name = "hotel-service")
public interface HotelServiceClient {
    
    @GetMapping("/hotels/{id}")
    Hotel getHotel(@PathVariable Long id);
    
    @PostMapping("/hotels/search")
    List<Hotel> searchHotels(@RequestBody SearchCriteria criteria);
}
```

## Health Checks

### Eureka Health Indicator

```java
@Component
public class EurekaHealthIndicator implements HealthIndicator {
    
    @Autowired
    private EurekaClient eurekaClient;
    
    @Override
    public Health health() {
        List<InstanceInfo> instances = eurekaClient.getInstancesByVipAddress("hotel-service", false);
        
        if (instances.isEmpty()) {
            return Health.down()
                .withDetail("hotel-service", "No instances available")
                .build();
        }
        
        return Health.up()
            .withDetail("hotel-service", instances.size() + " instances")
            .build();
    }
}
```

### Service Health Check

```yaml
management:
  health:
    eureka:
      enabled: true
    diskspace:
      enabled: true
    db:
      enabled: true
```

## Monitoring

### Eureka Dashboard

**URL:** http://localhost:8761

**Metrics:**
- Registered instances
- Renews (last minute)
- Renews threshold
- Self-preservation mode status

### Prometheus Metrics

```promql
# Registered instances
eureka_server_registry_size

# Heartbeat rate
rate(eureka_server_renews_total[1m])

# Failed heartbeats
eureka_server_renews_failed_total

# Registry size by application
eureka_server_registry_size_by_application
```

### Grafana Dashboard Queries

**Service Availability:**
```promql
count(up{job="spring-boot-services"} == 1) by (application)
```

**Instance Count:**
```promql
eureka_server_registry_size_by_application
```

## Self-Preservation Mode

### What is it?

Protects against network partitions by not evicting instances during mass heartbeat failures.

**Trigger:** When renewal rate < 85% of expected

**Behavior:**
- Stops evicting instances
- Continues accepting registrations
- Displays warning in dashboard

**Configuration:**
```yaml
eureka:
  server:
    enable-self-preservation: true
    renewal-percent-threshold: 0.85
```

## Service Discovery Patterns

### 1. Client-Side Discovery

```
Client → Eureka (get instances) → Client (load balance) → Service
```

**Pros:** Simple, no additional infrastructure  
**Cons:** Client complexity

### 2. Server-Side Discovery

```
Client → Load Balancer → Eureka → Service
```

**Pros:** Client simplicity  
**Cons:** Additional infrastructure (Kong, Nginx)

### 3. Hybrid Approach

```
External → Kong (server-side) → Services
Internal → Eureka (client-side) → Services
```

## Best Practices

### 1. Use Meaningful Service Names

✅ **Good:** `hotel-service`, `booking-service`  
❌ **Bad:** `service1`, `microservice-a`

### 2. Configure Appropriate Timeouts

```yaml
eureka:
  instance:
    lease-renewal-interval-in-seconds: 30
    lease-expiration-duration-in-seconds: 90
```

### 3. Enable Health Checks

```yaml
eureka:
  instance:
    health-check-url-path: /actuator/health
```

### 4. Use Zones for Availability

```yaml
eureka:
  instance:
    metadata-map:
      zone: us-east-1a
```

### 5. Monitor Registry Size

Alert when instances < expected count

## Troubleshooting

### Service Not Registering

**Symptoms:**
- Service not visible in Eureka dashboard
- No heartbeats

**Solutions:**
1. Check Eureka server URL
2. Verify network connectivity
3. Check application name
4. Review logs for registration errors

### Service Marked as DOWN

**Symptoms:**
- Instance shows as DOWN in Eureka
- Health check failing

**Solutions:**
1. Check health endpoint: `/actuator/health`
2. Verify dependencies (DB, Redis)
3. Check application logs
4. Increase health check timeout

### Load Balancer Not Distributing

**Symptoms:**
- All requests go to one instance
- Uneven load distribution

**Solutions:**
1. Verify multiple instances registered
2. Check Ribbon configuration
3. Review load balancing strategy
4. Check instance health status

## Configuration Files

- **Eureka Server:** `eureka-server/src/main/resources/application.yml`
- **Eureka Client:** `config/eureka-client-config.yml`
- **POM:** `eureka-server/pom.xml`

## Docker Compose Integration

```yaml
eureka-server:
  build: ./eureka-server
  container_name: eureka-server
  ports:
    - "8761:8761"
  environment:
    - SPRING_PROFILES_ACTIVE=dev
  networks:
    - ticket-katum-network
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8761/actuator/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

## Next Steps

1. ✅ Set up Eureka server
2. ✅ Configure service registration
3. ✅ Implement load balancing
4. [ ] Update all service calls
5. [ ] Test service discovery
6. [ ] Set up Eureka HA
7. [ ] Monitor service registry
8. [ ] Create failover tests

## Resources

- **Spring Cloud Netflix:** https://spring.io/projects/spring-cloud-netflix
- **Eureka Wiki:** https://github.com/Netflix/eureka/wiki
- **Service Discovery Patterns:** https://microservices.io/patterns/service-registry.html
