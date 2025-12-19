package com.ticketkatum.model;

import com.ticketkatum.enums.ResponseStatus;
import com.ticketkatum.utils.Response;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

/**
 * Utility class for building standardized API responses
 */
public class ResponseHandler {

    // ==================== SUCCESS RESPONSES ====================

    /**
     * Success response with data only
     * Status: 200 OK
     */
    public static <T> Response<T> success(T data) {
        return Response.<T>builder()
                .success(true)
                .code(ResponseStatus.SUCCESS.code())
                .message(ResponseStatus.SUCCESS.message())
                .data(data)
                .status(HttpStatus.OK)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Success response with custom message and data
     * Status: 200 OK
     */
    public static <T> Response<T> success(String message, T data) {
        return Response.<T>builder()
                .success(true)
                .code(ResponseStatus.SUCCESS.code())
                .message(message)
                .data(data)
                .status(HttpStatus.OK)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Success response with custom message only (no data)
     * Status: 200 OK
     */
    public static <T> Response<T> success(String message) {
        return Response.<T>builder()
                .success(true)
                .code(ResponseStatus.SUCCESS.code())
                .message(message)
                .data(null)
                .status(HttpStatus.OK)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Created response (typically for POST operations)
     * Status: 201 CREATED
     */
    public static <T> Response<T> created(String message, T data) {
        return Response.<T>builder()
                .success(true)
                .code(ResponseStatus.SUCCESS.code())
                .message(message)
                .data(data)
                .status(HttpStatus.CREATED)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * No content response (typically for DELETE operations)
     * Status: 204 NO CONTENT
     */
    public static <T> Response<T> noContent(String message) {
        return Response.<T>builder()
                .success(true)
                .code(ResponseStatus.SUCCESS.code())
                .message(message)
                .data(null)
                .status(HttpStatus.NO_CONTENT)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // ==================== ERROR RESPONSES ====================

    /**
     * Generic failure response
     * Status: 400 BAD REQUEST
     */
    public static <T> Response<T> failure(String message) {
        return Response.<T>builder()
                .success(false)
                .code(ResponseStatus.FAILED.code())
                .message(message)
                .data(null)
                .status(HttpStatus.BAD_REQUEST)
                .timestamp(LocalDateTime.now())
                .errorCode(ResponseStatus.FAILED.code())
                .build();
    }

    /**
     * Failure response with custom error code
     * Status: 400 BAD REQUEST
     */
    public static <T> Response<T> failure(String code, String message) {
        return Response.<T>builder()
                .success(false)
                .code(code)
                .message(message)
                .data(null)
                .status(HttpStatus.BAD_REQUEST)
                .timestamp(LocalDateTime.now())
                .errorCode(code)
                .build();
    }

    /**
     * Not Found response
     * Status: 404 NOT FOUND
     */
    public static <T> Response<T> notFound(String message) {
        return Response.<T>builder()
                .success(false)
                .code("NOT_FOUND")
                .message(message)
                .data(null)
                .status(HttpStatus.NOT_FOUND)
                .timestamp(LocalDateTime.now())
                .errorCode("NOT_FOUND")
                .build();
    }

    /**
     * Unauthorized response
     * Status: 401 UNAUTHORIZED
     */
    public static <T> Response<T> unauthorized(String message) {
        return Response.<T>builder()
                .success(false)
                .code("UNAUTHORIZED")
                .message(message)
                .data(null)
                .status(HttpStatus.UNAUTHORIZED)
                .timestamp(LocalDateTime.now())
                .errorCode("UNAUTHORIZED")
                .build();
    }

    /**
     * Forbidden response
     * Status: 403 FORBIDDEN
     */
    public static <T> Response<T> forbidden(String message) {
        return Response.<T>builder()
                .success(false)
                .code("FORBIDDEN")
                .message(message)
                .data(null)
                .status(HttpStatus.FORBIDDEN)
                .timestamp(LocalDateTime.now())
                .errorCode("FORBIDDEN")
                .build();
    }

    /**
     * Internal Server Error response
     * Status: 500 INTERNAL SERVER ERROR
     */
    public static <T> Response<T> internalError(String message) {
        return Response.<T>builder()
                .success(false)
                .code("INTERNAL_ERROR")
                .message(message)
                .data(null)
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .timestamp(LocalDateTime.now())
                .errorCode("INTERNAL_ERROR")
                .build();
    }

    /**
     * Custom error response with HTTP status
     */
    public static <T> Response<T> error(String code, String message, HttpStatus status) {
        return Response.<T>builder()
                .success(false)
                .code(code)
                .message(message)
                .data(null)
                .status(status)
                .timestamp(LocalDateTime.now())
                .errorCode(code)
                .build();
    }

    // ==================== WILDCARD RESPONSES (for generic return types) ====================

    /**
     * Success response with wildcard type
     * Use when you can't specify the exact generic type
     */
    public static Response<?> successWildcard(String message, Object data) {
        return Response.builder()
                .success(true)
                .code(ResponseStatus.SUCCESS.code())
                .message(message)
                .data(data)
                .status(HttpStatus.OK)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Success response with wildcard type (no data)
     */
    public static Response<?> successWildcard(String message) {
        return Response.builder()
                .success(true)
                .code(ResponseStatus.SUCCESS.code())
                .message(message)
                .data(null)
                .status(HttpStatus.OK)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Failure response with wildcard type
     */
    public static Response<?> failureWildcard(String message) {
        return Response.builder()
                .success(false)
                .code(ResponseStatus.FAILED.code())
                .message(message)
                .data(null)
                .status(HttpStatus.BAD_REQUEST)
                .timestamp(LocalDateTime.now())
                .errorCode(ResponseStatus.FAILED.code())
                .build();
    }

    /**
     * Failure response with wildcard type and custom error code
     */
    public static Response<?> failureWildcard(String code, String message) {
        return Response.builder()
                .success(false)
                .code(code)
                .message(message)
                .data(null)
                .status(HttpStatus.BAD_REQUEST)
                .timestamp(LocalDateTime.now())
                .errorCode(code)
                .build();
    }

    /**
     * Not Found response with wildcard type
     */
    public static Response<?> notFoundWildcard(String message) {
        return Response.builder()
                .success(false)
                .code("NOT_FOUND")
                .message(message)
                .data(null)
                .status(HttpStatus.NOT_FOUND)
                .timestamp(LocalDateTime.now())
                .errorCode("NOT_FOUND")
                .build();
    }

    /**
     * Created response with wildcard type
     */
    public static Response<?> createdWildcard(String message, Object data) {
        return Response.builder()
                .success(true)
                .code(ResponseStatus.SUCCESS.code())
                .message(message)
                .data(data)
                .status(HttpStatus.CREATED)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // ==================== VALIDATION ERROR RESPONSES ====================

    /**
     * Validation error response
     * Status: 422 UNPROCESSABLE ENTITY
     */
    public static <T> Response<T> validationError(String message) {
        return Response.<T>builder()
                .success(false)
                .code("VALIDATION_ERROR")
                .message(message)
                .data(null)
                .status(HttpStatus.UNPROCESSABLE_ENTITY)
                .timestamp(LocalDateTime.now())
                .errorCode("VALIDATION_ERROR")
                .build();
    }

    /**
     * Validation error response with details
     */
    public static <T> Response<T> validationError(String message, T validationDetails) {
        return Response.<T>builder()
                .success(false)
                .code("VALIDATION_ERROR")
                .message(message)
                .data(validationDetails)
                .status(HttpStatus.UNPROCESSABLE_ENTITY)
                .timestamp(LocalDateTime.now())
                .errorCode("VALIDATION_ERROR")
                .build();
    }


    /**
     * Check if response was successful
     */
    public static boolean isSuccess(Response<?> response) {
        return response != null && response.isSuccess();
    }

    /**
     * Check if response was a failure
     */
    public static boolean isFailure(Response<?> response) {
        return response != null && !response.isSuccess();
    }
}