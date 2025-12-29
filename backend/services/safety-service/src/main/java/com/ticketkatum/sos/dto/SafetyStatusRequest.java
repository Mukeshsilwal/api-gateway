package com.ticketkatum.sos.dto;

import com.ticketkatum.sos.entity.SafetyStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SafetyStatusRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Status is required")
    private SafetyStatus.Status status;

    private BigDecimal latitude;
    private BigDecimal longitude;
    private String notes;
}
