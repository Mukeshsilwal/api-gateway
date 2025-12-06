package com.ticketkatum.security;

import com.ticketkatum.entity.AdminUser;
import com.ticketkatum.entity.Users;
import com.ticketkatum.enums.Role;
import com.ticketkatum.repository.AdminRepo;
import com.ticketkatum.repository.UserRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private AdminRepo adminRepo;
    @Autowired
    private UserRepo userRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        log.info("Authenticating user: {}", username);

        AdminUser adminUser = adminRepo.findByUsername(username).
        orElse(null);


        if (adminUser != null) {
            log.info("User found in Users table: {}", username);

            return User.builder()
                    .username(adminUser.getUsername())
                    .password(adminUser.getPassword())
                    .disabled(!adminUser.isEnabled())
                    .authorities(adminUser.getAuthorities())
                    .build();
        }

        // 🔹 First search normal users
        Users appUser = userRepo.findByEmailAndRole(username, Role.USER).orElse(null);


        return User.builder()
                .username(appUser.getUsername())
                .password(appUser.getPassword())
                .disabled(!appUser.isEnabled())
                .authorities(appUser.getAuthorities())
                .build();
    }
}
