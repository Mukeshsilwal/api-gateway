package com.ticketkatum.dto.bus;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BusStopDto {
    private int id;
    @NonNull
    @NotEmpty
    private String name;

}
