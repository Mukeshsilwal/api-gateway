package com.ticketkatum.dto.market;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactDetails {
    private String fullName;
    private String email;
    private String phone;
}
