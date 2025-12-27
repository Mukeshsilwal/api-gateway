package com.ticketkatum.tripservice.dto;

import com.ticketkatum.tripservice.entity.ItineraryDay;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryDayDTO implements Serializable {
    private Long dayId;
    private Long tripId;
    private Integer dayNumber;
    private LocalDate date;
    private String location;
    private String title;
    private String description;

    public static ItineraryDayDTO fromEntity(ItineraryDay day) {
        if (day == null) {
            return null;
        }
        return ItineraryDayDTO.builder()
                .dayId(day.getDayId())
                .tripId(day.getTrip().getTripId())
                .dayNumber(day.getDayNumber())
                .date(day.getDate())
                .location(day.getLocation())
                .title(day.getTitle())
                .description(day.getDescription())
                .build();
    }
}
