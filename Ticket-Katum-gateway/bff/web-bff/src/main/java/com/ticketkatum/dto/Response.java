package com.ticketkatum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Response<T> {
    private int statusCode;
    private String message;
    private T data;

    // For compatibility with microservices
    public Response(int statusCode, String message) {
        this.statusCode = statusCode;
        this.message = message;
    }
}
