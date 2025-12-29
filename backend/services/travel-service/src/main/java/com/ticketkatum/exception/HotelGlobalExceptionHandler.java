package com.ticketkatum.exception;

import com.ticketkatum.utils.Response;
import com.ticketkatum.utils.ResponseHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Global exception handler for Hotel Service
 * Provides consistent error responses across all endpoints
 */
@RestControllerAdvice
@Slf4j
public class HotelGlobalExceptionHandler {

    /**
     * Handle HotelNotFoundException
     */
    @ExceptionHandler(HotelNotFoundException.class)
    public ResponseEntity<Response<Void>> handleHotelNotFound(HotelNotFoundException ex) {
        log.warn("Hotel not found: {}", ex.getMessage());
        Response<Void> response = ResponseHandler.notFound(ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * Handle RoomNotFoundException
     */
    @ExceptionHandler(RoomNotFoundException.class)
    public ResponseEntity<Response<Void>> handleRoomNotFound(RoomNotFoundException ex) {
        log.warn("Room not found: {}", ex.getMessage());
        Response<Void> response = ResponseHandler.notFound(ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * Handle HotelAlreadyExistsException
     */
    @ExceptionHandler(HotelAlreadyExistsException.class)
    public ResponseEntity<Response<Void>> handleHotelAlreadyExists(HotelAlreadyExistsException ex) {
        log.warn("Hotel already exists: {}", ex.getMessage());
        Response<Void> response = ResponseHandler.failure(ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    /**
     * Handle InvalidHotelDataException
     */
    @ExceptionHandler(InvalidHotelDataException.class)
    public ResponseEntity<Response<Void>> handleInvalidHotelData(InvalidHotelDataException ex) {
        log.warn("Invalid hotel data: {}", ex.getMessage());
        Response<Void> response = ResponseHandler.failure(ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handle RoomAlreadyExistsException
     */
    @ExceptionHandler(RoomAlreadyExistsException.class)
    public ResponseEntity<Response<Void>> handleRoomAlreadyExists(RoomAlreadyExistsException ex) {
        log.warn("Room already exists: {}", ex.getMessage());
        Response<Void> response = ResponseHandler.failure(ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    /**
     * Handle InvalidRoomDataException
     */
    @ExceptionHandler(InvalidRoomDataException.class)
    public ResponseEntity<Response<Void>> handleInvalidRoomData(InvalidRoomDataException ex) {
        log.warn("Invalid room data: {}", ex.getMessage());
        Response<Void> response = ResponseHandler.failure(ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handle validation errors from @Valid
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Response<Map<String, String>>> handleValidationErrors(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        log.warn("Validation failed: {}", errors);

        Response<Map<String, String>> response = Response.<Map<String, String>>builder()
                .code("1")
                .message("Validation failed")
                .data(errors)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handle constraint violations from @Validated
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Response<Map<String, String>>> handleConstraintViolation(
            ConstraintViolationException ex) {

        Map<String, String> errors = ex.getConstraintViolations().stream()
                .collect(Collectors.toMap(
                        violation -> violation.getPropertyPath().toString(),
                        ConstraintViolation::getMessage));

        log.warn("Constraint violation: {}", errors);

        Response<Map<String, String>> response = Response.<Map<String, String>>builder()
                .code("1")
                .message("Validation failed")
                .data(errors)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handle type mismatch errors (e.g., passing string for Long parameter)
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Response<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String message = String.format("Invalid value '%s' for parameter '%s'. Expected type: %s",
                ex.getValue(),
                ex.getName(),
                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown");

        log.warn("Type mismatch: {}", message);

        Response<Void> response = ResponseHandler.failure(message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handle all other exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Response<Void>> handleGenericException(Exception ex) {
        log.error("Unexpected error occurred", ex);

        Response<Void> response = ResponseHandler.internalError(
                "An unexpected error occurred. Please try again later.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
