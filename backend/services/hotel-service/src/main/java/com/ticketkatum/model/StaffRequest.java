package com.ticketkatum.model;

import com.ticketkatum.enums.StaffType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffRequest {

    private String fullName;

    private StaffType staffType;

    private String phone;

    private Long hotelId;

    private String notes;
}
