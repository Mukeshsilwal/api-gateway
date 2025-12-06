package com.ticketkatum.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Slf4j
@Configuration
public class WebClientConfig {

    @Value("${services.booking.url}")
    private String bookingServiceUrl;

    @Value("${services.payment.url}")
    private String paymentServiceUrl;

    @Value("${services.hotel.url}")
    private String hotelServiceUrl;

    @Value("${services.movies.url}")
    private String moviesServiceUrl;

    @Value("${webclient.connection-timeout:5000}")
    private int connectionTimeout;

    @Value("${webclient.read-timeout:30000}")
    private int readTimeout;

    @Value("${webclient.write-timeout:30000}")
    private int writeTimeout;

    @Value("${webclient.max-connections:500}")
    private int maxConnections;

    @Value("${webclient.pending-acquire-timeout:45000}")
    private int pendingAcquireTimeout;

    // Connection provider for connection pooling
    @Bean
    public ConnectionProvider connectionProvider() {
        return ConnectionProvider.builder("custom")
                .maxConnections(maxConnections)
                .maxIdleTime(Duration.ofSeconds(20))
                .maxLifeTime(Duration.ofSeconds(60))
                .pendingAcquireTimeout(Duration.ofMillis(pendingAcquireTimeout))
                .evictInBackground(Duration.ofSeconds(120))
                .build();
    }

    // Base HTTP client with timeouts
    @Bean
    public HttpClient httpClient(ConnectionProvider connectionProvider) {
        return HttpClient.create(connectionProvider)
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, connectionTimeout)
                .doOnConnected(conn ->
                        conn.addHandlerLast(new ReadTimeoutHandler(readTimeout, TimeUnit.MILLISECONDS))
                                .addHandlerLast(new WriteTimeoutHandler(writeTimeout, TimeUnit.MILLISECONDS)))
                .responseTimeout(Duration.ofMillis(readTimeout))
                .compress(true);
    }

    // Booking Service WebClient
    @Bean
    @Qualifier("bookingWebClient")
    public WebClient bookingWebClient(HttpClient httpClient) {
        return buildWebClient(httpClient, bookingServiceUrl, "Booking");
    }

    // Payment Service WebClient
    @Bean
    @Qualifier("paymentWebClient")
    public WebClient paymentWebClient(HttpClient httpClient) {
        return buildWebClient(httpClient, paymentServiceUrl, "Payment");
    }

    // Hotel Service WebClient
    @Bean
    @Qualifier("hotelWebClient")
    public WebClient hotelWebClient(HttpClient httpClient) {
        return buildWebClient(httpClient, hotelServiceUrl, "Hotel");
    }

    // Movies Service WebClient
    @Bean
    @Qualifier("moviesWebClient")
    public WebClient moviesWebClient(HttpClient httpClient) {
        return buildWebClient(httpClient, moviesServiceUrl, "Movies");
    }

    // Helper method to build WebClient with common configuration
    private WebClient buildWebClient(HttpClient httpClient, String baseUrl, String serviceName) {
        return WebClient.builder()
                .baseUrl(baseUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("X-Service-Name", "web-bff")
                .filter(logRequest(serviceName))
                .filter(logResponse(serviceName))
                .filter(errorHandlerFilter(serviceName))
                .build();
    }

    // Request logging filter
    private ExchangeFilterFunction logRequest(String serviceName) {
        return ExchangeFilterFunction.ofRequestProcessor(clientRequest -> {
            log.debug("Request to {}: {} {}",
                    serviceName,
                    clientRequest.method(),
                    clientRequest.url());
            clientRequest.headers()
                    .forEach((name, values) -> values.forEach(value ->
                            log.trace("Header {}: {}", name, value)));
            return Mono.just(clientRequest);
        });
    }

    // Response logging filter
    private ExchangeFilterFunction logResponse(String serviceName) {
        return ExchangeFilterFunction.ofResponseProcessor(clientResponse -> {
            log.debug("Response from {}: Status {}",
                    serviceName,
                    clientResponse.statusCode());
            return Mono.just(clientResponse);
        });
    }

    // Error handling filter
    private ExchangeFilterFunction errorHandlerFilter(String serviceName) {
        return ExchangeFilterFunction.ofResponseProcessor(clientResponse -> {
            if (clientResponse.statusCode().isError()) {
                return clientResponse.bodyToMono(String.class)
                        .flatMap(errorBody -> {
                            log.error("Error from {} service: {} - {}",
                                    serviceName,
                                    clientResponse.statusCode(),
                                    errorBody);
                            return Mono.just(clientResponse);
                        });
            }
            return Mono.just(clientResponse);
        });
    }
}