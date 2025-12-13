package com.ticketkatum.dto.hotel.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactDetails {
    private String email;
    private String phone;
    private String alternatePhone;
    private String address;

}
