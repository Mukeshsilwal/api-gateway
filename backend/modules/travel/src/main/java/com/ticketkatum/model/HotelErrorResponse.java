package com.ticketkatum.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelErrorResponse {
    private String error;
    private String message;
    private String timestamp;
    private Integer statusCode;
}