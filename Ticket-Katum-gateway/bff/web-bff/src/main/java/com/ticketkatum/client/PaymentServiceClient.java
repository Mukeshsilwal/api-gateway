package com.ticketkatum.client;

import com.ticketkatum.config.WebClientInvoker;
import com.ticketkatum.dto.*;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service

public class PaymentServiceClient extends WebClientInvoker {

    @Qualifier("paymentWebClient")
    @Autowired
    private WebClient webClient;

    private static final String SERVICE = "paymentService";

    @CircuitBreaker(name = SERVICE, fallbackMethod = "fallbackInitiate")
    @Retry(name = SERVICE)
    public Mono<GenericResponse<PaymentResponse>> initiatePayment(
            GenericRequest<InitiatePaymentRequest> request) {

        return invoke(
                webClient.post()
                        .uri("/api/payments/initiate")
                        .bodyValue(request)
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<
                                GenericResponse<PaymentResponse>>() {}),
                SERVICE,
                "initiatePayment"
        );
    }

    @CircuitBreaker(name = SERVICE, fallbackMethod = "fallbackGetPayment")
    @Cacheable(value = "payments", key = "#paymentId")
    public Mono<GenericResponse<PaymentResponse>> getPayment(String paymentId) {

        log.debug("Fetching payment | payment_id={}", paymentId);

        return invoke(
                webClient.get()
                        .uri("/api/payments/{id}", paymentId)
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<
                                GenericResponse<PaymentResponse>>() {}),
                SERVICE,
                "getPayment"
        );
    }

    @CircuitBreaker(name = SERVICE, fallbackMethod = "fallbackUserPayments")
    public Mono<List<PaymentResponse>> getUserPayments(
            String userId, Integer page, Integer limit) {

        log.debug("Fetching user payments | user_id={}", userId);

        return invoke(
                webClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/api/payments/user/{userId}")
                                .queryParam("page", page)
                                .queryParam("limit", limit)
                                .build(userId))
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<
                                GenericResponse<List<PaymentResponse>>>() {}),
                SERVICE,
                "getUserPayments"
        ).map(response -> response.isSuccess() && response.getData() != null ?
                response.getData() : Collections.emptyList());
    }

    @CircuitBreaker(name = SERVICE, fallbackMethod = "fallbackGetByBooking")
    public Mono<GenericResponse<PaymentResponse>> getPaymentByBookingId(String bookingId) {

        log.debug("Fetching payment by booking | booking_id={}", bookingId);

        return invoke(
                webClient.get()
                        .uri("/api/payments/booking/{bookingId}", bookingId)
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<
                                GenericResponse<PaymentResponse>>() {}),
                SERVICE,
                "getPaymentByBookingId"
        );
    }

    @CircuitBreaker(name = SERVICE, fallbackMethod = "fallbackRefund")
    @Retry(name = SERVICE)
    public Mono<GenericResponse<PaymentResponse>> refundPayment(
            String paymentId, GenericRequest<RefundRequest> request) {

        log.info("Initiating refund | payment_id={}", paymentId);

        return invoke(
                webClient.post()
                        .uri("/api/payments/{id}/refund", paymentId)
                        .bodyValue(request)
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<
                                GenericResponse<PaymentResponse>>() {}),
                SERVICE,
                "refundPayment"
        );
    }

    // Fallback methods
    private Mono<GenericResponse<PaymentResponse>> fallbackInitiate(
            GenericRequest<InitiatePaymentRequest> req, Throwable ex) {

        log.error("Payment initiation fallback | error={}", ex.getMessage());

        return Mono.just(GenericResponse.failure(
                "Payment service unavailable. Please try again later.",
                req.getRequestId()
        ));
    }

    private Mono<GenericResponse<PaymentResponse>> fallbackGetPayment(
            String paymentId, Throwable ex) {

        log.error("Get payment fallback | payment_id={} | error={}",
                paymentId, ex.getMessage());

        return Mono.just(GenericResponse.failure(
                "Unable to fetch payment details",
                UUID.randomUUID().toString()
        ));
    }

    private Mono<List<PaymentResponse>> fallbackUserPayments(
            String userId, Integer page, Integer limit, Throwable ex) {

        log.error("User payments fallback | user_id={} | error={}",
                userId, ex.getMessage());

        return Mono.just(Collections.emptyList());
    }

    private Mono<GenericResponse<PaymentResponse>> fallbackGetByBooking(
            String bookingId, Throwable ex) {

        log.error("Get payment by booking fallback | booking_id={} | error={}",
                bookingId, ex.getMessage());

        return Mono.just(GenericResponse.failure(
                "Payment details unavailable",
                UUID.randomUUID().toString()
        ));
    }

    private Mono<GenericResponse<PaymentResponse>> fallbackRefund(
            String paymentId, GenericRequest<RefundRequest> req, Throwable ex) {

        log.error("Refund fallback | payment_id={} | error={}",
                paymentId, ex.getMessage());

        return Mono.just(GenericResponse.failure(
                "Unable to process refund. Please contact support.",
                req.getRequestId()
        ));
    }
}