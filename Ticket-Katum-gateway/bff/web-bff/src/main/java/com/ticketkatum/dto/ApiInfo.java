package com.ticketkatum.dto;

import java.util.List;

@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class ApiInfo {
    private String name;
    private String version;
    private String description;
    private List<String> aggregators;
    private Integer services;
    private Integer endpoints;
}