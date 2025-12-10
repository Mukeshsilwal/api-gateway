package com.ticketkatum.dto.auth;

import com.ticketkatum.enums.RequestStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Setter
@Getter
@Builder
public class AdminRegistrationRequestDto {
    private long id;
    private String fullName;
    private String email;
    private String phone;
    private String citizenshipNumber;
    private RequestStatus status;
    private MultipartFile frontImage;
    private MultipartFile backImage;
}
