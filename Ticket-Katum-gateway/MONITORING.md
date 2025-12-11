# Ticket Katum - Monitoring & Observability Setup

## Overview

This guide covers the complete monitoring and observability stack for Ticket Katum microservices.

## Components

### 1. Metrics Collection (Prometheus)
- **Purpose:** Collect and store time-series metrics
- **Port:** 9090
- **Configuration:** `monitoring/prometheus/prometheus.yml`

### 2. Alerting (Alertmanager)
- **Purpose:** Handle alerts from Prometheus
- **Port:** 9093
- **Configuration:** `monitoring/prometheus/alertmanager.yml`

### 3. Visualization (Grafana)
- **Purpose:** Create dashboards and visualize metrics
- **Port:** 3000
- **Default Credentials:** admin/admin

### 4. Distributed Tracing (Jaeger)
- **Purpose:** Track requests across microservices
- **Port:** 16686 (UI)
- **Agent Port:** 6831

### 5. Centralized Logging (ELK Stack)
- **Elasticsearch:** 9200
- **Kibana:** 5601
- **Filebeat:** Log shipping

## Quick Start

### 1. Start Monitoring Stack

```bash
# Start all monitoring services
docker-compose up -d prometheus grafana alertmanager jaeger elasticsearch kibana filebeat

# Verify services
docker-compose ps | grep -E "prometheus|grafana|jaeger"
```

### 2. Access Dashboards

**Prometheus:**
```
URL: http://localhost:9090
```

**Grafana:**
```
URL: http://localhost:3000
Username: admin
Password: admin (change on first login)
```

**Jaeger:**
```
URL: http://localhost:16686
```

**Kibana:**
```
URL: http://localhost:5601
```

### 3. Verify Metrics Collection

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check if services are being scraped
curl http://localhost:9090/api/v1/query?query=up
```

## Prometheus Configuration

### Scrape Targets

The following services are automatically scraped:

| Service | Endpoint | Interval |
|---------|----------|----------|
| Web BFF | web-bff:8081/actuator/prometheus | 10s |
| Mobile BFF | mobile-bff:8082/actuator/prometheus | 10s |
| Auth Service | auth-service:8089/actuator/prometheus | 10s |
| Booking Service | booking-service:8091/actuator/prometheus | 10s |
| Hotel Service | hotel-service:8087/actuator/prometheus | 10s |
| Bus Service | bus-service:8083/actuator/prometheus | 10s |
| Payment Service | payment-service:8092/actuator/prometheus | 10s |
| PostgreSQL | postgres-exporter:9187 | 15s |
| Redis | redis-exporter:9121 | 15s |
| Kong | kong:8001/metrics | 15s |

### Alert Rules

**40+ alert rules configured:**

1. **Availability (5 rules)**
   - ServiceDown
   - ServiceFlapping
   - DatabaseDown
   - CacheDown
   - MessageQueueDown

2. **Performance (5 rules)**
   - HighResponseTime
   - HighErrorRate
   - SlowDatabaseQueries
   - HighGatewayLatency
   - LowCacheHitRate

3. **Resources (5 rules)**
   - HighMemoryUsage
   - HighCPUUsage
   - DiskSpaceLow
   - DatabaseConnectionPoolExhaustion
   - RedisMemoryHigh

4. **Circuit Breakers (2 rules)**
   - CircuitBreakerOpen
   - HighCircuitBreakerFailureRate

5. **Business Metrics (2 rules)**
   - LowBookingRate
   - HighPaymentFailureRate

## Grafana Dashboards

### Pre-configured Dashboards

1. **Services Overview**
   - Service status
   - Request rate
   - Response times (P95/P99)
   - Error rates
   - Memory usage

2. **Database Performance** (TODO)
   - Connection pool usage
   - Query performance
   - Slow queries
   - Transaction rates

3. **Cache Performance** (TODO)
   - Hit/miss rates
   - Memory usage
   - Eviction rates
   - Key distribution

4. **Business Metrics** (TODO)
   - Booking trends
   - Payment success rates
   - User activity
   - Revenue metrics

### Creating Custom Dashboards

1. Login to Grafana (http://localhost:3000)
2. Click "+" → "Dashboard"
3. Add Panel
4. Select Prometheus as data source
5. Write PromQL query
6. Configure visualization
7. Save dashboard

## Alerting Setup

### Alertmanager Routing

**Critical Alerts →**
- PagerDuty (on-call engineer)
- Slack (#critical-alerts)
- Email (oncall@ticketkatum.com)

**Warning Alerts →**
- Slack (#monitoring-alerts)

**Business Alerts →**
- Slack (#business-metrics)
- Email (business@ticketkatum.com)

### Configure Slack Integration

1. Create Slack Webhook:
   - Go to Slack API
   - Create Incoming Webhook
   - Copy webhook URL

2. Update `.env`:
   ```bash
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```

3. Restart Alertmanager:
   ```bash
   docker-compose restart alertmanager
   ```

### Configure PagerDuty

1. Get PagerDuty Integration Key
2. Update `.env`:
   ```bash
   PAGERDUTY_SERVICE_KEY=your_service_key
   ```

3. Restart Alertmanager

## Distributed Tracing

### Enable in Services

All services are pre-configured with OpenTelemetry.

**Verify tracing:**
```bash
# Make a request
curl http://localhost:8081/api/bff/hotels/1

# View trace in Jaeger
# Open http://localhost:16686
# Select service: web-bff
# Click "Find Traces"
```

### Trace Propagation

Traces automatically propagate through:
- BFF → Microservices
- Microservices → Database
- Microservices → Cache
- Microservices → Message Queue

## Centralized Logging

### Log Aggregation Flow

```
Services → Docker Logs → Filebeat → Elasticsearch → Kibana
```

### View Logs in Kibana

1. Open http://localhost:5601
2. Go to "Discover"
3. Create index pattern: `ticket-katum-*`
4. Select time field: `@timestamp`
5. View logs

### Log Queries

**Find errors:**
```
level: ERROR
```

**Find specific service logs:**
```
service_name: "hotel-service"
```

**Find slow requests:**
```
duration: >1000 AND path: "/api/*"
```

## Monitoring Best Practices

### 1. Set Up Alerts

✅ Configure PagerDuty for critical alerts  
✅ Set up Slack notifications  
✅ Define on-call rotation  
✅ Create runbooks for common alerts

### 2. Create Dashboards

✅ Service-level dashboards  
✅ Infrastructure dashboards  
✅ Business metrics dashboards  
✅ SLI/SLO tracking

### 3. Regular Reviews

✅ Weekly alert review  
✅ Monthly dashboard review  
✅ Quarterly SLO review  
✅ Alert fatigue assessment

### 4. Documentation

✅ Document alert thresholds  
✅ Create runbooks  
✅ Maintain dashboard descriptions  
✅ Update monitoring docs

## Troubleshooting

### Prometheus Not Scraping

```bash
# Check Prometheus logs
docker-compose logs prometheus

# Check target status
curl http://localhost:9090/api/v1/targets

# Verify service health endpoint
curl http://localhost:8087/actuator/prometheus
```

### Grafana Not Showing Data

```bash
# Check Grafana logs
docker-compose logs grafana

# Verify Prometheus datasource
# Grafana → Configuration → Data Sources → Prometheus
# Click "Test" button

# Check dashboard queries
# Edit panel → View query inspector
```

### Alerts Not Firing

```bash
# Check Alertmanager logs
docker-compose logs alertmanager

# Verify alert rules
curl http://localhost:9090/api/v1/rules

# Check Alertmanager config
curl http://localhost:9093/api/v1/status
```

### Jaeger Not Showing Traces

```bash
# Check Jaeger logs
docker-compose logs jaeger

# Verify service configuration
# Check application.yml for tracing config

# Test trace creation
curl http://localhost:8081/api/bff/hotels/1
```

## Metrics Reference

### JVM Metrics

- `jvm_memory_used_bytes` - Memory usage
- `jvm_memory_max_bytes` - Max memory
- `jvm_gc_pause_seconds` - GC pause time
- `process_cpu_usage` - CPU usage

### HTTP Metrics

- `http_server_requests_seconds_count` - Request count
- `http_server_requests_seconds_sum` - Total duration
- `http_server_requests_seconds_bucket` - Histogram buckets

### Database Metrics

- `hikaricp_connections_active` - Active connections
- `hikaricp_connections_max` - Max connections
- `hikaricp_connections_timeout_total` - Connection timeouts

### Cache Metrics

- `cache_gets_total` - Cache get operations
- `cache_puts_total` - Cache put operations
- `cache_evictions_total` - Cache evictions

### Circuit Breaker Metrics

- `resilience4j_circuitbreaker_state` - Circuit breaker state
- `resilience4j_circuitbreaker_calls_total` - Total calls
- `resilience4j_circuitbreaker_failure_rate` - Failure rate

## Next Steps

1. ✅ Configure alert destinations (Slack, PagerDuty)
2. ✅ Create custom Grafana dashboards
3. ✅ Set up log retention policies
4. ✅ Define SLIs and SLOs
5. ✅ Create runbooks for alerts
6. ✅ Train team on monitoring tools
7. ✅ Set up automated reporting

## Resources

- **Prometheus Docs:** https://prometheus.io/docs/
- **Grafana Docs:** https://grafana.com/docs/
- **Jaeger Docs:** https://www.jaegertracing.io/docs/
- **Alertmanager Docs:** https://prometheus.io/docs/alerting/latest/alertmanager/
