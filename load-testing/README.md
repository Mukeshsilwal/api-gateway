# Load Testing for Event-Driven Architecture

This directory contains load testing scripts and configurations to validate the system can handle 10,000 events/second.

## Quick Start

### Prerequisites
1. **k6** - Load testing tool
   ```bash
   # Install k6
   brew install k6  # macOS
   # or download from https://k6.io/docs/getting-started/installation/
   ```

2. **Running Services**
   - All microservices (event, booking, payment, hotel)
   - Kafka cluster
   - PostgreSQL
   - Redis
   - Prometheus & Grafana

3. **System Resources**
   - Minimum 16GB RAM
   - 8 CPU cores
   - Fast SSD storage

### Run Load Test
```bash
cd load-testing
chmod +x run-load-test.sh
./run-load-test.sh
```

## Test Scenarios

### 1. Event Publishing Load Test
**File**: `k6/event-publishing-load-test.js`

**Profile**:
- Ramp up: 0 → 10k events/sec over 10 minutes
- Sustain: 10k events/sec for 10 minutes
- Ramp down: 10k → 0 over 2 minutes
- Total duration: 22 minutes

**Event Mix**:
- 40% Booking Initiated
- 30% Payment Captured
- 30% Hotel/Bus Bookings

**Success Criteria**:
- ✅ 99% success rate
- ✅ p95 latency < 100ms
- ✅ p99 latency < 200ms
- ✅ HTTP error rate < 1%

### 2. Consumer Lag Monitoring
**File**: `k6/consumer-lag-monitor.js`

Monitors consumer lag during load test:
- Acceptable lag: < 1000 messages
- Warning lag: < 5000 messages
- Critical lag: > 5000 messages

## Performance Tuning

### Kafka Configuration
**File**: `config/kafka-performance.properties`

Key settings for 10k events/sec:
- 10 partitions per topic
- Snappy compression
- Batch size: 32KB
- Linger: 10ms

Apply to Kafka:
```bash
# Update server.properties
cat config/kafka-performance.properties >> $KAFKA_HOME/config/server.properties
# Restart Kafka
```

### Spring Boot Configuration
**File**: `config/application-performance.yml`

Key optimizations:
- 500 Tomcat threads
- 64MB Kafka buffer
- 50 DB connections
- Batch inserts enabled

Apply to services:
```bash
# Add to application.yml or use as profile
cp config/application-performance.yml ../backend/services/event-service/src/main/resources/application-performance.yml
# Start with profile: --spring.profiles.active=performance
```

### JVM Tuning
**File**: `config/jvm-tuning.sh`

Optimizations:
- 4GB heap (2GB min, 4GB max)
- G1GC with 200ms pause target
- String deduplication
- Large pages enabled

Apply to services:
```bash
source config/jvm-tuning.sh
java $JAVA_OPTS -jar service.jar
```

## Monitoring During Test

### Grafana Dashboards
Access: http://localhost:3000

**Key Dashboards**:
1. **Kafka Event Metrics**
   - Publishing rate by event type
   - Consumer lag
   - Error rates

2. **Business Metrics**
   - Events processed
   - Revenue generated
   - Conversion rates

### Prometheus Queries
Access: http://localhost:9090

**Useful Queries**:
```promql
# Publishing rate
rate(event_published_total[1m])

# Consumer lag
kafka_consumergroup_lag

# Processing latency p95
histogram_quantile(0.95, rate(event_processing_duration_seconds_bucket[5m]))

# Error rate
rate(event_publishing_errors_total[1m])
```

### Real-time Monitoring
```bash
# Watch Kafka consumer lag
watch -n 1 'kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --all-groups'

# Monitor JVM
jstat -gc <pid> 1000

# System resources
htop
```

## Results Analysis

### Automated Report
After test completion, results are saved to `results/<timestamp>/`:
- `load-test.json` - k6 test results
- `consumer-lag.json` - Consumer lag metrics
- `publish-rate.json` - Publishing rate from Prometheus
- `consume-rate.json` - Consumption rate from Prometheus

### Manual Analysis
```bash
# Parse k6 results
k6 inspect results/*/load-test.json

# Calculate average throughput
jq '[.metrics.iterations.values.rate] | add / length' results/*/load-test.json

# Find p95 latency
jq '.metrics.event_publish_duration.values.p95' results/*/load-test.json
```

## Troubleshooting

### Low Throughput

**Symptoms**: Can't reach 10k events/sec

**Solutions**:
1. Increase Kafka partitions
   ```bash
   kafka-topics.sh --alter --topic events.booking.initiated.v1 --partitions 20 --bootstrap-server localhost:9092
   ```

2. Scale services horizontally
   ```bash
   docker-compose up --scale event-service=3
   ```

3. Increase JVM heap
   ```bash
   export JAVA_OPTS="-Xms4G -Xmx8G"
   ```

### High Consumer Lag

**Symptoms**: Lag > 5000 messages

**Solutions**:
1. Increase consumer concurrency
   ```yaml
   # application.yml
   spring.kafka.listener.concurrency: 5
   ```

2. Optimize consumer processing
   - Use batch processing
   - Reduce database calls
   - Cache frequently accessed data

3. Add more consumer instances

### High Latency

**Symptoms**: p95 > 200ms

**Solutions**:
1. Enable compression
   ```yaml
   spring.kafka.producer.compression-type: snappy
   ```

2. Tune batch settings
   ```yaml
   spring.kafka.producer.batch-size: 65536
   spring.kafka.producer.linger-ms: 5
   ```

3. Optimize database queries
   - Add indexes
   - Use connection pooling
   - Enable query caching

### Out of Memory

**Symptoms**: JVM crashes, OOM errors

**Solutions**:
1. Increase heap size
2. Tune GC settings
3. Check for memory leaks
4. Reduce batch sizes

## Performance Benchmarks

### Target Metrics
| Metric | Target | Acceptable | Critical |
|--------|--------|------------|----------|
| Throughput | 10k events/sec | 8k events/sec | < 5k events/sec |
| p95 Latency | < 100ms | < 200ms | > 500ms |
| p99 Latency | < 200ms | < 500ms | > 1s |
| Success Rate | > 99% | > 95% | < 90% |
| Consumer Lag | < 1000 | < 5000 | > 10000 |

### Expected Resource Usage
| Resource | Usage |
|----------|-------|
| CPU | 60-80% |
| Memory | 70-85% |
| Network | 100-200 Mbps |
| Disk I/O | < 50% |

## Best Practices

1. **Warm-up**: Always run 1-minute warm-up before main test
2. **Gradual Ramp**: Ramp up gradually to avoid overwhelming system
3. **Monitor**: Watch dashboards during test
4. **Baseline**: Establish baseline before optimization
5. **Iterate**: Test → Analyze → Optimize → Repeat
6. **Production-like**: Test in environment similar to production
7. **Document**: Record all configuration changes

## Advanced Testing

### Chaos Engineering
Test resilience:
```bash
# Kill random service
docker kill $(docker ps -q | shuf -n 1)

# Introduce network latency
tc qdisc add dev eth0 root netem delay 100ms

# Simulate CPU stress
stress-ng --cpu 4 --timeout 60s
```

### Soak Testing
Extended duration test:
```bash
# 24-hour sustained load
k6 run --duration 24h --vus 1000 k6/event-publishing-load-test.js
```

### Spike Testing
Sudden traffic spike:
```bash
# Immediate jump to 20k events/sec
k6 run --vus 4000 --duration 5m k6/spike-test.js
```

## Support

For issues or questions:
1. Check Grafana dashboards
2. Review application logs
3. Analyze Prometheus metrics
4. Consult performance tuning docs
