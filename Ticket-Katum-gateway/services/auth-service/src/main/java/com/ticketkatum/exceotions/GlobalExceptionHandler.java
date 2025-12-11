package com.ticketkatum.exceotions;

import com.ticketkatum.model.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Global Exception Handler
 * SECURITY PRINCIPLES:
 * 1. Never expose stack traces to clients
 * 2. Never expose internal system details
 * 3. Log detailed errors internally only
 * 4. Return user-friendly error messages
 * 5. Include correlation IDs for tracing
 * 6. Sanitize all error messages
 * 7. Use appropriate HTTP status codes
 */
@Slf4j
public class GlobalExceptionHandler {

    @Value("${app.debug-mode:false}")
    private boolean debugMode;

    private static final String INTERNAL_ERROR_MESSAGE =
            "An unexpected error occurred. Please contact support with the correlation ID.";

    /**
     * Handle custom application exceptions
     */
    @ExceptionHandler(ApplicationException.class)
    public ResponseEntity<ErrorResponse> handleApplicationException(
            ApplicationException ex, HttpServletRequest request) {

        String correlationId = getCorrelationId();

        log.error("[{}] Application error: {} - {}",
                correlationId, ex.getErrorCode(), ex.getMessage(), ex);

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(sanitizeMessage(ex.getMessage()))
                .errorCode(ex.getErrorCode())
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .correlationId(correlationId)
                .debugInfo(debugMode ? ex.getClass().getSimpleName() : null)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle resource not found exceptions
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex, HttpServletRequest request) {

        String correlationId = getCorrelationId();

        log.warn("[{}] Resource not found: {}", correlationId, ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.NOT_FOUND.value())
                .error(HttpStatus.NOT_FOUND.getReasonPhrase())
                .message(sanitizeMessage(ex.getMessage()))
                .errorCode(ex.getErrorCode())
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .correlationId(correlationId)
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Handle bad request exceptions
     */
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequestException(
            BadRequestException ex, HttpServletRequest request) {

        String correlationId = getCorrelationId();

        log.warn("[{}] Bad request: {}", correlationId, ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(sanitizeMessage(ex.getMessage()))
                .errorCode(ex.getErrorCode())
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .correlationId(correlationId)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle validation exceptions
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            ValidationException ex, HttpServletRequest request) {

        String correlationId = getCorrelationId();

        log.warn("[{}] Validation error: {}", correlationId, ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Validation Failed")
                .message("Input validation failed")
                .errorCode(ex.getErrorCode())
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .correlationId(correlationId)
                .fieldErrors(ex.getFieldErrors())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle Spring validation errors
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        String correlationId = getCorrelationId();

        log.warn("[{}] Validation error: {}", correlationId, ex.getMessage());

        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.put(error.getField(), sanitizeMessage(error.getDefaultMessage()))
        );

        List<String> globalErrors = ex.getBindingResult().getGlobalErrors()
                .stream()
                .map(error -> sanitizeMessage(error.getDefaultMessage()))
                .collect(Collectors.toList());

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Validation Failed")
                .message("Input validation failed")
                .errorCode("VALIDATION_ERROR")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .correlationId(correlationId)
                .fieldErrors(fieldErrors)
                .globalErrors(globalErrors.isEmpty() ? null : globalErrors)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle bind exceptions
     */
    @ExceptionHandler(BindException.class)
    public ResponseEntity<ErrorResponse> handleBindException(
            BindException ex, HttpServletRequest request) {

        String correlationId = getCorrelationId();

        log.warn("[{}] Binding error: {}", correlationId, ex.getMessage());

        Map<String, String> fieldErrors = new HashMap<>();
        ex.getFieldErrors().forEach(error ->
                fieldErrors.put(error.getField(), sanitizeMessage(error.getDefaultMessage()))
        );

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Binding Failed")
                .message("Request parameter binding failed")
                .errorCode("BINDING_ERROR")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .correlationId(correlationId)
                .fieldErrors(fieldErrors)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle authentication exceptions
     * SECURITY: Don't reveal whether username or password was incorrect
     */
    @ExceptionHandler({AuthenticationException.class, BadCredentialsException.class})
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
            Exception ex, HttpServletRequest request) {

        String correlationId = getCorrelationId();

        log.warn("[{}] Authentication failed from IP: {}",
                correlationId, getClientIP(request));

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.UNAUTHORIZED.value())
                .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
                .message("Invalid credentials") // Generic message for security
                .errorCode("AUTHENTICATION_FAILED")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .correlationId(correlationId)
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    /**
     * Handle unauthorized access
     */
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedException(
            UnauthorizedException ex, HttpServletRequest request) {

        String correlationId = getCorrelationId();

        log.warn("[{}] Unauthorized access attempt: {}", correlationId, ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.UNAUTHORIZED.value())
                .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
                .message("Authentication required")
                .errorCode(ex.getErrorCode())
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .correlationId(correlationId)
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    /**
     * Handle access denied (forbidden)
     * SECURITY: Don't reveal resource existence
     */
    @ExceptionHandler({AccessDeniedException.class, ForbiddenException.class})
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(
            Exception ex, HttpServletRequest request) {

        String correlationId = getCorrelationId();

        log.warn("[{}] Access denied for user from IP: {}",
                correlationId, getClientIP(request));

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.FORBIDDEN.value())
                .error(HttpStatus.FORBIDDEN.getReasonPhrase())
                .message("Access denied")
                .errorCode("ACCESS_DENIED")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .correlationId(correlationId)
                .build();

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    /**
     * Handle rate limit exceeded
     */
    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<ErrorResponse> handleRateLimitExceeded(
            RateLimitExceededException ex, HttpServletRequest request) {

        String correlationId = getCorrelationId();

        log.warn("[{}] Rate limit exceeded from IP: {}",
                correlationId, getClientIP(request));

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.TOO_MANY_REQUESTS.value())
                .error("Too Many Requests")
                .message("Rate limit exceeded. Please try again later.")
                .errorCode(ex.getErrorCode())
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .correlationId(correlationId)
                .retryAfter(ex.getRetryAfterSeconds())
                .build();

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header("Retry-After", String.valueOf(ex.getRetryAfterSeconds()))
                .body(error);
    }

    /**
     * Handle duplicate resource exceptions
     */
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateResourceException(
            DuplicateResourceException ex, HttpServletRequest request) {

        String correlationId = getCorrelationId();

        log.warn("[{}] Duplicate resource: {}", correlationId, ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.CONFLICT.value())
                .error(HttpStatus.CONFLICT.getReasonPhrase())
                .message(sanitizeMessage(ex.getMessage()))
                .errorCode(ex.getErrorCode())
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .correlationId(correlationId)
                .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    /**
     * Handle service exceptions
     */
    @ExceptionHandler(ServiceException.class)
    public ResponseEntity<ErrorResponse> handleServiceException(
            ServiceException ex, HttpServletRequest request) {

        String correlationId = getCorrelationId();

        log.error("[{}] Service error from {}: {}",
                correlationId, ex.getServiceName(), ex.getMessage(), ex);

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.SERVICE_UNAVAILABLE.value())
                .error("Service Unavailable")
                .message("The service is temporarily unavailable. Please try again later.")
                .errorCode(ex.getErrorCode())
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .correlationId(correlationId)
                .build();

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(error);
    }


    /**
     * Handle file size exceeded
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceeded(
            MaxUploadSizeExceededException ex, HttpServletRequest request) {

        String correlationId = getCorrelationId();

        log.warn("[{}] File size exceeded", correlationId);

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.PAYLOAD_TOO_LARGE.value())
                .error("Payload Too Large")
                .message("File size exceeds the maximum allowed limit")
                .errorCode("FILE_SIZE_EXCEEDED")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .correlationId(correlationId)
                .build();

        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(error);
    }

    /**
     * Handle missing request parameter
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingServletRequestParameter(
            MissingServletRequestParameterException ex, HttpServletRequest request) {

        String correlationId = getCorrelationId();

        log.warn("[{}] Missing parameter: {}", correlationId, ex.getParameterName());

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message(String.format("Required parameter '%s' is missing", ex.getParameterName()))
                .errorCode("MISSING_PARAMETER")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .correlationId(correlationId)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle missing request part (multipart)
     */
    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ErrorResponse> handleMissingServletRequestPart(
            MissingServletRequestPartException ex, HttpServletRequest request) {

        String correlationId = getCorrelationId();

        log.warn("[{}] Missing request part: {}", correlationId, ex.getRequestPartName());

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message(String.format("Required file '%s' is missing", ex.getRequestPartName()))
                .errorCode("MISSING_FILE")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .correlationId(correlationId)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle type mismatch
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {

        String correlationId = getCorrelationId();

        log.warn("[{}] Type mismatch for parameter: {}", correlationId, ex.getName());

        String message = String.format("Invalid value for parameter '%s'", ex.getName());

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message(message)
                .errorCode("TYPE_MISMATCH")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .correlationId(correlationId)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle HTTP message not readable
     * SECURITY: Don't expose JSON parsing details
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex, HttpServletRequest request) {

        String correlationId = getCorrelationId();

        log.warn("[{}] Malformed JSON request", correlationId);

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message("Malformed JSON request")
                .errorCode("MALFORMED_JSON")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .correlationId(correlationId)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle unsupported media type
     */
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleHttpMediaTypeNotSupported(
            HttpMediaTypeNotSupportedException ex, HttpServletRequest request) {

        String correlationId = getCorrelationId();

        log.warn("[{}] Unsupported media type: {}", correlationId, ex.getContentType());

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.UNSUPPORTED_MEDIA_TYPE.value())
                .error("Unsupported Media Type")
                .message("Content type not supported")
                .errorCode("UNSUPPORTED_MEDIA_TYPE")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .correlationId(correlationId)
                .build();

        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(error);
    }

    /**
     * Handle method not allowed
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleHttpRequestMethodNotSupported(
            HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {

        String correlationId = getCorrelationId();

        log.warn("[{}] Method not allowed: {}", correlationId, ex.getMethod());

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.METHOD_NOT_ALLOWED.value())
                .error("Method Not Allowed")
                .message(String.format("Method '%s' is not supported for this endpoint", ex.getMethod()))
                .errorCode("METHOD_NOT_ALLOWED")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .correlationId(correlationId)
                .build();

        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(error);
    }

    /**
     * Handle no handler found (404)
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoHandlerFound(
            NoHandlerFoundException ex, HttpServletRequest request) {

        String correlationId = getCorrelationId();

        log.warn("[{}] No handler found for: {} {}",
                correlationId, ex.getHttpMethod(), ex.getRequestURL());

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.NOT_FOUND.value())
                .error(HttpStatus.NOT_FOUND.getReasonPhrase())
                .message("Endpoint not found")
                .errorCode("ENDPOINT_NOT_FOUND")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .correlationId(correlationId)
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Handle all other exceptions
     * SECURITY: Never expose internal error details
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, HttpServletRequest request) {

        String correlationId = getCorrelationId();

        // Log full exception internally
        log.error("[{}] Unexpected error occurred", correlationId, ex);

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .message(INTERNAL_ERROR_MESSAGE)
                .errorCode("INTERNAL_ERROR")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .correlationId(correlationId)
                .debugInfo(debugMode ? ex.getClass().getSimpleName() : null)
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    // ============= Helper Methods =============

    private String getCorrelationId() {
        String correlationId = MDC.get("correlationId");
        return correlationId != null ? correlationId : java.util.UUID.randomUUID().toString();
    }

    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIP = request.getHeader("X-Real-IP");
        if (xRealIP != null && !xRealIP.isEmpty()) {
            return xRealIP;
        }

        return request.getRemoteAddr();
    }

    /**
     * Sanitize error messages to prevent information disclosure
     * SECURITY: Remove sensitive information like file paths, SQL, etc.
     */
    private String sanitizeMessage(String message) {
        if (message == null) {
            return "An error occurred";
        }

        // Remove file system paths
        message = message.replaceAll("(?i)([A-Z]:|/)([^\\s\"'<>|]+/)+", "[PATH]");

        // Remove SQL-like patterns
        message = message.replaceAll("(?i)(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)\\s+.*", "[SQL]");

        // Remove email addresses except domain
        message = message.replaceAll("[a-zA-Z0-9._%+-]+@", "***@");

        // Remove phone numbers
        message = message.replaceAll("\\+?\\d{10,15}", "***");

        // Remove stack trace patterns
        message = message.replaceAll("(?i)at\\s+[\\w.]+\\([^)]+\\)", "");

        // Limit length
        if (message.length() > 500) {
            message = message.substring(0, 500) + "...";
        }

        return message.trim();
    }
}
