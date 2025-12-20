package com.ticketkatum.events.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

/**
 * Kafka configuration for event publishing.
 * Configures producers with optimal settings for reliability and performance.
 */
@Configuration
public class KafkaProducerConfig {

    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;

    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> config = new HashMap<>();
        
        // Connection settings
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        
        // Serialization
        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        
        // Reliability settings
        config.put(ProducerConfig.ACKS_CONFIG, "all"); // Wait for all replicas
        config.put(ProducerConfig.RETRIES_CONFIG, 3); // Retry failed sends
        config.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5);
        config.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true); // Prevent duplicates
        
        // Performance settings
        config.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "snappy"); // Compress messages
        config.put(ProducerConfig.BATCH_SIZE_CONFIG, 16384); // Batch size in bytes
        config.put(ProducerConfig.LINGER_MS_CONFIG, 10); // Wait 10ms to batch messages
        config.put(ProducerConfig.BUFFER_MEMORY_CONFIG, 33554432); // 32MB buffer
        
        // JSON serializer settings
        config.put(JsonSerializer.ADD_TYPE_INFO_HEADERS, false);
        
        return new DefaultKafkaProducerFactory<>(config);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }

    // Topic Definitions with partitions and replication
    
    @Bean
    public NewTopic organizerOnboardedTopic() {
        return TopicBuilder.name("events.organizer.onboarded.v1")
                .partitions(3)
                .replicas(1) // Set to 3 in production
                .build();
    }

    @Bean
    public NewTopic eventCreatedTopic() {
        return TopicBuilder.name("events.event.created.v1")
                .partitions(5)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic ticketsPublishedTopic() {
        return TopicBuilder.name("events.tickets.published.v1")
                .partitions(5)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic bookingInitiatedTopic() {
        return TopicBuilder.name("events.booking.initiated.v1")
                .partitions(10) // High volume topic
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic bookingConfirmedTopic() {
        return TopicBuilder.name("events.booking.confirmed.v1")
                .partitions(10)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic paymentAuthorizedTopic() {
        return TopicBuilder.name("events.payment.authorized.v1")
                .partitions(10)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic paymentCapturedTopic() {
        return TopicBuilder.name("events.payment.captured.v1")
                .partitions(10)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic paymentFailedTopic() {
        return TopicBuilder.name("events.payment.failed.v1")
                .partitions(5)
                .replicas(1)
                .build();
    }

    // Hotel booking topics
    @Bean
    public NewTopic hotelRoomReservedTopic() {
        return TopicBuilder.name("events.hotel.room.reserved.v1")
                .partitions(5)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic hotelBookingConfirmedTopic() {
        return TopicBuilder.name("events.hotel.booking.confirmed.v1")
                .partitions(5)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic hotelBookingCancelledTopic() {
        return TopicBuilder.name("events.hotel.booking.cancelled.v1")
                .partitions(3)
                .replicas(1)
                .build();
    }

    // Bus booking topics
    @Bean
    public NewTopic busSeatReservedTopic() {
        return TopicBuilder.name("events.bus.seat.reserved.v1")
                .partitions(5)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic busBookingConfirmedTopic() {
        return TopicBuilder.name("events.bus.booking.confirmed.v1")
                .partitions(5)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic busBookingCancelledTopic() {
        return TopicBuilder.name("events.bus.booking.cancelled.v1")
                .partitions(3)
                .replicas(1)
                .build();
    }
}
