package com.ticketkatum.model;

import com.ticketkatum.utils.Request;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
public class HotelCancellationRequest extends Request {
    private String bookingId;
    private String confirmationNumber;
    private String reason;
    private String cancelledBy;
}