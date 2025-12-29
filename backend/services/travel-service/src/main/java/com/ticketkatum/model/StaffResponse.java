package com.ticketkatum.model;

import com.ticketkatum.enums.StaffStatus;
import com.ticketkatum.enums.StaffType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffResponse {

    private Long id;
    private String fullName;
    private StaffType staffType;
    private StaffStatus status;
    private String phone;
    private String notes;
}
