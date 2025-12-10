package com.ticketkatum.dto.auth.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private Integer count;

    @JsonProperty("requestId")
    private Long requestId;

    @JsonProperty("expiryMinutes")
    private Integer expiryMinutes;
}