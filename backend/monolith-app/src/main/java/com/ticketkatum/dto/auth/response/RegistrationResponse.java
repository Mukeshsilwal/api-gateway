package com.ticketkatum.dto.auth.response;

import com.ticketkatum.enums.RequestStatus;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class RegistrationResponse {
    private String email;
    private long requestId;
    private RequestStatus status;
}
