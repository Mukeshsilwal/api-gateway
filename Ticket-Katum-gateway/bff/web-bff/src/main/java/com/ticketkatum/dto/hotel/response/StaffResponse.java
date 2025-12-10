package com.ticketkatum.dto.hotel.response;

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

    private StaffType staffType;   // HOUSEKEEPING, MAINTENANCE
    private StaffStatus status;    // AVAILABLE, BUSY, OFFLINE

    private String phone;

    private String notes;

    // Hotel Info
    private Long hotelId;
    private String hotelName;
}
