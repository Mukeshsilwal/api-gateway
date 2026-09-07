package com.ticketkatum.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketkatum.entity.RegistrationRequest;
import com.ticketkatum.entity.Role;
import com.ticketkatum.entity.User;
import com.ticketkatum.enums.RequestStatus;
import com.ticketkatum.exception.BadRequestException;
import com.ticketkatum.model.CreateRegistrationRequest;
import com.ticketkatum.model.RegistrationResponse;
import com.ticketkatum.repository.OtpRepository;
import com.ticketkatum.repository.RegistrationRequestRepo;
import com.ticketkatum.repository.RoleRepository;
import com.ticketkatum.repository.UserRepo;
import com.ticketkatum.service.serviceimpl.AuthEmailService;
import com.ticketkatum.service.serviceimpl.RegistrationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RegistrationServiceTest {

    @Mock
    private RegistrationRequestRepo requestRepository;

    @Mock
    private UserRepo userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private OtpRepository otpRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthEmailService emailService;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private RegistrationService registrationService;

    private CreateRegistrationRequest createRequest;
    private RegistrationRequest savedRequest;

    @BeforeEach
    void setUp() {
        createRequest = CreateRegistrationRequest.builder()
                .firstName("John")
                .lastName("Operator")
                .email("john@busoperator.com")
                .phoneNumber("9812345678")
                .organizationName("Mountain Travels")
                .build();

        savedRequest = RegistrationRequest.builder()
                .id(1L)
                .firstName("John")
                .lastName("Operator")
                .email("john@busoperator.com")
                .phoneNumber("9812345678")
                .organizationName("Mountain Travels")
                .status(RequestStatus.PENDING)
                .requestedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Admin Registration: Submits request and marks status as PENDING")
    void testRegisterAdmin_Success() {
        when(userRepository.existsByEmail("john@busoperator.com")).thenReturn(false);
        when(requestRepository.existsByEmailAndStatus("john@busoperator.com", RequestStatus.PENDING)).thenReturn(false);
        when(requestRepository.save(any(RegistrationRequest.class))).thenReturn(savedRequest);
        doNothing().when(emailService).sendCredentials(anyString(), anyString(), anyString());

        RegistrationResponse response = registrationService.registerAdmin(createRequest);

        assertNotNull(response);
        assertEquals("john@busoperator.com", response.getEmail());
        assertEquals(RequestStatus.PENDING, response.getStatus());
        assertEquals(1L, response.getRequestId());
        verify(requestRepository, times(1)).save(any(RegistrationRequest.class));
    }

    @Test
    @DisplayName("Admin Registration: Fails when email already exists in users table")
    void testRegisterAdmin_DuplicateUserEmail_ThrowsBadRequest() {
        when(userRepository.existsByEmail("john@busoperator.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> registrationService.registerAdmin(createRequest));
        verify(requestRepository, never()).save(any());
    }

    @Test
    @DisplayName("Admin Registration: Fails when pending request already exists for email")
    void testRegisterAdmin_PendingRequestExists_ThrowsBadRequest() {
        when(userRepository.existsByEmail("john@busoperator.com")).thenReturn(false);
        when(requestRepository.existsByEmailAndStatus("john@busoperator.com", RequestStatus.PENDING)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> registrationService.registerAdmin(createRequest));
        verify(requestRepository, never()).save(any());
    }

    @Test
    @DisplayName("Super Admin: Approves admin request, creates User with ADMIN role")
    void testApproveRequest_Success() {
        Role adminRole = Role.builder().id(2L).name("ADMIN").build();

        when(requestRepository.findById(1L)).thenReturn(Optional.of(savedRequest));
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_temp_password");
        when(roleRepository.findByName("ADMIN")).thenReturn(Optional.of(adminRole));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(requestRepository.save(any(RegistrationRequest.class))).thenAnswer(inv -> inv.getArgument(0));
        doNothing().when(emailService).sendCredentials(anyString(), anyString(), anyString());

        registrationService.approveRequest(1L);

        assertEquals(RequestStatus.APPROVED, savedRequest.getStatus());
        assertNotNull(savedRequest.getApprovedAt());
        verify(userRepository, times(1)).save(any(User.class));
        verify(requestRepository, times(1)).save(savedRequest);
    }
}
