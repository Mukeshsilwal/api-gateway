package com.ticketkatum.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Local copy of PaymentVerifiedEvent to ensure booking-service has the latest
 * definition
 * capable of handling the producer's message format, avoiding shared-library
 * versioning issues.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaymentVerifiedEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private String bookingId;
    private String transactionId;
    private Long merchantId;
    private BigDecimal amount;
    private String provider;

    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.ARRAY) // Explicitly handle the array format [yyyy, MM, dd, HH, mm, ss, ns]
    private LocalDateTime verifiedAt;

    private String bookingType;
    private String externalTransactionId;
    private String metadata;
}
