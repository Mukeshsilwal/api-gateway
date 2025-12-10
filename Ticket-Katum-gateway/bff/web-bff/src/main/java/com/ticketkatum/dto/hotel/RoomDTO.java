package com.ticketkatum.dto.hotel;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomDTO {

    private Long id;

    private String roomNumber;
    private String roomType;
    private String description;
    private Integer capacity;

    private BigDecimal basePrice;
    private BigDecimal maxPrice;

    private Set<String> amenities;

    private boolean active;

    private Long hotelId;  // Extracted from Room.hotel.id

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
