package com.ticketkatum.service.serviceimpl;

import com.ticketkatum.entity.AdminRegistrationRequest;
import com.ticketkatum.entity.AdminUser;
import com.ticketkatum.enums.RequestStatus;
import com.ticketkatum.enums.ResetPassword;
import com.ticketkatum.enums.Role;
import com.ticketkatum.model.AdminRegistrationRequestDto;
import com.ticketkatum.model.ChangePasswordRequest;
import com.ticketkatum.model.User;
import com.ticketkatum.repository.AdminRepo;
import com.ticketkatum.repository.RegistrationRepo;
import com.ticketkatum.service.OtpGeneratorService;
import com.ticketkatum.service.RegistrationService;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
@RequestScope
@AllArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {

    private final RegistrationRepo registrationRepo;
    private final AdminRepo adminRepo;
    private final FileServiceImpl fileService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final OtpGeneratorService otpGeneratorService;

    @Override
    public void registerAdmin(AdminRegistrationRequestDto dto) {
        AdminRegistrationRequest request = new AdminRegistrationRequest();
        request.setFullName(dto.getFullName());
        request.setEmail(dto.getEmail());
        request.setPhone(dto.getPhone());
        request.setCitizenshipNumber(dto.getCitizenshipNumber());
        request.setCitizenshipFrontUrl(fileService.save(dto.getFrontImage()));
        request.setCitizenshipBackUrl(fileService.save(dto.getBackImage()));
        request.setStatus(RequestStatus.PENDING);
        request.setCreatedAt(LocalDateTime.now());

        registrationRepo.save(request);
    }

    @Override
    public void approveRequest(Long id) {
        AdminRegistrationRequest request = registrationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));

        if (request.getStatus() != RequestStatus.PENDING)
            throw new RuntimeException("Already processed");

        String username = generateUsername(request.getFullName());
        String passwordPlain = generateRandomPasswordPlain();
        String passwordHashed = passwordEncoder.encode(passwordPlain);

        AdminUser user = new AdminUser();
        user.setRole(Role.ADMIN);
        user.setUsername(username);
        user.setPassword(passwordHashed);
        user.setEmail(request.getEmail());
        user.setCreatedAt(LocalDateTime.now());

        adminRepo.save(user);

        request.setStatus(RequestStatus.APPROVED);
        registrationRepo.save(request);

        emailService.sendCredentials(request.getEmail(), username, passwordPlain);
    }

    @Override
    public void changePassword(ChangePasswordRequest changePasswordRequest) {

        AdminUser user = this.adminRepo.findByEmail(changePasswordRequest.getUsername())
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        if (!Objects.equals(changePasswordRequest.getNewPassword(), changePasswordRequest.getConfirmPassword())) {
            throw new BadCredentialsException("Passwords do not match");
        }

        if (changePasswordRequest.getResetPassword() == ResetPassword.CHANGE_PASSWORD) {

            if (!passwordEncoder.matches(changePasswordRequest.getOldPassword(), user.getPassword())) {
                throw new BadCredentialsException("Old password is incorrect");
            }

            user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
            adminRepo.save(user);
            return;
        }

        if (changePasswordRequest.getResetPassword() == ResetPassword.RESET_PASSWORD) {
            if (!Objects.equals(user.getOtp(), changePasswordRequest.getOtp())) {
                throw new BadCredentialsException("Invalid OTP");
            }

            user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
            adminRepo.save(user);
            return;
        }

        throw new BadCredentialsException("Invalid password reset mode");
    }

    @Override
    public void sentOtp(User userJson) {
        String otp = this.otpGeneratorService.generateOTP();
        this.emailService.sendEmailForOtp(
                userJson.getUsername(),
                "Otp",
                "Please use this otp to change your password" + "" + otp
        );

        this.adminRepo.findByEmail(userJson.getUsername()).ifPresent(existingUser -> {
            existingUser.setOtp(otp);
            this.adminRepo.save(existingUser);
        });
    }

    @Override
    public List<AdminRegistrationRequestDto> getAllRequests() {

        return registrationRepo.findAll()
                .stream()
                .filter(request -> request.getStatus() != RequestStatus.APPROVED)
                .map(request -> {
                    AdminRegistrationRequestDto dto = new AdminRegistrationRequestDto();
                    dto.setFullName(request.getFullName());
                    dto.setEmail(request.getEmail());
                    dto.setPhone(request.getPhone());
                    dto.setId(request.getId());
                    dto.setCitizenshipNumber(request.getCitizenshipNumber());
                    dto.setStatus(request.getStatus());
                    return dto;
                })
                .collect(Collectors.toList());
    }



    public String generateRandomPasswordPlain() {
        int length = 10;
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        SecureRandom random = new SecureRandom();

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }

        return sb.toString();
    }

    public String generateUsername(String fullName) {
        if (fullName == null || fullName.trim().isEmpty()) {
            throw new IllegalArgumentException("Full name cannot be empty");
        }

        String base = fullName.trim()
                .toLowerCase()
                .replaceAll("[^a-zA-Z ]", "")
                .replaceAll("\\s+", ".");

        int suffix = (int) (Math.random() * 900 + 100);

        return base + suffix;
    }


}
