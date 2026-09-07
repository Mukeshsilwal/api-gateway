package com.ticketkatum.exception;

import com.ticketkatum.dto.Response;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.reactive.function.client.WebClientResponseException;

/**
 * Global exception handler for web-bff (Merged into unified GlobalExceptionHandler)
 */
// @RestControllerAdvice
@Slf4j
public class BffGlobalExceptionHandler {

        /**
         * Handle WebClient errors from downstream services
         * Detects optimistic locking conflicts from hotel-service
         */
        @ExceptionHandler(WebClientResponseException.class)
        public ResponseEntity<Response<?>> handleWebClientException(WebClientResponseException ex) {
                log.error("Downstream service error: {} - {}", ex.getStatusCode(), ex.getMessage());

                // Check if it's an optimistic locking conflict from hotel-service
                if (ex.getStatusCode() == HttpStatus.CONFLICT &&
                                ex.getMessage().contains("version")) {
                        Response<?> response = Response.builder()
                                        .statusCode(409)
                                        .message("The resource was modified by another user. Please refresh and try again.")
                                        .build();
                        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
                }

                Response<?> response = Response.builder()
                                .statusCode(ex.getStatusCode().value())
                                .message("Service temporarily unavailable: " + ex.getMessage())
                                .build();
                return ResponseEntity.status(ex.getStatusCode()).body(response);
        }

        /**
         * Handle access denied exceptions
         */
        @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
        public ResponseEntity<Response<?>> handleAccessDeniedException(
                        org.springframework.security.access.AccessDeniedException ex) {
                log.warn("Access denied: {}", ex.getMessage());

                Response<?> response = Response.builder()
                                .statusCode(403)
                                .message("Access Denied: You are not authorized to perform this action.")
                                .build();
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        /**
         * Handle generic exceptions
         */
        @ExceptionHandler(Exception.class)
        public ResponseEntity<Response<?>> handleGenericException(Exception ex) {
                log.error("Unexpected error in BFF", ex);

                Response<?> response = Response.builder()
                                .statusCode(500)
                                .message("An unexpected error occurred. Please try again later.")
                                .build();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
}
