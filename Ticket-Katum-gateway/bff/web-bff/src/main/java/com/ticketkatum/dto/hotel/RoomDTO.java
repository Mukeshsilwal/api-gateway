package com.ticketkatum.dto.hotel;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
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
    private long hotelId;
    private String hotelCode;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
