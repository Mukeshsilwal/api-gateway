package com.ticketkatum.service.serviceimpl;

import com.ticketkatum.entity.User;
import com.ticketkatum.entity.Role;
import com.ticketkatum.repository.RoleRepository;
import com.ticketkatum.exception.DuplicateResourceException;
import com.ticketkatum.exception.ResourceNotFoundException;
import com.ticketkatum.model.CreateUserRequest;
import com.ticketkatum.model.UpdateUserRequest;
import com.ticketkatum.model.UserDto;
import com.ticketkatum.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepo userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        log.info("Creating user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User with email already exists: " + request.getEmail());
        }

        Role role = roleRepository.findByName(request.getRole())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + request.getRole()));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(java.util.Set.of(role))
                .organizationName(request.getOrganizationName())
                .enabled(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .createdAt(LocalDateTime.now())
                .build();

        user = userRepository.save(user);
        log.info("User created with ID: {}", user.getId());

        return mapToDto(user);
    }

    public UserDto getUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return mapToDto(user);
    }

    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return mapToDto(user);
    }

    public org.springframework.data.domain.Page<UserDto> getAllUsers(int page, int size, String role) {
        org.springframework.data.domain.Page<User> usersPage;
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);

        if (role != null && !role.isEmpty()) {
            // Note: UserRepo needs to support pagination for this method
            // If not supported yet, we might need to filter in memory or update repo
            // For now, assuming we update repository or just implement getAll for existing
            // repo
            usersPage = userRepository.findAll(pageable); // TODO: implement findByRoles_Name with pageable
        } else {
            usersPage = userRepository.findAll(pageable);
        }

        return usersPage.map(this::mapToDto);
    }

    @Transactional
    public UserDto updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getOrganizationName() != null) {
            user.setOrganizationName(request.getOrganizationName());
        }
        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }
        if (request.getAccountNonLocked() != null) {
            user.setAccountNonLocked(request.getAccountNonLocked());
        }

        user.setUpdatedAt(LocalDateTime.now());
        user = userRepository.save(user);

        log.info("User updated: {}", id);
        return mapToDto(user);
    }

    @Transactional
    public void updateCredentialsStatus(String email, boolean nonExpired) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        user.setCredentialsNonExpired(nonExpired);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("Updated credentials status for user: {}", email);
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found: " + id);
        }
        userRepository.deleteById(id);
        log.info("User deleted: {}", id);
    }

    /**
     * Create OAuth2 user (no password required)
     */
    @Transactional
    public UserDto createOAuth2User(CreateUserRequest request) {
        log.info("Creating OAuth2 user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User with email already exists: " + request.getEmail());
        }

        Role role = roleRepository.findByName(request.getRole())
                .orElseGet(() -> roleRepository.save(Role.builder().name(request.getRole()).build()));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .password(null) // No password for OAuth2 users
                .roles(java.util.Set.of(role))
                .provider(request.getProvider())
                .enabled(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true) // OAuth2 users don't need password change
                .createdAt(LocalDateTime.now())
                .build();

        user = userRepository.save(user);
        log.info("OAuth2 user created with ID: {}", user.getId());

        return mapToDto(user);
    }

    /**
     * Update user provider
     */
    @Transactional
    public void updateUserProvider(Long id, String provider) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        user.setProvider(provider);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("Updated provider for user {}: {}", id, provider);
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toList()))
                .role(user.getRoles().stream().findFirst().map(Role::getName).orElse(null))
                .organizationName(user.getOrganizationName())
                .enabled(user.getEnabled())
                .accountNonLocked(user.getAccountNonLocked())
                .credentialsNonExpired(user.getCredentialsNonExpired())
                .build();
    }
}
