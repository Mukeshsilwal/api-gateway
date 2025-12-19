package com.ticketkatum.dto.bus;

import lombok.Data;

import java.time.LocalDate;

@Data
public class BusSearchRequest {
    private String source;
    private String destination;
    private LocalDate date;

    private Integer pageSize;
    private Long cursor;
}
