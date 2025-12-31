package com.ticketkatum.service;

import com.ticketkatum.entity.Role;
import com.ticketkatum.entity.User;
import com.ticketkatum.model.OAuthUserInfo;
import com.ticketkatum.model.OAuthUserInfoFactory;
import com.ticketkatum.repository.RoleRepository;
import com.ticketkatum.repository.UserRepo;
import com.ticketkatum.security.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepo userRepository;
    private final RoleRepository roleRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuthUserInfo oAuthUserInfo = OAuthUserInfoFactory.getOAuthUserInfo(
                registrationId,
                oAuth2User.getAttributes());

        // Check if user exists by provider and providerId
        Optional<User> existingUser = userRepository.findByProviderAndProviderId(
                oAuthUserInfo.getProvider(),
                oAuthUserInfo.getProviderId());

        User user;
        if (existingUser.isPresent()) {
            // Update existing user
            user = updateExistingUser(existingUser.get(), oAuthUserInfo);
            log.info("Existing OAuth user logged in: {}", user.getEmail());
        } else {
            // Check if email already exists (user might have registered with password)
            Optional<User> userByEmail = userRepository.findByEmail(oAuthUserInfo.getEmail());

            if (userByEmail.isPresent()) {
                // Link OAuth account to existing user
                user = linkOAuthToExistingUser(userByEmail.get(), oAuthUserInfo);
                log.info("Linked OAuth account to existing user: {}", user.getEmail());
            } else {
                // Create new user
                user = createNewOAuthUser(oAuthUserInfo);
                log.info("New OAuth user registered: {}", user.getEmail());
            }
        }

        return new CustomOAuth2User(user, oAuth2User.getAttributes());
    }

    private User updateExistingUser(User user, OAuthUserInfo oAuthUserInfo) {
        user.setFirstName(oAuthUserInfo.getFirstName());
        user.setLastName(oAuthUserInfo.getLastName());
        user.setProfileImageUrl(oAuthUserInfo.getProfileImageUrl());
        user.setEmailVerified(oAuthUserInfo.getEmailVerified());
        return userRepository.save(user);
    }

    private User linkOAuthToExistingUser(User user, OAuthUserInfo oAuthUserInfo) {
        user.setProvider(oAuthUserInfo.getProvider());
        user.setProviderId(oAuthUserInfo.getProviderId());
        user.setProfileImageUrl(oAuthUserInfo.getProfileImageUrl());
        user.setEmailVerified(oAuthUserInfo.getEmailVerified());
        return userRepository.save(user);
    }

    private User createNewOAuthUser(OAuthUserInfo oAuthUserInfo) {
        // Get default USER role
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Default role not found"));

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);

        User newUser = User.builder()
                .email(oAuthUserInfo.getEmail())
                .firstName(oAuthUserInfo.getFirstName())
                .lastName(oAuthUserInfo.getLastName())
                .provider(oAuthUserInfo.getProvider())
                .providerId(oAuthUserInfo.getProviderId())
                .profileImageUrl(oAuthUserInfo.getProfileImageUrl())
                .emailVerified(oAuthUserInfo.getEmailVerified())
                .password("") // No password for OAuth users
                .roles(roles)
                .enabled(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .build();

        return userRepository.save(newUser);
    }
}
