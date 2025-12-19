package com.ticketkatum.config;

import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.retry.RetryConfig;
import io.github.resilience4j.retry.RetryRegistry;
import io.github.resilience4j.bulkhead.BulkheadConfig;
import io.github.resilience4j.bulkhead.BulkheadRegistry;
import io.github.resilience4j.timelimiter.TimeLimiterConfig;
import io.github.resilience4j.timelimiter.TimeLimiterRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * Resilience4j Configuration
 * 
 * Configures circuit breakers, retry logic, bulkheads, and time limiters
 * for fault tolerance and graceful degradation.
 * 
 * @author Ticket Katum Team
 */
@Configuration
public class ResilienceConfig {

    /**
     * Circuit Breaker Registry with custom configurations
     */
    @Bean
    public CircuitBreakerRegistry circuitBreakerRegistry() {
        CircuitBreakerConfig defaultConfig = CircuitBreakerConfig.custom()
            .slidingWindowSize(100)
            .minimumNumberOfCalls(10)
            .permittedNumberOfCallsInHalfOpenState(5)
            .automaticTransitionFromOpenToHalfOpenEnabled(true)
            .waitDurationInOpenState(Duration.ofSeconds(10))
            .failureRateThreshold(50)
            .recordExceptions(
                org.springframework.web.client.HttpServerErrorException.class,
                java.util.concurrent.TimeoutException.class,
                java.io.IOException.class
            )
            .build();

        return CircuitBreakerRegistry.of(defaultConfig);
    }

    /**
     * Retry Registry with exponential backoff
     */
    @Bean
    public RetryRegistry retryRegistry() {
        RetryConfig defaultConfig = RetryConfig.custom()
            .maxAttempts(3)
            .waitDuration(Duration.ofMillis(500))
            .intervalFunction(io.github.resilience4j.core.IntervalFunction
                .ofExponentialBackoff(Duration.ofMillis(500), 2))
            .retryExceptions(
                org.springframework.web.client.HttpServerErrorException.class,
                java.util.concurrent.TimeoutException.class,
                java.io.IOException.class
            )
            .build();

        return RetryRegistry.of(defaultConfig);
    }

    /**
     * Bulkhead Registry for resource isolation
     */
    @Bean
    public BulkheadRegistry bulkheadRegistry() {
        BulkheadConfig defaultConfig = BulkheadConfig.custom()
            .maxConcurrentCalls(25)
            .maxWaitDuration(Duration.ZERO)
            .build();

        return BulkheadRegistry.of(defaultConfig);
    }

    /**
     * Time Limiter Registry for timeout management
     */
    @Bean
    public TimeLimiterRegistry timeLimiterRegistry() {
        TimeLimiterConfig defaultConfig = TimeLimiterConfig.custom()
            .timeoutDuration(Duration.ofSeconds(5))
            .cancelRunningFuture(true)
            .build();

        return TimeLimiterRegistry.of(defaultConfig);
    }
}
