package com.ticketkatum.dto.hotel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelDTO {
    private Long id;
    private String hotelCode;
    private String name;
    private String description;
    private String address;
    private String city;
    private String country;
    private String phone;
    private String email;
    private Integer stars;
    private Double rating;
    private Set<String> images;
    private List<RoomDTO> rooms;
}
