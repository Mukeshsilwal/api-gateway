package com.ticketkatum.analytics.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketkatum.analytics.entity.DailyMetric;
import com.ticketkatum.analytics.entity.RevenueStream;
import com.ticketkatum.analytics.entity.SystemEvent;
import com.ticketkatum.analytics.repository.DailyMetricRepository;
import com.ticketkatum.analytics.repository.RevenueStreamRepository;
import com.ticketkatum.analytics.repository.SystemEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsAggregatorService {

    private final DailyMetricRepository dailyMetricRepository;
    private final RevenueStreamRepository revenueStreamRepository;
    private final SystemEventRepository systemEventRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "payment-events", groupId = "analytics-group")
    @Transactional
    public void handlePaymentEvent(String message) {
        log.debug("Received payment event: {}", message);
        try {
            JsonNode event = objectMapper.readTree(message);
            String type = event.path("eventType").asText();

            if ("PAYMENT_SUCCESS".equals(type)) {
                BigDecimal amount = new BigDecimal(event.path("amount").asText("0"));
                String serviceType = event.path("serviceType").asText("UNKNOWN");
                updateRevenueMetrics(amount, serviceType);
            }
        } catch (JsonProcessingException e) {
            log.error("Failed to parse payment event", e);
        }
    }

    @KafkaListener(topics = "booking-events", groupId = "analytics-group")
    @Transactional
    public void handleBookingEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String type = event.path("eventType").asText();

            if ("BOOKING_CREATED".equals(type)) {
                incrementDailyCounter("bookings");
            }
        } catch (Exception e) {
            log.error("Failed to parse booking event", e);
        }
    }

    @KafkaListener(topics = "auth-events", groupId = "analytics-group")
    @Transactional
    public void handleAuthEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String type = event.path("eventType").asText();

            if ("USER_REGISTERED".equals(type)) {
                incrementDailyCounter("signups");
            } else if ("LOGIN_SUCCESS".equals(type)) {
                // Tracking active users could be more complex (using HyperLogLog in Redis),
                // but for MVP we just increment a counter of logins
                incrementDailyCounter("active_users");
            }
        } catch (Exception e) {
            log.error("Failed to parse auth event", e);
        }
    }

    @KafkaListener(topics = "alert-events", groupId = "analytics-group")
    @Transactional
    public void handleAlertEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String type = event.path("eventType").asText();
            String alertType = event.path("alertType").asText();

            if ("alert.created".equals(type) && "EMERGENCY_SOS".equals(alertType)) {
                incrementDailyCounter("sos");
                logSystemEvent("SOS_TRIGGERED", "SOS Service", "CRITICAL", 
                        "SOS Alert Triggered: " + event.path("description").asText());
            }
        } catch (Exception e) {
            log.error("Failed to parse alert event", e);
        }
    }

    // --- Helper Methods ---

    private void updateRevenueMetrics(BigDecimal amount, String serviceType) {
        LocalDate today = LocalDate.now();

        // Update Daily Total
        DailyMetric daily = getOrCreateDailyMetric(today);
        daily.setTotalRevenue(daily.getTotalRevenue().add(amount));
        dailyMetricRepository.save(daily);

        // Update Revenue Stream
        RevenueStream stream = revenueStreamRepository.findByDateAndServiceType(today, serviceType)
                .orElse(RevenueStream.builder()
                        .date(today)
                        .serviceType(serviceType)
                        .amount(BigDecimal.ZERO)
                        .transactionCount(0)
                        .build());

        stream.setAmount(stream.getAmount().add(amount));
        stream.setTransactionCount(stream.getTransactionCount() + 1);
        revenueStreamRepository.save(stream);
    }

    private void incrementDailyCounter(String type) {
        LocalDate today = LocalDate.now();
        DailyMetric daily = getOrCreateDailyMetric(today);

        switch (type) {
            case "bookings" -> daily.setTotalBookings(daily.getTotalBookings() + 1);
            case "signups" -> daily.setNewSignups(daily.getNewSignups() + 1);
            case "active_users" -> daily.setActiveUsers(daily.getActiveUsers() + 1);
            case "sos" -> daily.setSosAlertsTriggered(daily.getSosAlertsTriggered() + 1);
        }
        daily.setLastUpdated(LocalDateTime.now());
        dailyMetricRepository.save(daily);
    }

    private DailyMetric getOrCreateDailyMetric(LocalDate date) {
        return dailyMetricRepository.findById(date)
                .orElse(DailyMetric.builder()
                        .date(date)
                        .lastUpdated(LocalDateTime.now())
                        .build());
    }

    private void logSystemEvent(String eventType, String source, String severity, String description) {
        systemEventRepository.save(SystemEvent.builder()
                .eventType(eventType)
                .serviceSource(source)
                .severity(severity)
                .description(description)
                .build());
    }
}
