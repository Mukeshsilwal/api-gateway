package com.ticketkatum.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CachingConfigurerSupport;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
@EnableRedisRepositories(basePackages = "com.ticketkatum.repository")
public class CacheConfig extends CachingConfigurerSupport {

    @Bean
    @Primary
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        ObjectMapper objectMapper = new ObjectMapper();

        // Register Java 8 time module for LocalDateTime
        objectMapper.registerModule(new JavaTimeModule());

        // Serialize dates as ISO-8601 strings instead of timestamps
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // Enable default typing for polymorphic objects
        objectMapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );

        // Serializer for Redis values
        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(objectMapper);

        // Default cache configuration
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(serializer))
                .disableCachingNullValues();

        // Cache-specific configurations
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
        
        // Monolith base caches
        cacheConfigurations.put("movies", defaultConfig.entryTtl(Duration.ofHours(1)));
        cacheConfigurations.put("hotels", defaultConfig.entryTtl(Duration.ofMinutes(30)));
        cacheConfigurations.put("bookings", defaultConfig.entryTtl(Duration.ofMinutes(5)));
        cacheConfigurations.put("user-profile", defaultConfig.entryTtl(Duration.ofMinutes(15)));

        // Auth Module Caches (Merged)
        cacheConfigurations.put("users", defaultConfig.entryTtl(Duration.ofMinutes(15)));
        cacheConfigurations.put("user-sessions", defaultConfig.entryTtl(Duration.ofMinutes(30)));
        cacheConfigurations.put("refresh-tokens", defaultConfig.entryTtl(Duration.ofHours(1)));
        cacheConfigurations.put("user-permissions", defaultConfig.entryTtl(Duration.ofMinutes(30)));
        cacheConfigurations.put("otp-codes", defaultConfig.entryTtl(Duration.ofMinutes(5)));
        
        // Travel Module Caches (Merged)
        // Hotels
        cacheConfigurations.put("hotel-search", defaultConfig.entryTtl(Duration.ofMinutes(5)));
        cacheConfigurations.put("featured-hotels", defaultConfig.entryTtl(Duration.ofHours(1)));
        cacheConfigurations.put("hotel-recommendations", defaultConfig.entryTtl(Duration.ofMinutes(30)));
        cacheConfigurations.put("cities", defaultConfig.entryTtl(Duration.ofHours(24)));
        cacheConfigurations.put("room-availability", defaultConfig.entryTtl(Duration.ofMinutes(2)));
        cacheConfigurations.put("hotel-reviews", defaultConfig.entryTtl(Duration.ofMinutes(15)));
        cacheConfigurations.put("nearbyHotels", defaultConfig.entryTtl(Duration.ofMinutes(30)));
        cacheConfigurations.put("hotelDetails", defaultConfig.entryTtl(Duration.ofHours(24)));

        // Buses
        cacheConfigurations.put("buses", defaultConfig.entryTtl(Duration.ofMinutes(15)));
        cacheConfigurations.put("routes", defaultConfig.entryTtl(Duration.ofMinutes(30)));
        cacheConfigurations.put("schedules", defaultConfig.entryTtl(Duration.ofMinutes(10)));
        cacheConfigurations.put("seat-availability", defaultConfig.entryTtl(Duration.ofMinutes(1)));
        cacheConfigurations.put("tickets", defaultConfig.entryTtl(Duration.ofMinutes(5)));
        cacheConfigurations.put("bus-stops", defaultConfig.entryTtl(Duration.ofHours(1)));

        // Bookings
        cacheConfigurations.put("user-bookings", defaultConfig.entryTtl(Duration.ofMinutes(5)));
        cacheConfigurations.put("booking-availability", defaultConfig.entryTtl(Duration.ofMinutes(2)));
        cacheConfigurations.put("booking-history", defaultConfig.entryTtl(Duration.ofMinutes(15)));
        cacheConfigurations.put("active-bookings", defaultConfig.entryTtl(Duration.ofMinutes(5)));

        // Payment Caches (Merged)
        cacheConfigurations.put("payment-transactions", defaultConfig.entryTtl(Duration.ofMinutes(30)));
        cacheConfigurations.put("payment-status", defaultConfig.entryTtl(Duration.ofMinutes(5)));
        cacheConfigurations.put("payment-providers", defaultConfig.entryTtl(Duration.ofHours(1)));
        cacheConfigurations.put("payment-history", defaultConfig.entryTtl(Duration.ofMinutes(15)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigurations)
                .build();
    }
}
