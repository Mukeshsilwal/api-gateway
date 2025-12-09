package com.ticketkatum.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Standardized error response
 * SECURITY: Never expose internal stack traces or sensitive system information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private Integer status;
    private String error;
    private String message;
    private String errorCode;
    private String path;
    private LocalDateTime timestamp;
    private String correlationId;

    // Optional fields for validation errors
    private Map<String, String> fieldErrors;
    private List<String> globalErrors;

    // Optional field for rate limiting
    private Long retryAfter;

    // SECURITY: Development-only field, never expose in production
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private String debugInfo;
}