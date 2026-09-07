package com.ticketkatum.configs;

import com.ticketkatum.entity.Permission;
import com.ticketkatum.entity.Role;
import com.ticketkatum.repository.PermissionRepository;
import com.ticketkatum.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final com.ticketkatum.repository.UserRepo userRepo;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        initializePermissionsAndRoles();
        initializeDefaultAdmin();
    }

    private void initializePermissionsAndRoles() {
        log.info("Initializing Permissions and Roles...");

        // Permissions
        Permission pBookTicket = createPermissionIfNotFound("BOOK_TICKET", "Allows booking of tickets");
        Permission pViewEvents = createPermissionIfNotFound("VIEW_ALL_EVENTS", "Allows viewing of events");

        Permission pCreateEvent = createPermissionIfNotFound("CREATE_EVENT", "Allows creation of events");
        Permission pManageEvent = createPermissionIfNotFound("MANAGE_EVENT", "Allows managing events");
        Permission pViewBookings = createPermissionIfNotFound("VIEW_BOOKINGS", "Allows viewing bookings");

        Permission pManageUsers = createPermissionIfNotFound("MANAGE_USERS", "Allows managing users");
        Permission pManageRoles = createPermissionIfNotFound("MANAGE_ROLES", "Allows managing roles");

        Permission pManageRefunds = createPermissionIfNotFound("MANAGE_REFUNDS", "Allows managing refunds");

        // Roles
        createRoleIfNotFound("USER", "Standard User", new HashSet<>(Arrays.asList(pBookTicket, pViewEvents)));
        createRoleIfNotFound("ORGANIZER", "Event Organizer",
                new HashSet<>(Arrays.asList(pCreateEvent, pManageEvent, pViewBookings)));
        createRoleIfNotFound("ADMIN", "Administrator", new HashSet<>(
                Arrays.asList(pManageUsers, pManageRoles, pViewBookings, pViewEvents, pCreateEvent, pManageEvent)));
        createRoleIfNotFound("SUPER_ADMIN", "Super Administrator", new HashSet<>(
                Arrays.asList(pManageUsers, pManageRoles, pViewBookings, pViewEvents, pCreateEvent, pManageEvent, pManageRefunds)));
        createRoleIfNotFound("SUPPORT", "Customer Support",
                new HashSet<>(Arrays.asList(pViewBookings, pManageRefunds)));

        log.info("Permissions and Roles initialized.");
    }

    private void initializeDefaultAdmin() {
        Role adminRole = roleRepository.findByName("ADMIN").orElse(null);
        Role superAdminRole = roleRepository.findByName("SUPER_ADMIN").orElse(null);
        Role userRole = roleRepository.findByName("USER").orElse(null);

        Set<Role> adminRoles = new HashSet<>();
        if (adminRole != null) adminRoles.add(adminRole);
        if (superAdminRole != null) adminRoles.add(superAdminRole);
        if (userRole != null) adminRoles.add(userRole);

        // 1. Ensure admin@ticketkatum.com exists
        if (!userRepo.existsByEmail("admin@ticketkatum.com")) {
            com.ticketkatum.entity.User defaultAdmin = com.ticketkatum.entity.User.builder()
                    .firstName("Super")
                    .lastName("Admin")
                    .email("admin@ticketkatum.com")
                    .phoneNumber("9800000001")
                    .password(passwordEncoder.encode("Admin123!"))
                    .roles(adminRoles)
                    .enabled(true)
                    .accountNonLocked(true)
                    .credentialsNonExpired(true)
                    .createdAt(java.time.LocalDateTime.now())
                    .build();

            userRepo.save(defaultAdmin);
            log.info("✅ Default admin user created: admin@ticketkatum.com / Admin123!");
        }

        // 2. Ensure testuser@ticketkatum.com has ADMIN role
        userRepo.findByEmail("testuser@ticketkatum.com").ifPresent(user -> {
            if (adminRole != null && (user.getRoles() == null || !user.getRoles().contains(adminRole))) {
                Set<Role> roles = new HashSet<>(user.getRoles() != null ? user.getRoles() : Set.of());
                roles.add(adminRole);
                if (superAdminRole != null) roles.add(superAdminRole);
                user.setRoles(roles);
                userRepo.save(user);
                log.info("✅ Granted ADMIN role to testuser@ticketkatum.com");
            }
        });

        // 3. Ensure mukeshsilwal05@gmail.com has ADMIN role if present
        userRepo.findByEmail("mukeshsilwal05@gmail.com").ifPresent(user -> {
            if (adminRole != null && (user.getRoles() == null || !user.getRoles().contains(adminRole))) {
                Set<Role> roles = new HashSet<>(user.getRoles() != null ? user.getRoles() : Set.of());
                roles.add(adminRole);
                if (superAdminRole != null) roles.add(superAdminRole);
                user.setRoles(roles);
                userRepo.save(user);
                log.info("✅ Granted ADMIN role to mukeshsilwal05@gmail.com");
            }
        });
    }

    private Permission createPermissionIfNotFound(String name, String description) {
        return permissionRepository.findByName(name)
                .orElseGet(() -> {
                    Permission permission = Permission.builder()
                            .name(name)
                            .description(description)
                            .build();
                    return permissionRepository.save(permission);
                });
    }

    private Role createRoleIfNotFound(String name, String description, Set<Permission> permissions) {
        return roleRepository.findByName(name)
                .orElseGet(() -> {
                    Role role = Role.builder()
                            .name(name)
                            .description(description)
                            .permissions(permissions)
                            .build();
                    return roleRepository.save(role);
                });
    }
}
