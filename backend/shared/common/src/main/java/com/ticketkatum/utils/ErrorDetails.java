package com.ticketkatum.utils;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorDetails {
    private String errorCode;
    private String description;
    private String field;
}
