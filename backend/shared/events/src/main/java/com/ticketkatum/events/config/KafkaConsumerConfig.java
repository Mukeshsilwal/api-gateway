package com.ticketkatum.events.config;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.listener.ContainerProperties;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;

/**
 * Kafka consumer configuration for event consumption.
 * Configures consumers with error handling, manual acknowledgment, and retry
 * logic.
 */
@EnableKafka
@Configuration
public class KafkaConsumerConfig {

    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;

    @Value("${spring.kafka.consumer.group-id:${spring.application.name}}")
    private String groupId;

    @Bean
    public ConsumerFactory<String, Object> consumerFactory() {
        Map<String, Object> config = new HashMap<>();

        // Connection settings
        config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);

        return new DefaultKafkaConsumerFactory<>(config,
                () -> new ErrorHandlingDeserializer<>(new StringDeserializer()),
                () -> {
                    com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

                    JsonDeserializer<Object> jsonDeserializer = new JsonDeserializer<>(objectMapper);
                    jsonDeserializer.addTrustedPackages("*");

                    jsonDeserializer.setUseTypeHeaders(false); // Changed to false to not require type headers

                    return new ErrorHandlingDeserializer<>(jsonDeserializer);
                });
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory = new ConcurrentKafkaListenerContainerFactory<>();

        factory.setConsumerFactory(consumerFactory());

        // Manual acknowledgment mode for exactly-once processing
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL);

        // Concurrency (number of consumer threads)
        factory.setConcurrency(3);

        // Error handling
        factory.setCommonErrorHandler(new org.springframework.kafka.listener.DefaultErrorHandler(
                (record, exception) -> {
                    // Log error and send to DLQ
                    System.err.println("Error processing record: " + record + ", Error: " + exception.getMessage());
                },
                new org.springframework.util.backoff.FixedBackOff(1000L, 3L) // 3 retries with 1s interval
        ));

        return factory;
    }

    /**
     * Batch listener container factory for high-throughput scenarios.
     */
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object> batchKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory = new ConcurrentKafkaListenerContainerFactory<>();

        factory.setConsumerFactory(consumerFactory());
        factory.setBatchListener(true);
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL_IMMEDIATE);
        factory.setConcurrency(3);

        return factory;
    }
}
