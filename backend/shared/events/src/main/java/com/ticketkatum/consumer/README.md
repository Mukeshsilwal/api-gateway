# Event Consumer Examples

This directory contains example Kafka event consumers that can be integrated into your services.

## Available Consumers

### 1. AnalyticsEventConsumer
**Purpose**: Track all events for metrics and reporting

**Listens to**:
- `events.booking.initiated.v1`
- `events.booking.confirmed.v1`
- `events.payment.captured.v1`
- `events.payment.failed.v1`

**Metrics Tracked**:
- Booking conversion rates
- Revenue tracking
- Payment success/failure rates
- Popular events
- Customer behavior

**Usage**:
```java
// Add to any service's component scan
@SpringBootApplication
@ComponentScan(basePackages = {
    "com.ticketkatum",
    "com.ticketkatum.consumer" // Include consumer package
})
public class YourServiceApplication {
    // ...
}
```

### 2. NotificationEventConsumer
**Purpose**: Send email/SMS notifications based on events

**Listens to**:
- `events.booking.confirmed.v1` → Booking confirmation email/SMS
- `events.hotel.booking.confirmed.v1` → Hotel confirmation email
- `events.bus.booking.confirmed.v1` → Bus ticket email/SMS
- `events.payment.captured.v1` → Payment receipt email
- `events.payment.failed.v1` → Payment failure notification

**Required Services**:
- Email service (e.g., SendGrid, AWS SES)
- SMS service (e.g., Twilio, AWS SNS)

**Integration**:
```java
@Service
public class EmailService {
    public void sendBookingConfirmation(String email, String name, ...) {
        // Your email implementation
    }
}

@Service
public class SmsService {
    public void sendBookingConfirmation(String phone, String confirmationNumber) {
        // Your SMS implementation
    }
}
```

## Configuration

### 1. Add Dependency
```xml
<dependency>
    <groupId>com.ticketkatum</groupId>
    <artifactId>shared-events</artifactId>
    <version>1.0.0</version>
</dependency>
```

### 2. Enable Kafka Profile
```yaml
spring:
  profiles:
    include: kafka
```

### 3. Configure Consumer Group
```yaml
spring:
  kafka:
    consumer:
      group-id: ${spring.application.name}
```

## Error Handling

Both consumers implement:
- **Manual Acknowledgment**: Only acknowledge after successful processing
- **Retry Logic**: Failed messages are retried with exponential backoff
- **Error Logging**: All errors are logged for monitoring

## Idempotency

To ensure exactly-once processing, track processed event IDs:

```java
@Service
public class IdempotencyService {
    
    @Autowired
    private ProcessedEventRepository repository;
    
    public boolean isProcessed(String eventId) {
        return repository.existsByEventId(eventId);
    }
    
    public void markProcessed(String eventId) {
        repository.save(new ProcessedEvent(eventId, Instant.now()));
    }
}
```

Then in your consumer:
```java
if (idempotencyService.isProcessed(event.getEventId())) {
    log.info("Event already processed, skipping: {}", event.getEventId());
    acknowledgment.acknowledge();
    return;
}

// Process event...

idempotencyService.markProcessed(event.getEventId());
acknowledgment.acknowledge();
```

## Monitoring

Monitor consumer health:
- Consumer lag (messages waiting to be processed)
- Processing rate (messages/second)
- Error rate
- Acknowledgment rate

Use Spring Boot Actuator:
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
```

## Testing

Test with embedded Kafka:
```java
@SpringBootTest
@EmbeddedKafka(topics = {"events.booking.confirmed.v1"})
class NotificationEventConsumerTest {
    
    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;
    
    @Test
    void shouldSendNotificationOnBookingConfirmed() {
        // Send test event
        BookingConfirmedEvent event = createTestEvent();
        kafkaTemplate.send("events.booking.confirmed.v1", event);
        
        // Verify notification sent
        // ...
    }
}
```

## Production Considerations

1. **Scaling**: Increase concurrency for high throughput
2. **Dead Letter Queue**: Configure DLQ for failed messages
3. **Rate Limiting**: Prevent overwhelming external APIs
4. **Circuit Breakers**: Protect against downstream failures
5. **Monitoring**: Set up alerts for consumer lag
