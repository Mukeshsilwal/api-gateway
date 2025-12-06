package com.ticketkatum.service;


import com.ticketkatum.model.AdminRegistrationRequestDto;
import com.ticketkatum.model.ChangePasswordRequest;
import com.ticketkatum.model.User;

import java.util.List;

public interface RegistrationService {
    void registerAdmin(AdminRegistrationRequestDto adminRegistrationRequest);
    void approveRequest(Long id);
    void changePassword(ChangePasswordRequest changePasswordRequest);
    void sentOtp(User user);
    List<AdminRegistrationRequestDto> getAllRequests();
}
