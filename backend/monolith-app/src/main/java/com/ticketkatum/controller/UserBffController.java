package com.ticketkatum.controller;

import com.ticketkatum.client.UserServiceClient;
import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.RestResponsePage;
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
@RequestMapping("/api/bff/v1/admin/users")
@RequiredArgsConstructor
public class UserBffController {

        private final UserServiceClient userServiceClient;

        /**
         * Get all users with optional role filter
         */
        @GetMapping
        public CompletableFuture<ResponseEntity<Response<RestResponsePage<UserDto>>>> getAllUsers(
                        @RequestParam(name = "page", defaultValue = "0") int page,
                        @RequestParam(name = "size", defaultValue = "10") int size,
                        @RequestParam(name = "role", required = false) String role) {
                log.info("Fetching users page: {}, size: {}, role: {}", page, size, role);

                return userServiceClient.getAllUsers(page, size, role)
                                .thenApply(usersPage -> {
                                        Response<RestResponsePage<UserDto>> response = Response
                                                        .<RestResponsePage<UserDto>>builder()
                                                        .statusCode(200)
                                                        .message("Users retrieved successfully")
                                                        .data(usersPage)
                                                        .build();
                                        return ResponseEntity.ok(response);
                                })
                                .exceptionally(ex -> {
                                        log.error("Error fetching users", ex);
                                        Response<RestResponsePage<UserDto>> response = Response
                                                        .<RestResponsePage<UserDto>>builder()
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
         * Get all available roles
         */
        @GetMapping("/roles")
        public CompletableFuture<ResponseEntity<Response<java.util.List<com.ticketkatum.dto.auth.RoleDto>>>> getRoles() {
                log.info("Fetching all roles");

                return userServiceClient.getRoles()
                                .thenApply(roles -> {
                                        Response<java.util.List<com.ticketkatum.dto.auth.RoleDto>> response = Response.<java.util.List<com.ticketkatum.dto.auth.RoleDto>>builder()
                                                        .statusCode(200)
                                                        .message("Roles retrieved successfully")
                                                        .data(roles)
                                                        .build();
                                        return ResponseEntity.ok(response);
                                })
                                .exceptionally(ex -> {
                                        log.error("Error fetching roles", ex);
                                        Response<java.util.List<com.ticketkatum.dto.auth.RoleDto>> response = Response.<java.util.List<com.ticketkatum.dto.auth.RoleDto>>builder()
                                                        .statusCode(500)
                                                        .message("Failed to fetch roles: " + ex.getMessage())
                                                        .build();
                                        return ResponseEntity.status(500).body(response);
                                });
        }

        @PostMapping
        public CompletableFuture<ResponseEntity<Response<UserDto>>> createUser(
                        @RequestBody com.ticketkatum.dto.request.CreateUserRequest request) {
                log.info("Creating user: {}", request.getEmail());

                return userServiceClient.createUser(request)
                                .thenApply(user -> {
                                        Response<UserDto> response = Response.<UserDto>builder()
                                                        .statusCode(201)
                                                        .message("User created successfully")
                                                        .data(user)
                                                        .build();
                                        return ResponseEntity.status(201).body(response);
                                })
                                .exceptionally(ex -> {
                                        log.error("Error creating user", ex);
                                        Response<UserDto> response = Response.<UserDto>builder()
                                                        .statusCode(500)
                                                        .message("Failed to create user: " + ex.getMessage())
                                                        .build();
                                        return ResponseEntity.status(500).body(response);
                                });
        }

        /**
         * Update user
         */
        @PutMapping("/{id}")
        public CompletableFuture<ResponseEntity<Response<UserDto>>> updateUser(
                        @PathVariable Integer id,
                        @RequestBody com.ticketkatum.dto.request.UpdateUserRequest request) {
                log.info("Updating user: {}", id);

                return userServiceClient.updateUser(id, request)
                                .thenApply(user -> {
                                        Response<UserDto> response = Response.<UserDto>builder()
                                                        .statusCode(200)
                                                        .message("User updated successfully")
                                                        .data(user)
                                                        .build();
                                        return ResponseEntity.ok(response);
                                })
                                .exceptionally(ex -> {
                                        log.error("Error updating user", ex);
                                        Response<UserDto> response = Response.<UserDto>builder()
                                                        .statusCode(500)
                                                        .message("Failed to update user: " + ex.getMessage())
                                                        .build();
                                        return ResponseEntity.status(500).body(response);
                                });
        }

        /**
         * Delete user
         */
        @DeleteMapping("/{id}")
        public CompletableFuture<ResponseEntity<Response<Void>>> deleteUser(
                        @PathVariable Integer id) {
                log.info("Deleting user: {}", id);

                return userServiceClient.deleteUser(id)
                                .thenApply(v -> {
                                        Response<Void> response = Response.<Void>builder()
                                                        .statusCode(200)
                                                        .message("User deleted successfully")
                                                        .build();
                                        return ResponseEntity.ok(response);
                                })
                                .exceptionally(ex -> {
                                        log.error("Error deleting user", ex);
                                        Response<Void> response = Response.<Void>builder()
                                                        .statusCode(500)
                                                        .message("Failed to delete user: " + ex.getMessage())
                                                        .build();
                                        return ResponseEntity.status(500).body(response);
                                });
        }
}
