package com.ticketkatum.utils;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class Request {
    private String customerId;
    private double amount;
    private Map<String, Object> metadata;
}
