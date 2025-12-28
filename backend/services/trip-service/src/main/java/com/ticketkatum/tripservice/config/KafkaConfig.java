package com.ticketkatum.tripservice.config;

import com.ticketkatum.tripservice.event.external.BusBookingCreatedEvent;
import com.ticketkatum.tripservice.event.external.EventBookingCreatedEvent;
import com.ticketkatum.tripservice.event.external.HotelBookingCreatedEvent;
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

@EnableKafka
@Configuration
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;

    @Value("${spring.kafka.consumer.group-id:trip-service-group}")
    private String groupId;

    @Bean
    public ConsumerFactory<String, Object> consumerFactory() {
        Map<String, Object> config = new HashMap<>();

        config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        // Connection configs
        config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        // Deserializers are provided explicitly in the factory constructor, so we don't
        // put them in the config map
        // to avoid "configured with property setters, or via configuration properties;
        // not both" error.

        // Type Mappings
        Map<String, Class<?>> classMappings = new HashMap<>();
        classMappings.put("com.ticketkatum.dto.EventBookingCreatedEvent", EventBookingCreatedEvent.class);
        classMappings.put("com.ticketkatum.dto.HotelBookingCreatedEvent", HotelBookingCreatedEvent.class);
        classMappings.put("com.ticketkatum.dto.BusBookingCreatedEvent", BusBookingCreatedEvent.class);

        org.springframework.kafka.support.mapping.DefaultJackson2JavaTypeMapper typeMapper = new org.springframework.kafka.support.mapping.DefaultJackson2JavaTypeMapper();
        typeMapper.setIdClassMapping(classMappings);
        typeMapper.addTrustedPackages("*");

        JsonDeserializer<Object> jsonDeserializer = new JsonDeserializer<>();
        jsonDeserializer.setTypeMapper(typeMapper);

        return new DefaultKafkaConsumerFactory<>(config,
                new StringDeserializer(),
                new ErrorHandlingDeserializer<>(jsonDeserializer));
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL);

        // Error handling
        factory.setCommonErrorHandler(new org.springframework.kafka.listener.DefaultErrorHandler(
                (record, exception) -> {
                    System.err.println("Error processing record: " + record + ", Error: " + exception.getMessage());
                },
                new org.springframework.util.backoff.FixedBackOff(1000L, 2L)));

        return factory;
    }
}
