# Caching Strategy - Ticket Katum Microservices

## Overview

Comprehensive caching strategy using Redis for distributed caching with multi-level cache architecture, optimized TTLs, cache warming, and intelligent eviction policies.

## Cache Architecture

### Multi-Level Caching

```
┌─────────────────────────────────────┐
│         Application Layer           │
├─────────────────────────────────────┤
│  L1: Hibernate Second-Level Cache   │
│  (In-Memory, Per-Instance)          │
├─────────────────────────────────────┤
│  L2: Redis Distributed Cache        │
│  (Shared Across Instances)          │
├─────────────────────────────────────┤
│  L3: Database                       │
│  (Source of Truth)                  │
└─────────────────────────────────────┘
```

### Cache Flow

```
Request → L1 Cache → L2 Cache (Redis) → Database
   ↓         ↓           ↓                 ↓
 Hit?      Hit?        Hit?              Query
   ↓         ↓           ↓                 ↓
Return ← Store L1 ← Store L2 ← Store All Levels
```

## Cache Regions & TTL

### Hotel Service

| Cache Region | TTL | Use Case |
|--------------|-----|----------|
| `hotels` | 10 min | Hotel details |
| `hotel-search` | 5 min | Search results |
| `featured-hotels` | 1 hour | Featured listings |
| `hotel-recommendations` | 30 min | Personalized recommendations |
| `cities` | 24 hours | City list (static) |
| `room-availability` | 2 min | Real-time availability |
| `hotel-reviews` | 15 min | User reviews |

### Booking Service

| Cache Region | TTL | Use Case |
|--------------|-----|----------|
| `user-bookings` | 5 min | User's bookings |
| `booking-details` | 10 min | Booking information |
| `booking-status` | 1 min | Real-time status |

### Bus Service

| Cache Region | TTL | Use Case |
|--------------|-----|----------|
| `bus-routes` | 1 hour | Route information |
| `bus-schedules` | 30 min | Schedule data |
| `seat-availability` | 1 min | Real-time seats |
| `bus-operators` | 24 hours | Operator info (static) |

### Payment Service

| Cache Region | TTL | Use Case |
|--------------|-----|----------|
| `payment-methods` | 1 hour | Saved payment methods |
| `payment-status` | 30 sec | Real-time status |
| `transaction-history` | 10 min | Transaction records |

### Auth Service

| Cache Region | TTL | Use Case |
|--------------|-----|----------|
| `user-sessions` | 30 min | Active sessions |
| `user-profiles` | 15 min | User information |
| `user-permissions` | 1 hour | Access control |

## Cache Patterns

### 1. Cache-Aside Pattern

**Implementation:**
```java
@Service
public class HotelService {
    
    @Cacheable(value = "hotels", key = "#id")
    public Hotel getHotel(Long id) {
        return hotelRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Hotel not found"));
    }
    
    @CachePut(value = "hotels", key = "#hotel.id")
    public Hotel updateHotel(Hotel hotel) {
        return hotelRepository.save(hotel);
    }
    
    @CacheEvict(value = "hotels", key = "#id")
    public void deleteHotel(Long id) {
        hotelRepository.deleteById(id);
    }
}
```

### 2. Write-Through Pattern

**Implementation:**
```java
@CachePut(value = "hotels", key = "#hotel.id")
public Hotel createHotel(Hotel hotel) {
    Hotel saved = hotelRepository.save(hotel);
    // Cache is automatically updated
    return saved;
}
```

### 3. Cache Warming

**Scheduled Warming:**
```java
@Scheduled(cron = "0 0 * * * *")  // Every hour
public void warmFeaturedHotels() {
    List<Hotel> featured = hotelRepository.findFeaturedHotels();
    cacheManager.getCache("featured-hotels").put("all", featured);
}
```

### 4. Cache Invalidation

**Event-Based Invalidation:**
```java
@EventListener
public void onHotelUpdated(HotelUpdatedEvent event) {
    // Evict hotel cache
    cacheManager.getCache("hotels").evict(event.getHotelId());
    
    // Evict related caches
    cacheManager.getCache("hotel-search").clear();
    cacheManager.getCache("featured-hotels").clear();
}
```

## Cache Configuration

### Redis Connection Pool

```yaml
spring:
  data:
    redis:
      lettuce:
        pool:
          max-active: 20
          max-idle: 10
          min-idle: 5
          max-wait: 2000ms
```

### Cache Serialization

```java
@Bean
public RedisCacheConfiguration cacheConfiguration() {
    return RedisCacheConfiguration.defaultCacheConfig()
        .serializeKeysWith(StringRedisSerializer)
        .serializeValuesWith(GenericJackson2JsonRedisSerializer)
        .disableCachingNullValues();
}
```

## Cache Warming Strategy

### On Startup

```java
@EventListener(ApplicationReadyEvent.class)
public void warmCacheOnStartup() {
    warmFeaturedHotels();
    warmCities();
    warmBusRoutes();
    warmBusOperators();
}
```

### Scheduled Warming

| Data Type | Schedule | Reason |
|-----------|----------|--------|
| Featured Hotels | Every hour | Frequently accessed |
| Cities | Daily | Static data |
| Bus Routes | Every 6 hours | Semi-static |
| Operators | Daily | Rarely changes |

## Cache Eviction Policies

### LRU (Least Recently Used)

**Configuration:**
```yaml
cache:
  eviction:
    policy: LRU
    max-memory: 512mb
    max-memory-policy: allkeys-lru
```

**Use Case:** General purpose caching

### LFU (Least Frequently Used)

**Configuration:**
```yaml
cache:
  eviction:
    policy: LFU
    max-memory-policy: allkeys-lfu
```

**Use Case:** Long-running applications with stable access patterns

### TTL-Based Eviction

**Automatic expiration based on TTL:**
- Real-time data: 30s - 2min
- Dynamic data: 5min - 15min
- Semi-static data: 30min - 1hour
- Static data: 24 hours

## Cache Monitoring

### Prometheus Metrics

```promql
# Cache hit rate
rate(cache_gets_total{result="hit"}[5m]) / 
rate(cache_gets_total[5m])

# Cache miss rate
rate(cache_gets_total{result="miss"}[5m]) / 
rate(cache_gets_total[5m])

# Cache evictions
rate(cache_evictions_total[5m])

# Cache size
cache_size_bytes
```

### Grafana Dashboard Queries

**Hit Rate:**
```promql
sum(rate(cache_gets_total{result="hit"}[5m])) by (cache) / 
sum(rate(cache_gets_total[5m])) by (cache) * 100
```

**Response Time Improvement:**
```promql
# With cache
histogram_quantile(0.95, rate(http_server_requests_seconds_bucket{cache="hit"}[5m]))

# Without cache
histogram_quantile(0.95, rate(http_server_requests_seconds_bucket{cache="miss"}[5m]))
```

## Performance Optimization

### Cache Key Design

**Good:**
```java
@Cacheable(value = "hotel-search", key = "#city + '-' + #rating + '-' + #price")
public List<Hotel> searchHotels(String city, int rating, int price) {
    // ...
}
```

**Bad:**
```java
@Cacheable(value = "hotel-search", key = "#searchCriteria")
// Object as key - poor cache hit rate
```

### Conditional Caching

```java
@Cacheable(value = "hotels", key = "#id", 
           condition = "#id != null",
           unless = "#result == null")
public Hotel getHotel(Long id) {
    // ...
}
```

### Cache Partitioning

```java
// Partition by region for better distribution
@Cacheable(value = "hotels", key = "#region + ':' + #id")
public Hotel getHotelByRegion(String region, Long id) {
    // ...
}
```

## Cache Invalidation Strategies

### Time-Based Invalidation

```java
@Scheduled(cron = "0 0 2 * * *")  // 2 AM daily
public void clearStaleCache() {
    cacheManager.getCache("hotel-search").clear();
}
```

### Event-Based Invalidation

```java
@EventListener
public void onDataUpdated(DataUpdatedEvent event) {
    cacheManager.getCache(event.getCacheName()).evict(event.getKey());
}
```

### Manual Invalidation

```java
@PostMapping("/admin/cache/clear")
public void clearCache(@RequestParam String cacheName) {
    cacheManager.getCache(cacheName).clear();
}
```

## Distributed Caching

### Redis Cluster Configuration

```yaml
spring:
  data:
    redis:
      cluster:
        nodes:
          - redis-node1:6379
          - redis-node2:6379
          - redis-node3:6379
        max-redirects: 3
```

### Cache Synchronization

```java
// Publish cache invalidation event
redisTemplate.convertAndSend("cache-invalidation", 
    new CacheInvalidationMessage("hotels", hotelId));

// Subscribe to invalidation events
@RedisListener(topics = "cache-invalidation")
public void onCacheInvalidation(CacheInvalidationMessage message) {
    cacheManager.getCache(message.getCacheName())
        .evict(message.getKey());
}
```

## Best Practices

### 1. Cache Appropriate Data

✅ **Good:** Static/semi-static data, expensive queries  
❌ **Bad:** User-specific data, real-time data

### 2. Set Appropriate TTLs

✅ **Good:** Based on data volatility  
❌ **Bad:** Same TTL for all data

### 3. Monitor Cache Performance

✅ **Good:** Track hit rate, evictions, memory  
❌ **Bad:** No monitoring

### 4. Handle Cache Failures

✅ **Good:** Graceful degradation  
❌ **Bad:** Application crashes

### 5. Warm Critical Caches

✅ **Good:** Preload on startup  
❌ **Bad:** Cold start every time

## Troubleshooting

### Low Hit Rate

**Symptoms:**
- Cache hit rate < 50%
- High database load

**Solutions:**
1. Increase TTL
2. Warm cache more frequently
3. Review cache key design
4. Check cache size limits

### High Memory Usage

**Symptoms:**
- Redis memory > 80%
- Frequent evictions

**Solutions:**
1. Reduce TTLs
2. Implement LRU eviction
3. Increase Redis memory
4. Remove unused caches

### Cache Stampede

**Symptoms:**
- Multiple requests for same data
- Database overload on cache miss

**Solutions:**
```java
@Cacheable(value = "hotels", key = "#id", sync = true)
public Hotel getHotel(Long id) {
    // sync = true prevents cache stampede
}
```

## Testing

### Cache Hit Rate Test

```java
@Test
public void testCacheHitRate() {
    // First call - cache miss
    hotelService.getHotel(1L);
    
    // Second call - cache hit
    hotelService.getHotel(1L);
    
    // Verify cache hit
    verify(hotelRepository, times(1)).findById(1L);
}
```

### Cache Eviction Test

```java
@Test
public void testCacheEviction() {
    Hotel hotel = hotelService.getHotel(1L);
    
    // Update hotel
    hotelService.updateHotel(hotel);
    
    // Verify cache updated
    Hotel updated = hotelService.getHotel(1L);
    assertThat(updated).isEqualTo(hotel);
}
```

## Configuration Files

- **Cache Config:** `config/CacheConfig.java`
- **Cache YAML:** `config/cache-config.yml`
- **Cache Warming:** `config/CacheWarmingService.java`

## Next Steps

1. ✅ Configure Redis cache
2. ✅ Implement cache-aside pattern
3. ✅ Set up TTL policies
4. ✅ Create cache warming
5. [ ] Test cache performance
6. [ ] Monitor hit rates
7. [ ] Optimize cache keys
8. [ ] Implement distributed caching

## Resources

- **Spring Cache:** https://spring.io/guides/gs/caching/
- **Redis:** https://redis.io/documentation
- **Cache Patterns:** https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/caching-patterns.html
