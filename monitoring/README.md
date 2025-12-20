# Monitoring Stack for Event-Driven Architecture

This directory contains the complete monitoring setup for the TicketKatum event-driven architecture.

## Components

### 1. Prometheus
- **Port**: 9090
- **Purpose**: Metrics collection and storage
- **Configuration**: `prometheus/prometheus.yml`
- **Alerts**: `prometheus/alerts/event-alerts.yml`

### 2. Grafana
- **Port**: 3000
- **Default Credentials**: admin/admin
- **Dashboards**:
  - Kafka Event Metrics
  - Business Metrics & KPIs
  - Service Health (coming soon)
  - Consumer Performance (coming soon)

### 3. Exporters
- **Kafka Exporter** (port 9308): Kafka metrics
- **Postgres Exporter** (port 9187): Database metrics
- **Redis Exporter** (port 9121): Cache metrics
- **Node Exporter** (port 9100): System metrics

### 4. Alertmanager
- **Port**: 9093
- **Purpose**: Alert routing and notifications

## Quick Start

### 1. Start Monitoring Stack
```bash
cd monitoring
docker-compose up -d
```

### 2. Access Dashboards
- Grafana: http://localhost:3000
- Prometheus: http://localhost:9090
- Alertmanager: http://localhost:9093

### 3. Import Dashboards
Dashboards are auto-provisioned from `dashboards/` directory.

## Dashboards

### Kafka Event Metrics
**File**: `dashboards/kafka-events-dashboard.json`

**Panels**:
- Event Publishing Rate
- Consumer Lag by Topic
- Events by Type
- Publishing Errors
- Event Processing Latency (p95)
- Consumer Processing Rate
- Dead Letter Queue Messages
- Retry Attempts

**Alerts**:
- High Consumer Lag (>1000 messages)

### Business Metrics
**File**: `dashboards/business-metrics-dashboard.json`

**Panels**:
- Booking Conversion Rate
- Real-time Revenue
- Payment Success Rate
- Active Bookings
- Bookings by Event Type
- Revenue Trend
- Payment Failure Reasons
- Customer Activity Heatmap
- Hotel vs Bus vs Event Bookings
- Average Booking Value

## Alerts

### Kafka Alerts
- **HighConsumerLag**: Lag > 1000 messages for 5min
- **CriticalConsumerLag**: Lag > 10000 messages for 2min
- **NoMessagesConsumed**: No consumption for 10min

### Event Publishing Alerts
- **HighPublishingErrorRate**: Error rate > 5% for 5min
- **PublishingFailure**: No events published for 10min

### Business Alerts
- **LowBookingConversionRate**: Conversion < 30% for 30min
- **HighPaymentFailureRate**: Failure rate > 10% for 15min
- **NoRevenueGenerated**: No payments for 1 hour

### Service Health Alerts
- **ServiceDown**: Service unavailable for 2min
- **HighErrorRate**: HTTP 5xx rate > 5% for 5min
- **HighResponseTime**: p95 latency > 2s for 10min

### Infrastructure Alerts
- **HighMemoryUsage**: Memory > 90% for 5min
- **HighCPUUsage**: CPU > 80% for 10min
- **DiskSpaceLow**: Disk < 10% for 5min

## Custom Metrics

### Event Publishers
Add to your publishers:
```java
@Autowired
private MeterRegistry meterRegistry;

// Track published events
meterRegistry.counter("event.published.total",
    "event_type", event.getEventType(),
    "service", "event-service"
).increment();

// Track publishing errors
meterRegistry.counter("event.publishing.errors.total",
    "event_type", event.getEventType(),
    "error_type", "kafka_error"
).increment();

// Track publishing latency
Timer.Sample sample = Timer.start(meterRegistry);
// ... publish event ...
sample.stop(meterRegistry.timer("event.publishing.duration",
    "event_type", event.getEventType()
));
```

### Event Consumers
Add to your consumers:
```java
// Track consumed events
meterRegistry.counter("event.consumed.total",
    "consumer", "analytics",
    "event_type", event.getEventType()
).increment();

// Track processing latency
Timer.Sample sample = Timer.start(meterRegistry);
// ... process event ...
sample.stop(meterRegistry.timer("event.processing.duration",
    "consumer", "analytics",
    "event_type", event.getEventType()
));

// Track DLQ messages
meterRegistry.counter("dlq.messages.total",
    "consumer", "analytics",
    "event_type", event.getEventType()
).increment();
```

### Business Metrics
Add to your services:
```java
// Track bookings
meterRegistry.counter("booking.initiated.total",
    "event_name", eventName
).increment();

meterRegistry.counter("booking.confirmed.total",
    "event_name", eventName,
    "booking_type", "event"
).increment();

// Track revenue
meterRegistry.counter("payment.captured.amount.total").increment(amount.doubleValue());

// Track payment failures
meterRegistry.counter("payment.failed.total",
    "failure_reason", failureReason,
    "gateway", gateway
).increment();
```

## Configuration

### Prometheus Scrape Interval
Default: 15 seconds

To change:
```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 30s  # Change to desired interval
```

### Alert Notification
Configure in `alertmanager/config.yml`:
```yaml
receivers:
  - name: 'email'
    email_configs:
      - to: 'alerts@ticketkatum.com'
        from: 'prometheus@ticketkatum.com'
        smarthost: 'smtp.gmail.com:587'
```

### Dashboard Refresh Rate
Default: 10s (Kafka), 30s (Business)

To change, edit dashboard JSON:
```json
{
  "dashboard": {
    "refresh": "1m"  // Change to desired rate
  }
}
```

## Troubleshooting

### Metrics Not Showing
1. Check service is exposing `/actuator/prometheus` endpoint
2. Verify Prometheus can reach service (check Targets page)
3. Check service logs for metric registration errors

### Alerts Not Firing
1. Check alert rules syntax in Prometheus UI
2. Verify Alertmanager is running
3. Check Alertmanager logs for routing issues

### High Resource Usage
1. Reduce scrape interval
2. Decrease retention period
3. Use recording rules for complex queries

## Production Recommendations

1. **High Availability**: Run 3 Prometheus instances
2. **Long-term Storage**: Use Thanos or Cortex
3. **Security**: Enable authentication and TLS
4. **Backup**: Regular backup of Prometheus data
5. **Capacity Planning**: Monitor Prometheus metrics itself

## Metrics Reference

### Kafka Metrics
- `kafka_producer_record_send_total`: Total records sent
- `kafka_consumergroup_lag`: Consumer lag per topic/group
- `kafka_topic_partitions`: Number of partitions

### Spring Boot Metrics
- `http_server_requests_seconds`: HTTP request duration
- `jvm_memory_used_bytes`: JVM memory usage
- `process_cpu_usage`: CPU usage

### Custom Event Metrics
- `event_published_total`: Events published count
- `event_consumed_total`: Events consumed count
- `event_processing_duration_seconds`: Processing time
- `booking_confirmed_total`: Confirmed bookings
- `payment_captured_amount_total`: Total revenue
