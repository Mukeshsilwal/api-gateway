package com.ticketkatum.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.reactive.function.client.ClientResponse;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;

@Slf4j
public abstract class WebClientInvoker {

    protected <T> Mono<T> invoke(
            Mono<T> webClientCall,
            String serviceName,
            String operationName) {

        Instant start = Instant.now();
        String requestId = java.util.UUID.randomUUID().toString();

        log.debug("Invoking {} | operation={} | request_id={}",
                serviceName, operationName, requestId);

        return webClientCall
                .doOnSuccess(response -> {
                    Duration duration = Duration.between(start, Instant.now());
                    log.info("Success {} | operation={} | duration={}ms | request_id={}",
                            serviceName, operationName, duration.toMillis(), requestId);
                })
                .doOnError(error -> {
                    Duration duration = Duration.between(start, Instant.now());
                    log.error("Error {} | operation={} | duration={}ms | error={} | request_id={}",
                            serviceName, operationName, duration.toMillis(),
                            error.getMessage(), requestId);
                })
                .onErrorResume(throwable -> {
                    log.error("Service call failed | service={} | operation={} | error={}",
                            serviceName, operationName, throwable.getMessage());
                    return Mono.error(new com.ticketkatum.exception.ServiceException(
                            serviceName + " service unavailable: " + throwable.getMessage()
                    ));
                });
    }

    protected Mono<ClientResponse> handleErrorResponse(ClientResponse response, String serviceName) {
        if (response.statusCode().isError()) {
            return response.bodyToMono(String.class)
                    .flatMap(errorBody -> {
                        log.error("Error response from {} | status={} | body={}",
                                serviceName, response.statusCode(), errorBody);
                        return Mono.error(new com.ticketkatum.exception.ServiceException(
                                serviceName + " returned error: " + errorBody
                        ));
                    });
        }
        return Mono.just(response);
    }
}
