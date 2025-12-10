package com.ticketkatum.service.serviceimpl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketkatum.entity.Otp;
import com.ticketkatum.entity.RegistrationRequest;
import com.ticketkatum.entity.User;
import com.ticketkatum.enums.RequestStatus;
import com.ticketkatum.enums.Role;
import com.ticketkatum.exceotions.BadRequestException;
import com.ticketkatum.exceotions.ResourceNotFoundException;
import com.ticketkatum.model.AdminRegistrationRequestDto;
import com.ticketkatum.model.ChangePasswordRequest;
import com.ticketkatum.model.CreateRegistrationRequest;
import com.ticketkatum.repository.OtpRepository;
import com.ticketkatum.repository.RegistrationRequestRepo;
import com.ticketkatum.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegistrationService {

    private final RegistrationRequestRepo requestRepository;
    private final UserRepo userRepository;
    private final OtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    //    private final ImageS fileStorageService;
    private final ObjectMapper objectMapper;

    private static final String UPLOAD_DIR = "uploads/documents/";

    @Transactional
    public void registerAdmin(CreateRegistrationRequest dto) {
        log.info("Processing admin registration request for email: {}", dto.getEmail());

        // Validate email uniqueness
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        if (requestRepository.existsByEmailAndStatus(dto.getEmail(), RequestStatus.PENDING)) {
            throw new BadRequestException("A pending request already exists for this email");
        }


        // Create registration request
        RegistrationRequest request = RegistrationRequest.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .phoneNumber(dto.getPhoneNumber())
                .organizationName(dto.getOrganizationName())
                .status(RequestStatus.PENDING)
                .requestedAt(LocalDateTime.now())
                .build();

        requestRepository.save(request);
        log.info("Admin registration request saved with ID: {}", request.getId());

        // Notify super admin
        emailService.sendCredentials("", dto.getEmail(),"" );
    }

    @Transactional
    public void approveRequest(Long requestId) {
        log.info("Approving admin registration request ID: {}", requestId);

        RegistrationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration request not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Request has already been processed");
        }

        // Generate temporary password
        String temporaryPassword = generateTemporaryPassword();
        String encodedPassword = passwordEncoder.encode(temporaryPassword);

        // Create user account
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .password(encodedPassword)
                .role(Role.ADMIN)
                .organizationName(request.getOrganizationName())
                .enabled(true)
                .accountNonLocked(true)
                .credentialsNonExpired(false) // Force password change on first login
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        // Update request status
        request.setStatus(RequestStatus.APPROVED);
        request.setApprovedAt(LocalDateTime.now());
        requestRepository.save(request);

        // Send credentials via email
        emailService.sendCredentials(user.getEmail(), user.getEmail(),temporaryPassword);

        log.info("Admin approved and credentials sent to: {}", user.getEmail());
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        log.info("Processing password change request for user: {}", request.getUsername());

        User user = userRepository.findByEmail(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify old password
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        // Validate new password
        if (request.getNewPassword().length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters long");
        }

        if (request.getOldPassword().equals(request.getNewPassword())) {
            throw new BadRequestException("New password must be different from current password");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setCredentialsNonExpired(true);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("Password changed successfully for user: {}", request.getUsername());
    }

    @Transactional
    public void sentOtp(User userRequest) throws JsonProcessingException {
        log.info("Sending OTP to user: {}", userRequest.getUsername());

        User user = userRepository.findByEmail(userRequest.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userRequest.getUsername()));

        // Generate 6-digit OTP
        String otp = generateOtp();

        // Save or update OTP
        Otp otpEntity = otpRepository.findByUserEmail(user.getEmail())
                .map(existing -> {
                    existing.setOtpCode(otp);
                    existing.setExpiryTime(LocalDateTime.now().plusMinutes(5));
                    existing.setUsed(false);
                    existing.setAttempts(0);
                    return existing;
                })
                .orElse(Otp.builder()
                        .userEmail(user.getEmail())
                        .otpCode(otp)
                        .expiryTime(LocalDateTime.now().plusMinutes(5))
                        .used(false)
                        .attempts(0)
                        .build());

        otpRepository.save(otpEntity);

        // Send OTP via email
        emailService.sendEmailForOtp(user.getEmail(), "Credentials", otp);

        log.info("OTP sent successfully to: {}", user.getEmail());
    }

    public List<AdminRegistrationRequestDto> getAllRequests() {
        log.info("Fetching all admin registration requests");

        return requestRepository.findAllByOrderByRequestedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private AdminRegistrationRequestDto mapToDto(RegistrationRequest request) {
        return AdminRegistrationRequestDto.builder()
                .id(request.getId())
                .email(request.getEmail())
                .status(request.getStatus())
                .phone(request.getPhoneNumber())
                .build();
    }

    private String generateTemporaryPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        Random random = new Random();
        StringBuilder password = new StringBuilder();

        for (int i = 0; i < 12; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }

        return password.toString();
    }

    private String generateOtp() {
        Random random = new Random();
        return String.format("%06d", random.nextInt(1000000));
    }
}
