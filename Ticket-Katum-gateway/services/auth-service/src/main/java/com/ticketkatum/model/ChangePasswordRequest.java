package com.ticketkatum.model;

import com.ticketkatum.enums.ResetPassword;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangePasswordRequest {
    private ResetPassword resetPassword;
    private String oldPassword;
    private String newPassword;
    private String confirmPassword;
    private String username;
    private String otp;


}
