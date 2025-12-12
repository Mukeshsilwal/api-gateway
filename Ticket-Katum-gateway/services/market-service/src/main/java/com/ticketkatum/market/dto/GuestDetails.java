package com.ticketkatum.market.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GuestDetails {
    private String name;
    private int age;
    private String gender;
}
