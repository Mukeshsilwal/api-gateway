package com.ticketkatum.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Redis Cache Configuration
 * 
 * Configures multi-level caching with different TTLs for different data types.
 * Implements cache-aside pattern with automatic eviction.
 * 
 * @author Ticket Katum Team
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Object Mapper for Redis serialization
     */
    @Bean
    public ObjectMapper cacheObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        
        // Enable polymorphic type handling
        mapper.activateDefaultTyping(
            BasicPolymorphicTypeValidator.builder()
                .allowIfBaseType(Object.class)
                .build(),
            ObjectMapper.DefaultTyping.NON_FINAL,
            JsonTypeInfo.As.PROPERTY
        );
        
        return mapper;
    }

    /**
     * Default Redis Cache Configuration
     */
    @Bean
    public RedisCacheConfiguration defaultCacheConfiguration(ObjectMapper cacheObjectMapper) {
        return RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))
            .disableCachingNullValues()
            .serializeKeysWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    new StringRedisSerializer()
                )
            )
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    new GenericJackson2JsonRedisSerializer(cacheObjectMapper)
                )
            );
    }

    /**
     * Redis Cache Manager with custom configurations per cache
     */
    @Bean
    public CacheManager cacheManager(
            RedisConnectionFactory connectionFactory,
            RedisCacheConfiguration defaultCacheConfiguration) {
        
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
        
        // ========== Hotel Service Caches ==========
        
        // Hotel details - 10 minutes (frequently updated)
        cacheConfigurations.put("hotels", 
            defaultCacheConfiguration.entryTtl(Duration.ofMinutes(10)));
        
        // Hotel search results - 5 minutes (dynamic data)
        cacheConfigurations.put("hotel-search", 
            defaultCacheConfiguration.entryTtl(Duration.ofMinutes(5)));
        
        // Featured hotels - 1 hour (rarely changes)
        cacheConfigurations.put("featured-hotels", 
            defaultCacheConfiguration.entryTtl(Duration.ofHours(1)));
        
        // Hotel recommendations - 30 minutes
        cacheConfigurations.put("hotel-recommendations", 
            defaultCacheConfiguration.entryTtl(Duration.ofMinutes(30)));
        
        // City list - 24 hours (static data)
        cacheConfigurations.put("cities", 
            defaultCacheConfiguration.entryTtl(Duration.ofHours(24)));
        
        // Room availability - 2 minutes (real-time data)
        cacheConfigurations.put("room-availability", 
            defaultCacheConfiguration.entryTtl(Duration.ofMinutes(2)));
        
        // Hotel reviews - 15 minutes
        cacheConfigurations.put("hotel-reviews", 
            defaultCacheConfiguration.entryTtl(Duration.ofMinutes(15)));
        
        // ========== Booking Service Caches ==========
        
        // User bookings - 5 minutes
        cacheConfigurations.put("user-bookings", 
            defaultCacheConfiguration.entryTtl(Duration.ofMinutes(5)));
        
        // Booking details - 10 minutes
        cacheConfigurations.put("booking-details", 
            defaultCacheConfiguration.entryTtl(Duration.ofMinutes(10)));
        
        // Booking status - 1 minute (real-time)
        cacheConfigurations.put("booking-status", 
            defaultCacheConfiguration.entryTtl(Duration.ofMinutes(1)));
        
        // ========== Bus Service Caches ==========
        
        // Routes - 1 hour (rarely changes)
        cacheConfigurations.put("bus-routes", 
            defaultCacheConfiguration.entryTtl(Duration.ofHours(1)));
        
        // Schedules - 30 minutes
        cacheConfigurations.put("bus-schedules", 
            defaultCacheConfiguration.entryTtl(Duration.ofMinutes(30)));
        
        // Seat availability - 1 minute (real-time)
        cacheConfigurations.put("seat-availability", 
            defaultCacheConfiguration.entryTtl(Duration.ofMinutes(1)));
        
        // Operators - 24 hours (static)
        cacheConfigurations.put("bus-operators", 
            defaultCacheConfiguration.entryTtl(Duration.ofHours(24)));
        
        // ========== Payment Service Caches ==========
        
        // Payment methods - 1 hour
        cacheConfigurations.put("payment-methods", 
            defaultCacheConfiguration.entryTtl(Duration.ofHours(1)));
        
        // Payment status - 30 seconds (real-time)
        cacheConfigurations.put("payment-status", 
            defaultCacheConfiguration.entryTtl(Duration.ofSeconds(30)));
        
        // Transaction history - 10 minutes
        cacheConfigurations.put("transaction-history", 
            defaultCacheConfiguration.entryTtl(Duration.ofMinutes(10)));
        
        // ========== Auth Service Caches ==========
        
        // User sessions - 30 minutes
        cacheConfigurations.put("user-sessions", 
            defaultCacheConfiguration.entryTtl(Duration.ofMinutes(30)));
        
        // User profiles - 15 minutes
        cacheConfigurations.put("user-profiles", 
            defaultCacheConfiguration.entryTtl(Duration.ofMinutes(15)));
        
        // Permissions - 1 hour
        cacheConfigurations.put("user-permissions", 
            defaultCacheConfiguration.entryTtl(Duration.ofHours(1)));
        
        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(defaultCacheConfiguration)
            .withInitialCacheConfigurations(cacheConfigurations)
            .transactionAware()
            .build();
    }
}
