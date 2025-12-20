package com.ticketkatum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Generic Response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Response<T> {
    private int statusCode;
    private String message;
    private T data;

    public static <T> Response<T> success(T data) {
        return Response.<T>builder()
                .statusCode(200)
                .message("Success")
                .data(data)
                .build();
    }

    public static <T> Response<T> success(String message, T data) {
        return Response.<T>builder()
                .statusCode(200)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> Response<T> error(String message) {
        return Response.<T>builder()
                .statusCode(500)
                .message(message)
                .build();
    }

    public static <T> Response<T> error(int statusCode, String message) {
        return Response.<T>builder()
                .statusCode(statusCode)
                .message(message)
                .build();
    }
}
