package com.ticketkatum.client;

import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.auth.AdminRegistrationRequestDto;
import com.ticketkatum.dto.auth.AdminRegistrationRequestWeb;
import com.ticketkatum.dto.auth.request.ChangePasswordRequest;
import com.ticketkatum.dto.auth.response.RegistrationResponse;
import com.ticketkatum.service.serviceimpl.RegistrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class RegistrationServiceClient {

    private final RegistrationService registrationService;

    // ============================================
    // Registration Requests
    // ============================================

    public CompletableFuture<Response<RegistrationResponse>> registerAdmin(AdminRegistrationRequestWeb request) {
        log.info("Registering admin directly: {}", request.getEmail());

        return CompletableFuture.supplyAsync(() -> {
            com.ticketkatum.model.CreateRegistrationRequest req = new com.ticketkatum.model.CreateRegistrationRequest();
            req.setFirstName(request.getFirstName());
            req.setLastName(request.getLastName());
            req.setEmail(request.getEmail());
            req.setPhoneNumber(request.getPhoneNumber());
            req.setOrganizationName(request.getOrganizationName());

            com.ticketkatum.model.RegistrationResponse result = registrationService.registerAdmin(req);

            RegistrationResponse resp = RegistrationResponse.builder()
                    .requestId(result.getRequestId())
                    .email(result.getEmail())
                    .status(result.getStatus())
                    .build();

            return Response.<RegistrationResponse>builder()
                    .statusCode(201)
                    .message("Registration request submitted successfully")
                    .data(resp)
                    .build();
        });
    }

    public CompletableFuture<Response<Void>> approveRequest(Long requestId, String token) {
        log.info("Approving registration request directly: {}", requestId);

        return CompletableFuture.supplyAsync(() -> {
            registrationService.approveRequest(requestId);
            return Response.<Void>builder()
                    .statusCode(200)
                    .message("Admin approved successfully")
                    .build();
        });
    }

    public CompletableFuture<Response<Void>> rejectRequest(Long requestId, String token) {
        log.info("Rejecting registration request directly: {}", requestId);

        return CompletableFuture.supplyAsync(() -> {
            registrationService.rejectRequest(requestId);
            return Response.<Void>builder()
                    .statusCode(200)
                    .message("Admin request rejected successfully")
                    .build();
        });
    }

    // ============================================
    // Fetch Requests
    // ============================================

    public CompletableFuture<List<AdminRegistrationRequestDto>> getAllRequests(String token) {
        log.info("Fetching all registration requests directly");

        return CompletableFuture.supplyAsync(() -> {
            List<com.ticketkatum.model.AdminRegistrationRequestDto> list = registrationService.getAllRequests();
            if (list == null) return Collections.emptyList();
            return list.stream().map(r -> AdminRegistrationRequestDto.builder()
                    .id(r.getId())
                    .fullName(r.getFullName())
                    .email(r.getEmail())
                    .phone(r.getPhone())
                    .status(r.getStatus())
                    .build()).collect(Collectors.toList());
        });
    }

    public CompletableFuture<AdminRegistrationRequestDto> getRequestById(Long requestId, String token) {
        log.info("Fetching registration request directly: {}", requestId);

        return CompletableFuture.supplyAsync(() -> {
            com.ticketkatum.model.AdminRegistrationRequestDto r = registrationService.getRequestById(requestId);
            if (r == null) return null;
            return AdminRegistrationRequestDto.builder()
                    .id(r.getId())
                    .fullName(r.getFullName())
                    .email(r.getEmail())
                    .phone(r.getPhone())
                    .status(r.getStatus())
                    .build();
        });
    }

    // ============================================
    // Password / OTP
    // ============================================

    public CompletableFuture<Response<Void>> changePassword(ChangePasswordRequest request, String token) {
        log.info("Changing password directly for: {}", request.getUsername());

        return CompletableFuture.supplyAsync(() -> {
            com.ticketkatum.model.ChangePasswordRequest req = new com.ticketkatum.model.ChangePasswordRequest();
            req.setUsername(request.getUsername());
            req.setOldPassword(request.getOldPassword());
            req.setNewPassword(request.getNewPassword());
            registrationService.changePassword(req);
            return Response.<Void>builder()
                    .statusCode(200)
                    .message("Password changed successfully")
                    .build();
        });
    }

    public CompletableFuture<Response<Void>> sendOtp(String username) {
        log.info("Sending OTP directly to: {}", username);

        return CompletableFuture.supplyAsync(() -> {
            com.ticketkatum.entity.User user = new com.ticketkatum.entity.User();
            user.setEmail(username);
            try {
                registrationService.sentOtp(user);
            } catch (Exception e) {
                log.error("Failed to send OTP", e);
            }
            return Response.<Void>builder()
                    .statusCode(200)
                    .message("OTP sent successfully")
                    .build();
        });
    }
}

