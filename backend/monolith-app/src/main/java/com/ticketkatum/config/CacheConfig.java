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
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
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

    @Bean(name = "customRedisTemplate")
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        objectMapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );

        GenericJackson2JsonRedisSerializer jackson2JsonRedisSerializer = new GenericJackson2JsonRedisSerializer(objectMapper);

        template.setValueSerializer(jackson2JsonRedisSerializer);
        template.setHashValueSerializer(jackson2JsonRedisSerializer);

        template.afterPropertiesSet();
        return template;
    }

    @Bean
    @Primary
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        objectMapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );

        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(objectMapper);

        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(serializer))
                .disableCachingNullValues();

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
        cacheConfigurations.put("hotel-search", defaultConfig.entryTtl(Duration.ofMinutes(5)));
        cacheConfigurations.put("featured-hotels", defaultConfig.entryTtl(Duration.ofHours(1)));
        cacheConfigurations.put("hotel-recommendations", defaultConfig.entryTtl(Duration.ofMinutes(30)));
        cacheConfigurations.put("cities", defaultConfig.entryTtl(Duration.ofHours(24)));
        cacheConfigurations.put("room-availability", defaultConfig.entryTtl(Duration.ofMinutes(2)));
        cacheConfigurations.put("hotel-reviews", defaultConfig.entryTtl(Duration.ofMinutes(15)));
        cacheConfigurations.put("nearbyHotels", defaultConfig.entryTtl(Duration.ofMinutes(30)));
        cacheConfigurations.put("hotelDetails", defaultConfig.entryTtl(Duration.ofHours(24)));

        cacheConfigurations.put("buses", defaultConfig.entryTtl(Duration.ofMinutes(15)));
        cacheConfigurations.put("routes", defaultConfig.entryTtl(Duration.ofMinutes(30)));
        cacheConfigurations.put("schedules", defaultConfig.entryTtl(Duration.ofMinutes(10)));
        cacheConfigurations.put("seat-availability", defaultConfig.entryTtl(Duration.ofMinutes(1)));
        cacheConfigurations.put("tickets", defaultConfig.entryTtl(Duration.ofMinutes(5)));
        cacheConfigurations.put("bus-stops", defaultConfig.entryTtl(Duration.ofHours(1)));

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

    // Consolidated Pub/Sub Topics
    @Bean
    public ChannelTopic bookingUpdatesTopic() {
        return new ChannelTopic("booking-updates");
    }

    @Bean
    public ChannelTopic paymentStatusTopic() {
        return new ChannelTopic("payment-status");
    }

    @Bean
    public ChannelTopic bookingNotificationsTopic() {
        return new ChannelTopic("booking-notifications");
    }

    @Bean
    public ChannelTopic ticketUpdatesTopic() {
        return new ChannelTopic("ticket_updates");
    }
}
