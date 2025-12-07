package com.ticketkatum.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
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
