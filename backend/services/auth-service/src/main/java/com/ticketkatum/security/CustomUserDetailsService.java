package com.ticketkatum.security;

import com.ticketkatum.entity.AdminUser;
import com.ticketkatum.entity.User;
import com.ticketkatum.enums.Role;
import com.ticketkatum.repository.AdminRepo;
import com.ticketkatum.repository.UserRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepo userRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        log.info("Authenticating user: {}", username);

        User user = userRepo.findByEmail(username).
                orElse(null);


            log.info("User found in Users table: {}", username);

            return org.springframework.security.core.userdetails.User.builder()
                    .username(user.getUsername())
                    .password(user.getPassword())
                    .disabled(!user.isEnabled())
                    .authorities(user.getAuthorities())
                    .build();
    }

}
