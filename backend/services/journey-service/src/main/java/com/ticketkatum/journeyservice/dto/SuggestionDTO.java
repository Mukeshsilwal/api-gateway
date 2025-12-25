package com.ticketkatum.journeyservice.dto;

import com.ticketkatum.journeyservice.entity.JourneySuggestion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuggestionDTO {

    private Long suggestionId;
    private JourneySuggestion.SuggestionType suggestionType;
    private String entityType;
    private Long entityId;
    private String title;
    private String description;
    private BigDecimal estimatedCost;
    private Integer priority;
    private BigDecimal relevanceScore;
    private Boolean isAccepted;
    private Boolean isDismissed;
    private Map<String, Object> metadata;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
