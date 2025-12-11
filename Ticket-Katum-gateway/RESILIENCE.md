# Resilience Patterns - Ticket Katum Microservices

## Overview

This guide covers the resilience patterns implemented across all Ticket Katum microservices to ensure fault tolerance, graceful degradation, and high availability.

## Resilience Patterns Implemented

### 1. Circuit Breaker Pattern

**Purpose:** Prevent cascading failures by stopping requests to failing services.

**How it works:**
- **Closed State:** Normal operation, requests pass through
- **Open State:** Service is failing, requests fail fast
- **Half-Open State:** Testing if service has recovered

**Configuration:**

| Service | Failure Threshold | Wait Duration | Min Calls |
|---------|------------------|---------------|-----------|
| Hotel Service | 40% | 15s | 10 |
| Booking Service | 45% | 20s | 10 |
| Payment Service | 30% | 30s | 5 |
| Auth Service | 50% | 10s | 10 |
| Database | 60% | 30s | 5 |
| Cache | 70% | 5s | 5 |

**Usage Example:**

```java
@Service
public class HotelServiceClient {
    
    @CircuitBreaker(name = "hotelService", fallbackMethod = "getHotelFallback")
    public Hotel getHotel(Long id) {
        return restTemplate.getForObject(
            hotelServiceUrl + "/hotels/" + id, 
            Hotel.class
        );
    }
    
    private Hotel getHotelFallback(Long id, Exception ex) {
        log.warn("Circuit breaker activated for hotel {}: {}", id, ex.getMessage());
        return Hotel.builder()
            .id(id)
            .name("Hotel Temporarily Unavailable")
            .available(false)
            .build();
    }
}
```

### 2. Retry Pattern

**Purpose:** Automatically retry failed requests with exponential backoff.

**Configuration:**

| Service | Max Attempts | Initial Wait | Backoff Multiplier |
|---------|--------------|--------------|-------------------|
| Hotel Service | 3 | 1s | 2x |
| Booking Service | 4 | 500ms | 2x |
| Payment Service | 5 | 2s | 3x |
| Database | 3 | 200ms | 2x |
| Cache | 2 | 100ms | None |

**Usage Example:**

```java
@Retry(name = "hotelService", fallbackMethod = "searchHotelsFallback")
public List<Hotel> searchHotels(SearchCriteria criteria) {
    return restTemplate.postForObject(
        hotelServiceUrl + "/hotels/search",
        criteria,
        HotelList.class
    ).getHotels();
}
```

**Retry Timeline:**
```
Attempt 1: Immediate
Attempt 2: Wait 1s
Attempt 3: Wait 2s (1s * 2)
Attempt 4: Wait 4s (2s * 2)
```

### 3. Bulkhead Pattern

**Purpose:** Isolate resources to prevent resource exhaustion.

**Configuration:**

| Service | Max Concurrent Calls | Max Wait Duration |
|---------|---------------------|-------------------|
| Hotel Service | 50 | 100ms |
| Booking Service | 30 | 200ms |
| Payment Service | 20 | 500ms |
| Database | 100 | 0ms |
| Cache | 200 | 0ms |

**Usage Example:**

```java
@Bulkhead(name = "hotelService", type = Bulkhead.Type.SEMAPHORE)
public List<Hotel> getFeaturedHotels() {
    return restTemplate.getForObject(
        hotelServiceUrl + "/hotels/featured",
        HotelList.class
    ).getHotels();
}
```

### 4. Time Limiter Pattern

**Purpose:** Prevent requests from hanging indefinitely.

**Configuration:**

| Service | Timeout |
|---------|---------|
| Hotel Service | 3s |
| Booking Service | 5s |
| Payment Service | 10s |
| Database | 2s |
| Cache | 500ms |

**Usage Example:**

```java
@TimeLimiter(name = "paymentService")
public CompletableFuture<PaymentResponse> processPayment(PaymentRequest request) {
    return CompletableFuture.supplyAsync(() -> 
        restTemplate.postForObject(
            paymentServiceUrl + "/payments/process",
            request,
            PaymentResponse.class
        )
    );
}
```

### 5. Rate Limiter Pattern

**Purpose:** Protect services from being overwhelmed by too many requests.

**Configuration:**

| Service | Requests/Second |
|---------|----------------|
| Hotel Service | 200 |
| Payment Service | 50 |
| Public API | 1000 |

**Usage Example:**

```java
@RateLimiter(name = "publicApi")
public List<Hotel> searchPublicHotels(String city) {
    return hotelRepository.findByCity(city);
}
```

## Fallback Strategies

### 1. Cached Data Fallback

```java
@CircuitBreaker(name = "hotelService", fallbackMethod = "getCachedHotel")
public Hotel getHotel(Long id) {
    return hotelServiceClient.getHotel(id);
}

private Hotel getCachedHotel(Long id, Exception ex) {
    return cacheManager.getCache("hotels").get(id, Hotel.class);
}
```

### 2. Default Response Fallback

```java
@CircuitBreaker(name = "recommendationService", fallbackMethod = "getDefaultRecommendations")
public List<Hotel> getRecommendations(Long userId) {
    return recommendationService.getPersonalizedRecommendations(userId);
}

private List<Hotel> getDefaultRecommendations(Long userId, Exception ex) {
    return hotelRepository.findTopRatedHotels(PageRequest.of(0, 10));
}
```

### 3. Graceful Degradation

```java
@CircuitBreaker(name = "enrichmentService", fallbackMethod = "getBasicHotelInfo")
public EnrichedHotel getEnrichedHotel(Long id) {
    Hotel hotel = hotelService.getHotel(id);
    Reviews reviews = reviewService.getReviews(id);
    Photos photos = photoService.getPhotos(id);
    return EnrichedHotel.builder()
        .hotel(hotel)
        .reviews(reviews)
        .photos(photos)
        .build();
}

private EnrichedHotel getBasicHotelInfo(Long id, Exception ex) {
    // Return hotel without enrichment
    Hotel hotel = hotelService.getHotel(id);
    return EnrichedHotel.builder()
        .hotel(hotel)
        .build();
}
```

## Health Checks

### Liveness Probe

**Purpose:** Determine if the application is running.

**Endpoint:** `/actuator/health/liveness`

**Checks:**
- Application is running
- No deadlocks
- Disk space available

### Readiness Probe

**Purpose:** Determine if the application can handle traffic.

**Endpoint:** `/actuator/health/readiness`

**Checks:**
- Database connectivity
- Redis connectivity
- Circuit breakers not all open
- Downstream services available

**Configuration:**

```yaml
management:
  endpoint:
    health:
      probes:
        enabled: true
      show-details: always
      group:
        liveness:
          include: livenessState,diskSpace
        readiness:
          include: readinessState,db,redis,circuitBreakers
```

## Monitoring Resilience

### Circuit Breaker Metrics

**Prometheus Metrics:**
- `resilience4j_circuitbreaker_state` - Current state (0=closed, 1=open, 2=half-open)
- `resilience4j_circuitbreaker_calls_total` - Total calls
- `resilience4j_circuitbreaker_failure_rate` - Failure rate

**Grafana Dashboard Query:**
```promql
# Circuit breaker state
resilience4j_circuitbreaker_state{name="hotelService"}

# Failure rate
rate(resilience4j_circuitbreaker_calls_total{kind="failed"}[5m]) / 
rate(resilience4j_circuitbreaker_calls_total[5m])
```

### Retry Metrics

**Prometheus Metrics:**
- `resilience4j_retry_calls_total` - Total retry attempts
- `resilience4j_retry_calls_total{kind="successful_with_retry"}` - Successful retries
- `resilience4j_retry_calls_total{kind="failed_with_retry"}` - Failed retries

### Bulkhead Metrics

**Prometheus Metrics:**
- `resilience4j_bulkhead_available_concurrent_calls` - Available capacity
- `resilience4j_bulkhead_max_allowed_concurrent_calls` - Max capacity

## Testing Resilience

### 1. Circuit Breaker Test

```bash
# Stop hotel service
docker-compose stop hotel-service

# Make requests through BFF
for i in {1..20}; do
  curl http://localhost:8081/api/bff/hotels/1
done

# Check circuit breaker state
curl http://localhost:8081/actuator/circuitbreakers | jq '.circuitBreakers.hotelService.state'

# Expected: "OPEN"

# Restart service
docker-compose start hotel-service

# Wait for half-open state
sleep 15

# Make test requests
curl http://localhost:8081/api/bff/hotels/1

# Circuit breaker should close after successful calls
```

### 2. Retry Test

```bash
# Simulate intermittent failures
# (Requires test endpoint that fails randomly)

curl http://localhost:8081/api/test/retry

# Check logs for retry attempts
docker-compose logs web-bff | grep "Retry attempt"
```

### 3. Bulkhead Test

```bash
# Generate concurrent load
ab -n 1000 -c 100 http://localhost:8081/api/bff/hotels/search?city=Kathmandu

# Check bulkhead metrics
curl http://localhost:8081/actuator/metrics/resilience4j.bulkhead.available.concurrent.calls
```

### 4. Timeout Test

```bash
# Call slow endpoint
curl http://localhost:8081/api/bff/hotels/slow-search

# Should timeout after configured duration
# Expected: 408 Request Timeout or fallback response
```

## Best Practices

### 1. Always Provide Fallbacks

✅ **Good:**
```java
@CircuitBreaker(name = "service", fallbackMethod = "fallback")
public Data getData() { ... }

private Data fallback(Exception ex) {
    return cachedData;
}
```

❌ **Bad:**
```java
@CircuitBreaker(name = "service")
public Data getData() { ... }
// No fallback - users see errors
```

### 2. Use Appropriate Timeouts

✅ **Good:**
```java
@TimeLimiter(name = "quickOperation") // 500ms
public String getFromCache() { ... }

@TimeLimiter(name = "slowOperation") // 10s
public PaymentResult processPayment() { ... }
```

❌ **Bad:**
```java
@TimeLimiter(name = "default") // Same timeout for everything
```

### 3. Monitor Circuit Breaker State

✅ **Good:**
- Alert when circuit breaker opens
- Dashboard showing circuit breaker states
- Automatic notifications to on-call

❌ **Bad:**
- No monitoring
- Discover issues from user complaints

### 4. Test Failure Scenarios

✅ **Good:**
- Regular chaos engineering tests
- Automated failure injection
- Load testing with failures

❌ **Bad:**
- Only test happy path
- Discover issues in production

## Troubleshooting

### Circuit Breaker Stuck Open

**Symptoms:**
- All requests failing fast
- Circuit breaker state = OPEN
- Service is actually healthy

**Solution:**
```bash
# Check if service is actually down
curl http://hotel-service:8087/actuator/health

# If healthy, manually close circuit breaker
curl -X POST http://localhost:8081/actuator/circuitbreakers/hotelService/reset

# Or wait for automatic transition (configured wait duration)
```

### Too Many Retries

**Symptoms:**
- High latency
- Increased load on downstream services
- Retry storms

**Solution:**
```yaml
# Reduce max attempts
resilience4j:
  retry:
    instances:
      problematicService:
        maxAttempts: 2  # Reduce from 5
        waitDuration: 2s  # Increase backoff
```

### Bulkhead Exhaustion

**Symptoms:**
- Requests timing out
- `resilience4j_bulkhead_available_concurrent_calls` = 0

**Solution:**
```yaml
# Increase capacity
resilience4j:
  bulkhead:
    instances:
      service:
        maxConcurrentCalls: 100  # Increase from 50
```

## Configuration Files

- **Resilience Config:** `config/resilience4j-config.yml`
- **Java Config:** `config/ResilienceConfig.java`
- **Application Config:** Each service's `application.yml`

## Next Steps

1. ✅ Implement circuit breakers in all services
2. ✅ Add retry logic with exponential backoff
3. ✅ Configure bulkheads
4. ✅ Set up timeouts
5. ✅ Add health checks
6. [ ] Test all failure scenarios
7. [ ] Create runbooks for incidents
8. [ ] Train team on resilience patterns

## Resources

- **Resilience4j Docs:** https://resilience4j.readme.io/
- **Circuit Breaker Pattern:** https://martinfowler.com/bliki/CircuitBreaker.html
- **Bulkhead Pattern:** https://docs.microsoft.com/en-us/azure/architecture/patterns/bulkhead
