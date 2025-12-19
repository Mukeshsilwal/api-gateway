package com.ticketkatum.utils;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

@Setter
@Getter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Response<T> {

    private boolean success;
    private String code;
    private String message;
    private T data;
    private HttpStatus status;
    private LocalDateTime timestamp;
    private String errorCode;

    public Response(int i, String webhookReceived, Object o) {
    }

    public int getStatusCode() {
        return status != null ? status.value() : 200;
    }

    public void setStatusCode(int statusCode) {
        this.status = HttpStatus.valueOf(statusCode);
    }
}