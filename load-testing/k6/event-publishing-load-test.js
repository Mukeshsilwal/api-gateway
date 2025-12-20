import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const eventPublishRate = new Rate('event_publish_success_rate');
const eventPublishDuration = new Trend('event_publish_duration');
const eventPublishErrors = new Counter('event_publish_errors');

// Test configuration
export const options = {
    scenarios: {
        // Ramp up to 10k events/sec
        event_publishing: {
            executor: 'ramping-arrival-rate',
            startRate: 100,
            timeUnit: '1s',
            preAllocatedVUs: 500,
            maxVUs: 2000,
            stages: [
                { duration: '2m', target: 1000 },   // Ramp to 1k/sec
                { duration: '3m', target: 5000 },   // Ramp to 5k/sec
                { duration: '5m', target: 10000 },  // Ramp to 10k/sec
                { duration: '10m', target: 10000 }, // Sustain 10k/sec
                { duration: '2m', target: 0 },      // Ramp down
            ],
        },
    },
    thresholds: {
        'event_publish_success_rate': ['rate>0.99'],        // 99% success rate
        'event_publish_duration': ['p(95)<100', 'p(99)<200'], // p95<100ms, p99<200ms
        'http_req_failed': ['rate<0.01'],                   // <1% HTTP errors
        'http_req_duration': ['p(95)<500'],                 // p95<500ms
    },
};

// Test data generators
const eventTypes = [
    'events.booking.initiated.v1',
    'events.booking.confirmed.v1',
    'events.payment.authorized.v1',
    'events.payment.captured.v1',
    'events.hotel.booking.confirmed.v1',
    'events.bus.booking.confirmed.v1',
];

const customerIds = Array.from({ length: 10000 }, (_, i) => i + 1);
const eventIds = Array.from({ length: 1000 }, (_, i) => i + 1);

function generateBookingInitiatedEvent() {
    return {
        eventType: 'events.booking.initiated.v1',
        eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        correlationId: `corr-${Math.random().toString(36).substr(2, 9)}`,
        payload: {
            bookingId: `booking-${Math.random().toString(36).substr(2, 9)}`,
            eventId: eventIds[Math.floor(Math.random() * eventIds.length)],
            customerId: customerIds[Math.floor(Math.random() * customerIds.length)],
            customerEmail: `customer${Math.floor(Math.random() * 10000)}@test.com`,
            numberOfTickets: Math.floor(Math.random() * 5) + 1,
            totalAmount: (Math.random() * 500 + 50).toFixed(2),
            currency: 'USD',
            status: 'PENDING',
            reservedAt: new Date().toISOString(),
            expiryMinutes: 15,
            sessionId: `session-${Math.random().toString(36).substr(2, 9)}`,
        },
    };
}

function generatePaymentCapturedEvent() {
    return {
        eventType: 'events.payment.captured.v1',
        eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        correlationId: `corr-${Math.random().toString(36).substr(2, 9)}`,
        payload: {
            paymentId: `payment-${Math.random().toString(36).substr(2, 9)}`,
            bookingId: `booking-${Math.random().toString(36).substr(2, 9)}`,
            customerId: customerIds[Math.floor(Math.random() * customerIds.length)],
            capturedAmount: (Math.random() * 500 + 50).toFixed(2),
            currency: 'USD',
            gatewayTransactionId: `txn-${Math.random().toString(36).substr(2, 9)}`,
            gateway: 'stripe',
            capturedAt: new Date().toISOString(),
        },
    };
}

function generateHotelBookingEvent() {
    return {
        eventType: 'events.hotel.booking.confirmed.v1',
        eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        correlationId: `corr-${Math.random().toString(36).substr(2, 9)}`,
        payload: {
            bookingId: `hotel-${Math.random().toString(36).substr(2, 9)}`,
            customerId: customerIds[Math.floor(Math.random() * customerIds.length)],
            customerEmail: `customer${Math.floor(Math.random() * 10000)}@test.com`,
            hotelId: Math.floor(Math.random() * 100) + 1,
            hotelName: `Hotel ${Math.floor(Math.random() * 100)}`,
            numberOfRooms: Math.floor(Math.random() * 3) + 1,
            totalAmount: (Math.random() * 1000 + 100).toFixed(2),
            confirmedAt: new Date().toISOString(),
        },
    };
}

const eventGenerators = [
    generateBookingInitiatedEvent,
    generatePaymentCapturedEvent,
    generateHotelBookingEvent,
];

export default function () {
    // Select random event generator
    const generator = eventGenerators[Math.floor(Math.random() * eventGenerators.length)];
    const event = generator();

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'X-Correlation-ID': event.correlationId,
        },
        timeout: '5s',
    };

    // Publish event via API
    const startTime = Date.now();
    const response = http.post(
        'http://localhost:8081/api/events/publish',
        JSON.stringify(event),
        params
    );
    const duration = Date.now() - startTime;

    // Record metrics
    const success = check(response, {
        'status is 200': (r) => r.status === 200,
        'response time < 500ms': () => duration < 500,
    });

    eventPublishRate.add(success);
    eventPublishDuration.add(duration);

    if (!success) {
        eventPublishErrors.add(1);
        console.error(`Failed to publish event: ${response.status} - ${response.body}`);
    }

    // Small delay to prevent overwhelming the system during ramp-up
    sleep(0.01);
}

// Setup function - runs once before test
export function setup() {
    console.log('Starting load test...');
    console.log('Target: 10,000 events/sec');
    console.log('Duration: 22 minutes');
    return { startTime: Date.now() };
}

// Teardown function - runs once after test
export function teardown(data) {
    const duration = (Date.now() - data.startTime) / 1000;
    console.log(`Test completed in ${duration} seconds`);
}
