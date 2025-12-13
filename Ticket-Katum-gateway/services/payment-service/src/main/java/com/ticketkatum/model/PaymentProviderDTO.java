package com.ticketkatum.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Payment provider configuration")
public class PaymentProviderDTO {

    @Schema(description = "Unique provider identifier", example = "esewa")
    private String id;

    @Schema(description = "Display name of the provider", example = "eSewa")
    private String name;

    @Schema(description = "Logo URL or asset path", example = "/assets/esewa-logo.png")
    private String logo;

    @Schema(description = "Whether this provider is currently enabled")
    private boolean enabled;

    @Schema(description = "Maximum allowed transaction amount")
    private BigDecimal maxAmount;

    @Schema(description = "Currency supported by the provider", example = "NPR")
    private String currency;

    @Schema(description = "Sort order for UI display", example = "1")
    private Integer sortOrder;

    @Schema(description = "Additional notes or description")
    private String description;
}

