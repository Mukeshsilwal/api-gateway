#!/bin/bash

# Load Testing Execution Script
# Runs k6 load tests and monitors system performance

set -e

echo "========================================="
echo "Event-Driven Architecture Load Test"
echo "Target: 10,000 events/sec"
echo "========================================="

# Configuration
K6_BINARY="k6"
RESULTS_DIR="./results/$(date +%Y%m%d_%H%M%S)"
PROMETHEUS_URL="http://localhost:9090"
GRAFANA_URL="http://localhost:3000"

# Create results directory
mkdir -p "$RESULTS_DIR"

# Pre-test checks
echo "Running pre-test checks..."

# Check if services are running
check_service() {
    local service=$1
    local port=$2
    if nc -z localhost $port 2>/dev/null; then
        echo "✓ $service is running on port $port"
    else
        echo "✗ $service is NOT running on port $port"
        exit 1
    fi
}

check_service "Event Service" 8081
check_service "Booking Service" 8082
check_service "Payment Service" 8083
check_service "Kafka" 9092
check_service "Prometheus" 9090
check_service "Grafana" 3000

# Check Kafka topics
echo "Checking Kafka topics..."
kafka-topics.sh --bootstrap-server localhost:9092 --list | grep "events\." || {
    echo "✗ Event topics not found in Kafka"
    exit 1
}
echo "✓ Kafka topics configured"

# Warm-up phase
echo ""
echo "Starting warm-up phase (1 minute)..."
$K6_BINARY run \
    --vus 10 \
    --duration 1m \
    --out json="$RESULTS_DIR/warmup.json" \
    k6/event-publishing-load-test.js

echo "✓ Warm-up complete"
sleep 5

# Main load test
echo ""
echo "Starting main load test (22 minutes)..."
echo "Monitor progress at:"
echo "  - Grafana: $GRAFANA_URL"
echo "  - Prometheus: $PROMETHEUS_URL"
echo ""

# Run main test in background
$K6_BINARY run \
    --out json="$RESULTS_DIR/load-test.json" \
    --out influxdb=http://localhost:8086/k6 \
    k6/event-publishing-load-test.js &
LOAD_TEST_PID=$!

# Run consumer lag monitor in parallel
$K6_BINARY run \
    --out json="$RESULTS_DIR/consumer-lag.json" \
    k6/consumer-lag-monitor.js &
MONITOR_PID=$!

# Wait for tests to complete
wait $LOAD_TEST_PID
LOAD_TEST_EXIT=$?

wait $MONITOR_PID
MONITOR_EXIT=$?

# Post-test analysis
echo ""
echo "========================================="
echo "Load Test Complete"
echo "========================================="

if [ $LOAD_TEST_EXIT -eq 0 ]; then
    echo "✓ Load test passed"
else
    echo "✗ Load test failed with exit code $LOAD_TEST_EXIT"
fi

# Generate summary report
echo ""
echo "Generating summary report..."

# Extract key metrics from Prometheus
curl -s "$PROMETHEUS_URL/api/v1/query?query=rate(event_published_total[5m])" > "$RESULTS_DIR/publish-rate.json"
curl -s "$PROMETHEUS_URL/api/v1/query?query=kafka_consumergroup_lag" > "$RESULTS_DIR/consumer-lag-final.json"
curl -s "$PROMETHEUS_URL/api/v1/query?query=rate(event_consumed_total[5m])" > "$RESULTS_DIR/consume-rate.json"

# Parse and display summary
echo ""
echo "Test Results Summary:"
echo "---------------------"
echo "Results saved to: $RESULTS_DIR"
echo ""
echo "Key Metrics:"
jq -r '.data.result[] | "  Event Type: \(.metric.event_type) - Rate: \(.value[1]) events/sec"' "$RESULTS_DIR/publish-rate.json" 2>/dev/null || echo "  (Run analysis script for detailed metrics)"

echo ""
echo "Next Steps:"
echo "1. Review detailed results: cd $RESULTS_DIR"
echo "2. Analyze Grafana dashboards: $GRAFANA_URL"
echo "3. Check application logs for errors"
echo "4. Review JVM GC logs if performance issues detected"

# Exit with load test status
exit $LOAD_TEST_EXIT
