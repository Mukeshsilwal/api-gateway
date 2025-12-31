package com.ticketkatum.dto.hotel.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class GuestDetails {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String nationality;
    private String passportNumber;
    private String age;
    private String gender;
    private String address;
    private String city;
}