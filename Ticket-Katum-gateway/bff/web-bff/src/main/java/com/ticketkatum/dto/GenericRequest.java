package com.ticketkatum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenericRequest<T> {
    private String requestId;
    private String source;
    private LocalDateTime timestamp;
    private T payload;

    public static <T> GenericRequest<T> wrap(T payload, String source) {
        return GenericRequest.<T>builder()
                .requestId(UUID.randomUUID().toString())
                .source(source)
                .timestamp(LocalDateTime.now())
                .payload(payload)
                .build();
    }
}