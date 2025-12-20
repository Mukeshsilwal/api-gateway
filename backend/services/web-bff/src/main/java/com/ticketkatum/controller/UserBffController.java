package com.ticketkatum.controller;

import com.ticketkatum.client.UserServiceClient;
import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.auth.UserDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * User Management BFF Controller
 * Provides user management endpoints for admin panel
 */
@Slf4j
@RestController
@RequestMapping("/api/bff/v1/users")
@RequiredArgsConstructor
public class UserBffController {

    private final UserServiceClient userServiceClient;

    /**
     * Get all users with optional role filter
     */
    @GetMapping
    public CompletableFuture<ResponseEntity<Response<List<UserDto>>>> getAllUsers(
            @RequestParam(required = false) String role) {
        log.info("Fetching all users with role filter: {}", role);

        return userServiceClient.getAllUsers()
                .thenApply(users -> {
                    // Filter by role if provided
                    List<UserDto> filteredUsers = users;
                    if (role != null && !role.isEmpty()) {
                        filteredUsers = users.stream()
                                .filter(user -> user.getRole() != null && user.getRole().contains(role))
                                .toList();
                    }

                    Response<List<UserDto>> response = Response.<List<UserDto>>builder()
                            .statusCode(200)
                            .message("Users retrieved successfully")
                            .data(filteredUsers)
                            .build();
                    return ResponseEntity.ok(response);
                })
                .exceptionally(ex -> {
                    log.error("Error fetching users", ex);
                    Response<List<UserDto>> response = Response.<List<UserDto>>builder()
                            .statusCode(500)
                            .message("Failed to fetch users: " + ex.getMessage())
                            .build();
                    return ResponseEntity.status(500).body(response);
                });
    }

    /**
     * Get user by ID
     */
    @GetMapping("/{id}")
    public CompletableFuture<ResponseEntity<Response<UserDto>>> getUserById(
            @PathVariable Integer id) {
        log.info("Fetching user by ID: {}", id);

        return userServiceClient.getUserById(id)
                .thenApply(user -> {
                    Response<UserDto> response = Response.<UserDto>builder()
                            .statusCode(200)
                            .message("User retrieved successfully")
                            .data(user)
                            .build();
                    return ResponseEntity.ok(response);
                })
                .exceptionally(ex -> {
                    log.error("Error fetching user {}", id, ex);
                    Response<UserDto> response = Response.<UserDto>builder()
                            .statusCode(404)
                            .message("User not found: " + ex.getMessage())
                            .build();
                    return ResponseEntity.status(404).body(response);
                });
    }

    /**
     * Delete user
     */
    @DeleteMapping("/{id}")
    public CompletableFuture<ResponseEntity<Response<Void>>> deleteUser(
            @PathVariable Integer id) {
        log.info("Deleting user: {}", id);

        // Note: UserServiceClient doesn't have deleteUser method yet
        // This is a placeholder for future implementation
        Response<Void> response = Response.<Void>builder()
                .statusCode(501)
                .message("Delete user not implemented yet")
                .build();
        return CompletableFuture.completedFuture(
                ResponseEntity.status(501).body(response));
    }
}
