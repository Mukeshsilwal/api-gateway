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

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        initializePermissionsAndRoles();
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
        createRoleIfNotFound("SUPPORT", "Customer Support",
                new HashSet<>(Arrays.asList(pViewBookings, pManageRefunds)));

        log.info("Permissions and Roles initialized.");
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
