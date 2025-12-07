package com.ticketkatum.exception;


import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeoutException;

/**
 * Global Exception Handler
 * Handles all exceptions across the Web-BFF application
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @Value("${spring.application.name:web-bff}")
    private String serviceName;

    @Value("${logging.level.com.ticketkatum:INFO}")
    private String logLevel;

    private boolean isDevMode() {
        return "DEBUG".equalsIgnoreCase(logLevel) || "TRACE".equalsIgnoreCase(logLevel);
    }

    // ============================================================
    // CUSTOM EXCEPTIONS
    // ============================================================

    /**
     * Handle AggregationException
     */
    @ExceptionHandler(AggregationException.class)
    public ResponseEntity<ErrorResponse> handleAggregationException(
            AggregationException ex, HttpServletRequest request) {

        log.error("Aggregation error: {}", ex.getMessage(), ex);

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Aggregation Error")
                .message(ex.getMessage())
                .errorCode(ex.getErrorCode())
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .metadata(ex.getAdditionalData() != null ?
                        Map.of("additionalData", ex.getAdditionalData()) : null)
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    /**
     * Handle ServiceClientException
     */
    @ExceptionHandler(ServiceClientException.class)
    public ResponseEntity<ErrorResponse> handleServiceClientException(
            ServiceClientException ex, HttpServletRequest request) {

        log.error("Service client error from {}: {}", ex.getServiceName(), ex.getMessage(), ex);

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(ex.getHttpStatus())
                .error("Service Client Error")
                .message(ex.getMessage())
                .errorCode(ex.getErrorCode())
                .path(request.getRequestURI())
                .serviceName(ex.getServiceName())
                .build();

        return ResponseEntity.status(ex.getHttpStatus()).body(error);
    }

    /**
     * Handle ResourceNotFoundException
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex, HttpServletRequest request) {

        log.warn("Resource not found: {}", ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("Resource Not Found")
                .message(ex.getMessage())
                .errorCode("RESOURCE_NOT_FOUND")
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .metadata(Map.of(
                        "resourceType", ex.getResourceType(),
                        "resourceId", ex.getResourceId() != null ? ex.getResourceId() : "N/A"
                ))
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Handle ValidationException
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            ValidationException ex, HttpServletRequest request) {

        log.warn("Validation error: {}", ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Validation Error")
                .message(ex.getMessage())
                .errorCode("VALIDATION_ERROR")
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .validationErrors(ex.getErrors())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle BusinessException
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(
            BusinessException ex, HttpServletRequest request) {

        log.warn("Business rule violation: {}", ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNPROCESSABLE_ENTITY.value())
                .error("Business Rule Violation")
                .message(ex.getMessage())
                .errorCode(ex.getErrorCode())
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .metadata(ex.getArgs() != null ? Map.of("args", ex.getArgs()) : null)
                .build();

        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(error);
    }

    /**
     * Handle CircuitBreakerException
     */
    @ExceptionHandler({CircuitBreakerException.class, CallNotPermittedException.class})
    public ResponseEntity<ErrorResponse> handleCircuitBreakerException(
            Exception ex, HttpServletRequest request) {

        String serviceName = ex instanceof CircuitBreakerException
                ? ((CircuitBreakerException) ex).getServiceName()
                : "UNKNOWN";

        log.error("Circuit breaker open for service: {}", serviceName);

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.SERVICE_UNAVAILABLE.value())
                .error("Service Unavailable")
                .message("The requested service is temporarily unavailable. Please try again later.")
                .errorCode("CIRCUIT_BREAKER_OPEN")
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .build();

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(error);
    }

    /**
     * Handle TimeoutException
     */
    @ExceptionHandler({TimeoutException.class, java.util.concurrent.TimeoutException.class})
    public ResponseEntity<ErrorResponse> handleTimeoutException(
            Exception ex, HttpServletRequest request) {

        log.error("Operation timeout: {}", ex.getMessage());


        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.GATEWAY_TIMEOUT.value())
                .error("Request Timeout")
                .message("The operation took too long to complete. Please try again.")
                .errorCode("TIMEOUT_ERROR")
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .build();

        return ResponseEntity.status(HttpStatus.GATEWAY_TIMEOUT).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        log.warn("Validation failed: {}", ex.getMessage());

        Map<String, String> validationErrors = new HashMap<>();
        List<ErrorDetail> details = new ArrayList<>();

        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            validationErrors.put(fieldName, errorMessage);

            details.add(ErrorDetail.builder()
                    .field(fieldName)
                    .message(errorMessage)
                    .code(error.getCode())
                    .rejectedValue(((FieldError) error).getRejectedValue())
                    .build());
        });

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Validation Failed")
                .message("Request validation failed. Please check the errors.")
                .errorCode("VALIDATION_FAILED")
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .validationErrors(validationErrors)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle MissingServletRequestParameterException
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingServletRequestParameter(
            MissingServletRequestParameterException ex, HttpServletRequest request) {

        log.warn("Missing required parameter: {}", ex.getParameterName());

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Missing Parameter")
                .message(String.format("Required parameter '%s' is missing", ex.getParameterName()))
                .errorCode("MISSING_PARAMETER")
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .metadata(Map.of(
                        "parameter", ex.getParameterName(),
                        "type", ex.getParameterType()
                ))
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle MethodArgumentTypeMismatchException
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {

        log.warn("Type mismatch for parameter: {}", ex.getName());

        String message = String.format(
                "Parameter '%s' should be of type '%s' but received '%s'",
                ex.getName(),
                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown",
                ex.getValue()
        );

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Type Mismatch")
                .message(message)
                .errorCode("TYPE_MISMATCH")
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle HttpMessageNotReadableException
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex, HttpServletRequest request) {

        log.error("Malformed JSON request: {}", ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Malformed Request")
                .message("Invalid request body. Please check your JSON format.")
                .errorCode("MALFORMED_REQUEST")
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle NoHandlerFoundException
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoHandlerFoundException(
            NoHandlerFoundException ex, HttpServletRequest request) {

        log.warn("No handler found for: {} {}", ex.getHttpMethod(), ex.getRequestURL());

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("Endpoint Not Found")
                .message(String.format("No endpoint found for %s %s", ex.getHttpMethod(), ex.getRequestURL()))
                .errorCode("ENDPOINT_NOT_FOUND")
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
}

