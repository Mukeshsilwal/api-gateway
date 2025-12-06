package com.ticketkatum.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenericResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private String requestId;
    private LocalDateTime timestamp;
    private ErrorDetails error;

    public static <T> GenericResponse<T> success(T data, String requestId) {
        return GenericResponse.<T>builder()
                .success(true)
                .message("Success")
                .data(data)
                .requestId(requestId)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> GenericResponse<T> failure(String message, String requestId) {
        return GenericResponse.<T>builder()
                .success(false)
                .message(message)
                .requestId(requestId)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> GenericResponse<T> error(String message, ErrorDetails error, String requestId) {
        return GenericResponse.<T>builder()
                .success(false)
                .message(message)
                .error(error)
                .requestId(requestId)
                .timestamp(LocalDateTime.now())
                .build();
    }
}