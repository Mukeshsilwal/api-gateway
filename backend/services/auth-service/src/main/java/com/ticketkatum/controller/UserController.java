package com.ticketkatum.controller;

import com.ticketkatum.model.CreateUserRequest;
import com.ticketkatum.model.UpdateUserRequest;
import com.ticketkatum.model.UserDto;
import com.ticketkatum.service.serviceimpl.UserService;
import com.ticketkatum.utils.Response;
import com.ticketkatum.utils.ResponseHandler;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<Response<UserDto>> createUser(@Valid @RequestBody CreateUserRequest request) {
        log.info("Creating user: {}", request.getEmail());
        UserDto user = userService.createUser(request);
        Response<UserDto> response = ResponseHandler.success(
                "User registered successfully",
                user
        );
        return  ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUser(id));
    }

    @GetMapping("/by-email")
    public ResponseEntity<UserDto> getUserByEmail(@RequestParam String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers(
            @RequestParam(required = false) String role) {
        return ResponseEntity.ok(userService.getAllUsers(role));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @PutMapping("/{email}/credentials-status")
    public ResponseEntity<Void> updateUserCredentialsStatus(
            @PathVariable String email,
            @RequestParam boolean nonExpired) {
        userService.updateCredentialsStatus(email, nonExpired);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
}