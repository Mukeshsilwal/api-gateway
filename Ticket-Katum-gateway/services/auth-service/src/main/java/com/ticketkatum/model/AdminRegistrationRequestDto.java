package com.ticketkatum.model;

import com.ticketkatum.enums.RequestStatus;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Setter
@Getter
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
