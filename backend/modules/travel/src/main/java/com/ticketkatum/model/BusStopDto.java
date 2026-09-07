package com.ticketkatum.model;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BusStopDto {
    private int id;
    private String name;
}
