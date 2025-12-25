package com.ticketkatum.tripservice.dto;

import com.ticketkatum.tripservice.entity.TripParticipant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripParticipantDTO {
    
    private Long participantId;
    private Long tripId;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String status;
    private LocalDateTime createdAt;
    
    public static TripParticipantDTO fromEntity(TripParticipant participant) {
        if (participant == null) {
            return null;
        }
        
        return TripParticipantDTO.builder()
                .participantId(participant.getParticipantId())
                .tripId(participant.getTrip() != null ? participant.getTrip().getTripId() : null)
                .userId(participant.getUserId())
                .name(participant.getName())
                .email(participant.getEmail())
                .phone(participant.getPhone())
                .role(participant.getRole().name())
                .status(participant.getStatus().name())
                .createdAt(participant.getCreatedAt())
                .build();
    }
}
