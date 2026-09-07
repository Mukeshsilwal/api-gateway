package com.ticketkatum.exception;

import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;

/**
 * Unified Global Exception Handler
 * Intercepts and translates all domain, security, validation, and system exceptions
 * into standardized ErrorResponse payloads with actionable messages and proper HTTP status codes.
 */
@Slf4j
@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice
public class GlobalExceptionHandler {

    @Value("${spring.application.name:ticketkatum-monolith}")
    private String serviceName;

    // ============================================================
    // AUTHENTICATION & SECURITY EXCEPTIONS
    // ============================================================

    @ExceptionHandler({
            InvalidCredentialsException.class,
            BadCredentialsException.class,
            AuthenticationException.class,
            TokenExpiredException.class
    })
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
            Exception ex, HttpServletRequest request) {
        log.warn("Authentication failed for [{}]: {}", request.getRequestURI(), ex.getMessage());

        String message = ex instanceof BadCredentialsException
                ? "Invalid username or password"
                : ex.getMessage();

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .error("Unauthorized")
                .message(message)
                .errorCode("AUTHENTICATION_FAILED")
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(
            AccessDeniedException ex, HttpServletRequest request) {
        log.warn("Access denied for [{}]: {}", request.getRequestURI(), ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.FORBIDDEN.value())
                .error("Forbidden")
                .message("Access denied: You do not have permission to perform this action.")
                .errorCode("ACCESS_DENIED")
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .build();

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    // ============================================================
    // NOT FOUND EXCEPTIONS (404)
    // ============================================================

    @ExceptionHandler({
            ResourceNotFoundException.class,
            UserNotFoundException.class,
            BookingNotFoundException.class,
            HotelNotFoundException.class,
            RoomNotFoundException.class,
            BusNotFoundException.class,
            RouteNotFoundException.class,
            PaymentNotFoundException.class
    })
    public ResponseEntity<ErrorResponse> handleNotFoundExceptions(
            RuntimeException ex, HttpServletRequest request) {
        log.warn("Resource not found at [{}]: {}", request.getRequestURI(), ex.getMessage());

        String errorCode = "RESOURCE_NOT_FOUND";
        if (ex instanceof UserNotFoundException) errorCode = "USER_NOT_FOUND";
        else if (ex instanceof BookingNotFoundException) errorCode = "BOOKING_NOT_FOUND";
        else if (ex instanceof HotelNotFoundException) errorCode = "HOTEL_NOT_FOUND";
        else if (ex instanceof RoomNotFoundException) errorCode = "ROOM_NOT_FOUND";
        else if (ex instanceof BusNotFoundException) errorCode = "BUS_NOT_FOUND";
        else if (ex instanceof RouteNotFoundException) errorCode = "ROUTE_NOT_FOUND";
        else if (ex instanceof PaymentNotFoundException) errorCode = "PAYMENT_NOT_FOUND";

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("Not Found")
                .message(ex.getMessage())
                .errorCode(errorCode)
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    // ============================================================
    // CONFLICT & DUPLICATE EXCEPTIONS (409)
    // ============================================================

    @ExceptionHandler({
            UserAlreadyExistsException.class,
            BookingAlreadyExistsException.class,
            HotelAlreadyExistsException.class,
            RoomAlreadyExistsException.class,
            SeatNotAvailableException.class,
            DuplicateResourceException.class
    })
    public ResponseEntity<ErrorResponse> handleConflictExceptions(
            RuntimeException ex, HttpServletRequest request) {
        log.warn("Conflict at [{}]: {}", request.getRequestURI(), ex.getMessage());

        String errorCode = "RESOURCE_CONFLICT";
        if (ex instanceof UserAlreadyExistsException) errorCode = "USER_ALREADY_EXISTS";
        else if (ex instanceof BookingAlreadyExistsException) errorCode = "BOOKING_ALREADY_EXISTS";
        else if (ex instanceof SeatNotAvailableException) errorCode = "SEAT_NOT_AVAILABLE";
        else if (ex instanceof HotelAlreadyExistsException) errorCode = "HOTEL_ALREADY_EXISTS";
        else if (ex instanceof RoomAlreadyExistsException) errorCode = "ROOM_ALREADY_EXISTS";

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value())
                .error("Conflict")
                .message(ex.getMessage())
                .errorCode(errorCode)
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, HttpServletRequest request) {
        log.warn("Database constraint violation at [{}]: {}", request.getRequestURI(), ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value())
                .error("Database Conflict")
                .message("A database constraint violation occurred (e.g. duplicate key or foreign key violation).")
                .errorCode("DATA_INTEGRITY_VIOLATION")
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    // ============================================================
    // GONE / EXPIRED (410)
    // ============================================================

    @ExceptionHandler(BookingExpiredException.class)
    public ResponseEntity<ErrorResponse> handleBookingExpired(
            BookingExpiredException ex, HttpServletRequest request) {
        log.warn("Booking expired at [{}]: {}", request.getRequestURI(), ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.GONE.value())
                .error("Gone")
                .message(ex.getMessage())
                .errorCode("BOOKING_EXPIRED")
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .build();

        return ResponseEntity.status(HttpStatus.GONE).body(error);
    }

    // ============================================================
    // VALIDATION & BAD REQUEST EXCEPTIONS (400)
    // ============================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        log.warn("Validation failed at [{}]: {}", request.getRequestURI(), ex.getMessage());

        Map<String, String> validationErrors = new HashMap<>();
        List<ErrorDetail> details = new ArrayList<>();

        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = error instanceof FieldError ? ((FieldError) error).getField() : error.getObjectName();
            String errorMessage = error.getDefaultMessage();
            validationErrors.put(fieldName, errorMessage);

            details.add(ErrorDetail.builder()
                    .field(fieldName)
                    .message(errorMessage)
                    .code(error.getCode())
                    .rejectedValue(error instanceof FieldError ? ((FieldError) error).getRejectedValue() : null)
                    .build());
        });

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Validation Failed")
                .message("Request validation failed. Please check field errors.")
                .errorCode("VALIDATION_FAILED")
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .validationErrors(validationErrors)
                .details(details)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex, HttpServletRequest request) {
        log.warn("Constraint violation at [{}]: {}", request.getRequestURI(), ex.getMessage());

        Map<String, String> validationErrors = new HashMap<>();
        ex.getConstraintViolations().forEach(violation -> {
            String property = violation.getPropertyPath().toString();
            validationErrors.put(property, violation.getMessage());
        });

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Constraint Violation")
                .message("Validation constraints were not met.")
                .errorCode("CONSTRAINT_VIOLATION")
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .validationErrors(validationErrors)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler({
            ValidationException.class,
            BadRequestException.class,
            InvalidBookingDataException.class,
            InvalidHotelDataException.class,
            InvalidRoomDataException.class,
            InvalidTicketException.class,
            InvalidPaymentProviderException.class,
            IllegalArgumentException.class,
            IllegalStateException.class
    })
    public ResponseEntity<ErrorResponse> handleBadRequestExceptions(
            RuntimeException ex, HttpServletRequest request) {
        log.warn("Bad request at [{}]: {}", request.getRequestURI(), ex.getMessage());

        Map<String, String> errors = ex instanceof ValidationException
                ? ((ValidationException) ex).getErrors()
                : null;

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message(ex.getMessage())
                .errorCode("BAD_REQUEST")
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .validationErrors(errors)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

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
                .metadata(Map.of("parameter", ex.getParameterName(), "type", ex.getParameterType()))
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

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

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex, HttpServletRequest request) {
        log.error("Malformed JSON request at [{}]: {}", request.getRequestURI(), ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Malformed Request")
                .message("Invalid JSON request body format.")
                .errorCode("MALFORMED_REQUEST")
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // ============================================================
    // BUSINESS & UNPROCESSABLE ENTITY EXCEPTIONS (422)
    // ============================================================

    @ExceptionHandler({
            BusinessException.class,
            PaymentProcessingException.class,
            CompositeBookingException.class
    })
    public ResponseEntity<ErrorResponse> handleBusinessException(
            RuntimeException ex, HttpServletRequest request) {
        log.warn("Business rule violation at [{}]: {}", request.getRequestURI(), ex.getMessage());

        String errorCode = ex instanceof BusinessException ? ((BusinessException) ex).getErrorCode() : "UNPROCESSABLE_ENTITY";

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNPROCESSABLE_ENTITY.value())
                .error("Unprocessable Entity")
                .message(ex.getMessage())
                .errorCode(errorCode)
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .build();

        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(error);
    }

    // ============================================================
    // RESILIENCE, CIRCUIT BREAKER & TIMEOUT (503 / 504)
    // ============================================================

    @ExceptionHandler({CircuitBreakerException.class, CallNotPermittedException.class})
    public ResponseEntity<ErrorResponse> handleCircuitBreakerException(
            Exception ex, HttpServletRequest request) {
        String fromService = ex instanceof CircuitBreakerException
                ? ((CircuitBreakerException) ex).getServiceName()
                : "SERVICE";

        log.error("Circuit breaker active for {}: {}", fromService, ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.SERVICE_UNAVAILABLE.value())
                .error("Service Unavailable")
                .message("The requested service is temporarily unavailable. Please try again later.")
                .errorCode("CIRCUIT_BREAKER_OPEN")
                .path(request.getRequestURI())
                .serviceName(fromService)
                .build();

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(error);
    }

    @ExceptionHandler({TimeoutException.class, java.util.concurrent.TimeoutException.class})
    public ResponseEntity<ErrorResponse> handleTimeoutException(
            Exception ex, HttpServletRequest request) {
        log.error("Operation timeout at [{}]: {}", request.getRequestURI(), ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.GATEWAY_TIMEOUT.value())
                .error("Gateway Timeout")
                .message("The operation timed out. Please try again.")
                .errorCode("TIMEOUT_ERROR")
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .build();

        return ResponseEntity.status(HttpStatus.GATEWAY_TIMEOUT).body(error);
    }

    // ============================================================
    // HTTP CLIENT / WEBCLIENT / STATUS EXCEPTIONS
    // ============================================================

    @ExceptionHandler(WebClientResponseException.class)
    public ResponseEntity<ErrorResponse> handleWebClientResponseException(
            WebClientResponseException ex, HttpServletRequest request) {
        log.error("Downstream HTTP error [{}] at [{}]: {}", ex.getStatusCode(), request.getRequestURI(), ex.getMessage());

        HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
        if (status == null) status = HttpStatus.INTERNAL_SERVER_ERROR;

        String message = status == HttpStatus.CONFLICT && ex.getMessage().contains("version")
                ? "The resource was modified by another transaction. Please refresh and try again."
                : "Downstream service error: " + ex.getStatusText();

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .errorCode("DOWNSTREAM_SERVICE_ERROR")
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .build();

        return ResponseEntity.status(status).body(error);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatusException(
            ResponseStatusException ex, HttpServletRequest request) {
        log.warn("Response status exception at [{}]: {}", request.getRequestURI(), ex.getReason());

        HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
        if (status == null) status = HttpStatus.INTERNAL_SERVER_ERROR;

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(ex.getReason() != null ? ex.getReason() : ex.getMessage())
                .errorCode("HTTP_" + status.value())
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .build();

        return ResponseEntity.status(status).body(error);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
        log.warn("HTTP method not supported: {} for {}", ex.getMethod(), request.getRequestURI());

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.METHOD_NOT_ALLOWED.value())
                .error("Method Not Allowed")
                .message(String.format("HTTP method '%s' is not supported for this endpoint.", ex.getMethod()))
                .errorCode("METHOD_NOT_ALLOWED")
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .build();

        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(error);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMediaTypeNotSupported(
            HttpMediaTypeNotSupportedException ex, HttpServletRequest request) {
        log.warn("Media type not supported at [{}]: {}", request.getRequestURI(), ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNSUPPORTED_MEDIA_TYPE.value())
                .error("Unsupported Media Type")
                .message("The requested content type is not supported.")
                .errorCode("UNSUPPORTED_MEDIA_TYPE")
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .build();

        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(error);
    }

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

    // ============================================================
    // ASYNC COMPLETION EXCEPTIONS (Unwrap & Delegate)
    // ============================================================

    @ExceptionHandler({CompletionException.class, ExecutionException.class})
    public ResponseEntity<ErrorResponse> handleAsyncCompletionException(
            Exception ex, HttpServletRequest request) {
        Throwable cause = ex.getCause() != null ? ex.getCause() : ex;
        if (cause instanceof RuntimeException) {
            // Re-handle through specific exceptions if possible
            if (cause instanceof ResourceNotFoundException) return handleNotFoundExceptions((RuntimeException) cause, request);
            if (cause instanceof BusinessException) return handleBusinessException((RuntimeException) cause, request);
            if (cause instanceof ValidationException) return handleBadRequestExceptions((RuntimeException) cause, request);
        }

        log.error("Async execution failure at [{}]: {}", request.getRequestURI(), cause.getMessage(), cause);

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .message(cause.getMessage() != null ? cause.getMessage() : "Async operation failed.")
                .errorCode("ASYNC_OPERATION_FAILED")
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    // ============================================================
    // GLOBAL FALLBACK (500)
    // ============================================================

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception at [{}] {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage(), ex);

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .message("An unexpected error occurred. Please contact support or try again later.")
                .errorCode("INTERNAL_SERVER_ERROR")
                .path(request.getRequestURI())
                .serviceName(serviceName)
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}

