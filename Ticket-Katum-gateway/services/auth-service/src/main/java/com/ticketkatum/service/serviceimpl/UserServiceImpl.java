package com.ticketkatum.service.serviceimpl;

import com.ticketkatum.entity.AdminUser;
import com.ticketkatum.entity.Users;
import com.ticketkatum.enums.ResetPassword;
import com.ticketkatum.enums.Role;
import com.ticketkatum.model.ChangePasswordRequest;
import com.ticketkatum.model.User;
import com.ticketkatum.model.UserDto;
import com.ticketkatum.repository.AdminRepo;
import com.ticketkatum.repository.UserRepo;
import com.ticketkatum.service.UserService;
import com.ticketkatum.service.OtpGeneratorService;
import com.ticketkatum.utils.ValidationUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    private final UserRepo userRepo;
    private final ModelMapper modelMapper;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final OtpGeneratorService otpGeneratorService;
    private final AdminRepo adminRepo;

    @Override
    @Transactional
    public UserDto createUser(UserDto userDto) {
        ValidationUtils.requireNonNull(userDto, "UserDto");
        ValidationUtils.validateEmail(userDto.getUsername());
        ValidationUtils.requireNonEmpty(userDto.getPassword(), "Password");

        log.info("Creating user with email: {}", userDto.getUsername());

        if (userRepo.existsByEmail(userDto.getUsername())) {
            log.warn("User creation failed - email already exists: {}", userDto.getUsername());
            throw new RuntimeException("User Already Registered!");
        }

        Users user = new Users();
        user.setRole(userDto.getRole() == null ? Role.USER : userDto.getRole());
        user.setEmail(userDto.getUsername());
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));

        Users savedUser = this.userRepo.save(user);
        log.info("User created successfully: {}", savedUser.getEmail());

        return userToDto(savedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Integer id) {
        ValidationUtils.requireNonNull(id, "User ID");
        log.info("Deleting user with ID: {}", id);

        Users user = this.userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        this.userRepo.delete(user);
        log.info("User deleted successfully: {}", id);
    }

    @Override
    @Transactional
    public UserDto updateUser(UserDto userDto, Integer id) {
        ValidationUtils.requireNonNull(userDto, "UserDto");
        ValidationUtils.requireNonNull(id, "User ID");
        ValidationUtils.validateEmail(userDto.getUsername());

        log.info("Updating user with ID: {}", id);

        Users user = this.userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException());

        user.setId(userDto.getId1());
        user.setEmail(userDto.getUsername());

        if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        }

        Users updatedUser = this.userRepo.save(user);
        log.info("User updated successfully: {}", updatedUser.getEmail());

        return userToDto(updatedUser);
    }

    @Override
    public UserDto getUserById(Integer id) {
        ValidationUtils.requireNonNull(id, "User ID");
        log.debug("Fetching user with ID: {}", id);

        Users user = this.userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException());

        return userToDto(user);
    }

    @Override
    public List<UserDto> getAllUser() {
        log.debug("Fetching all users");
        List<Users> users = this.userRepo.findAll();
        return users.stream().map(this::userToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest req) {
        ValidationUtils.requireNonNull(req, "ChangePasswordRequest");
        ValidationUtils.requireNonEmpty(req.getUsername(), "Username");
        ValidationUtils.requireNonEmpty(req.getNewPassword(), "New Password");
        ValidationUtils.requireNonEmpty(req.getConfirmPassword(), "Confirm Password");
        ValidationUtils.requirePasswordsMatch(req.getNewPassword(), req.getConfirmPassword());

        log.info("Password change request for user: {}", req.getUsername());

        Users appUser = null;
        AdminUser adminUser = null;
        boolean isAdmin = false;

        try {
            appUser = userRepo.findByEmailAndRole(req.getUsername(), Role.USER).orElse(null);
            adminUser = adminRepo.findByUsername(req.getUsername()).orElse(null);
        } catch (Exception e) {
            log.error("Error fetching user for password change: {}", req.getUsername(), e);
            throw new BadCredentialsException("Error processing password change request");
        }

        if (appUser == null && adminUser == null) {
            log.warn("Password change failed - user not found: {}", req.getUsername());
            throw new BadCredentialsException("User not found");
        }

        isAdmin = (adminUser != null);
        String storedPassword = isAdmin ? adminUser.getPassword() : appUser.getPassword();
        String storedOtp = isAdmin ? adminUser.getOtp() : appUser.getOtp();

        if (req.getResetPassword() == ResetPassword.CHANGE_PASSWORD) {
            ValidationUtils.requireNonEmpty(req.getOldPassword(), "Old Password");

            if (!passwordEncoder.matches(req.getOldPassword(), storedPassword)) {
                log.warn("Password change failed - incorrect old password for user: {}", req.getUsername());
                throw new BadCredentialsException("Old password is incorrect");
            }

            if (isAdmin) {
                adminUser.setPassword(passwordEncoder.encode(req.getNewPassword()));
                adminRepo.save(adminUser);
                log.info("Admin password changed successfully: {}", req.getUsername());
            } else {
                appUser.setPassword(passwordEncoder.encode(req.getNewPassword()));
                userRepo.save(appUser);
                log.info("User password changed successfully: {}", req.getUsername());
            }

            return;
        }

        if (req.getResetPassword() == ResetPassword.RESET_PASSWORD) {
            ValidationUtils.requireNonEmpty(req.getOtp(), "OTP");

            if (!Objects.equals(storedOtp, req.getOtp())) {
                log.warn("Password reset failed - invalid OTP for user: {}", req.getUsername());
                throw new BadCredentialsException("Invalid OTP");
            }

            if (isAdmin) {
                adminUser.setPassword(passwordEncoder.encode(req.getNewPassword()));
                adminUser.setOtp(null);
                adminRepo.save(adminUser);
                log.info("Admin password reset successfully: {}", req.getUsername());
            } else {
                appUser.setPassword(passwordEncoder.encode(req.getNewPassword()));
                appUser.setOtp(null);
                userRepo.save(appUser);
                log.info("User password reset successfully: {}", req.getUsername());
            }

            return;
        }

        log.error("Invalid password reset mode: {}", req.getResetPassword());
        throw new BadCredentialsException("Invalid password reset mode");
    }

    @Override
    public void sentOtp(User userJson) {
        ValidationUtils.requireNonNull(userJson, "User");
        ValidationUtils.requireNonEmpty(userJson.getUsername(), "Username");
        ValidationUtils.validateEmail(userJson.getUsername());

        String email = userJson.getUsername();
        String otp = otpGeneratorService.generateOTP();

        log.info("Sending OTP to user: {}", email);

        try {
            emailService.sendEmailForOtp(
                    email,
                    "OTP for Password Reset",
                    "Please use this OTP to reset your password: " + otp);

            userRepo.findByEmailAndRole(email, Role.USER).ifPresent(user -> {
                user.setOtp(otp);
                userRepo.save(user);
                log.debug("OTP saved for user: {}", email);
            });

            adminRepo.findByUsername(email).ifPresent(admin -> {
                admin.setOtp(otp);
                adminRepo.save(admin);
                log.debug("OTP saved for admin: {}", email);
            });

            log.info("OTP sent successfully to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send OTP to: {}", email, e);
            throw new RuntimeException("Failed to send OTP. Please try again later.");
        }
    }

    private Users dtoToUser(UserDto userDto) {
        return this.modelMapper.map(userDto, Users.class);
    }

    private UserDto userToDto(Users user) {
        return this.modelMapper.map(user, UserDto.class);
    }

}
