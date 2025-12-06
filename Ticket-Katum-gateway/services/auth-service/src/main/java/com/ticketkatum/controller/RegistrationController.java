package com.ticketkatum.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.ticketkatum.model.AdminRegistrationRequestDto;
import com.ticketkatum.model.ChangePasswordRequest;
import com.ticketkatum.model.User;
import com.ticketkatum.service.RegistrationService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/register")
@AllArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping(value = "/admin", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> registerAdmin(@ModelAttribute AdminRegistrationRequestDto dto) {
        registrationService.registerAdmin(dto);
        return ResponseEntity.ok("Request submitted.");
    }

    @PostMapping(
            value = "/approve/{id}",
            consumes = MediaType.ALL_VALUE
    )
    public ResponseEntity<?> approveAdmin(@PathVariable Long id) {
        registrationService.approveRequest(id);
        return ResponseEntity.ok("Admin approved and credentials emailed.");
    }

    @PostMapping("/change-password")
    public ResponseEntity<HttpStatus> changePassword(@RequestBody ChangePasswordRequest passwordRequest) {
        this.registrationService.changePassword(passwordRequest);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/sent-otp")
    public ResponseEntity<HttpStatus> sentOpt(@RequestBody User username) throws JsonProcessingException {
        this.registrationService.sentOtp(username);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/all-requests")
    public ResponseEntity<List<AdminRegistrationRequestDto>> getAllUsers() {
        List<AdminRegistrationRequestDto> requests = registrationService.getAllRequests();
        return ResponseEntity.ok(requests);
    }


}
