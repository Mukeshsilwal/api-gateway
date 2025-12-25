package com.ticketkatum.journeyservice.config;

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
 * Kafka configuration for event streaming
 */
@Configuration
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    /**
     * Kafka producer configuration
     */
    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        configProps.put(ProducerConfig.ACKS_CONFIG, "all");
        configProps.put(ProducerConfig.RETRIES_CONFIG, 3);
        configProps.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        configProps.put(JsonSerializer.ADD_TYPE_INFO_HEADERS, false);
        
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    /**
     * Kafka template for sending messages
     */
    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }

    /**
     * Topic: journey.created
     */
    @Bean
    public NewTopic journeyCreatedTopic() {
        return TopicBuilder.name("journey.created")
                .partitions(3)
                .replicas(1)
                .build();
    }

    /**
     * Topic: journey.updated
     */
    @Bean
    public NewTopic journeyUpdatedTopic() {
        return TopicBuilder.name("journey.updated")
                .partitions(3)
                .replicas(1)
                .build();
    }

    /**
     * Topic: journey.optimized
     */
    @Bean
    public NewTopic journeyOptimizedTopic() {
        return TopicBuilder.name("journey.optimized")
                .partitions(3)
                .replicas(1)
                .build();
    }

    /**
     * Topic: journey.segment.added
     */
    @Bean
    public NewTopic journeySegmentAddedTopic() {
        return TopicBuilder.name("journey.segment.added")
                .partitions(3)
                .replicas(1)
                .build();
    }

    /**
     * Topic: journey.suggestion.generated
     */
    @Bean
    public NewTopic journeySuggestionGeneratedTopic() {
        return TopicBuilder.name("journey.suggestion.generated")
                .partitions(3)
                .replicas(1)
                .build();
    }
}
