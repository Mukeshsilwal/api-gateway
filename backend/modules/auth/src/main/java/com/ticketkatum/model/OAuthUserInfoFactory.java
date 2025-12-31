package com.ticketkatum.model;

import java.util.Map;

public class OAuthUserInfoFactory {

    public static OAuthUserInfo getOAuthUserInfo(String registrationId, Map<String, Object> attributes) {
        if ("google".equalsIgnoreCase(registrationId)) {
            return new GoogleOAuthUserInfo(attributes);
        }
        throw new IllegalArgumentException("Unsupported OAuth provider: " + registrationId);
    }
}
