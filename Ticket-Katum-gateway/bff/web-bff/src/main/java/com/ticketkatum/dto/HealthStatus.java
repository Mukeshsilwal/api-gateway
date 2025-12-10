package com.ticketkatum.dto;

@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class HealthStatus {
    private String status;
    private String service;
    private String version;
    private String timestamp;
    private Integer aggregatorsActive;
}