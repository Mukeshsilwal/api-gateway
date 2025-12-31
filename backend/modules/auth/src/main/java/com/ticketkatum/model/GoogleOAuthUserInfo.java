package com.ticketkatum.model;

import java.util.Map;

public class GoogleOAuthUserInfo implements OAuthUserInfo {
    private final Map<String, Object> attributes;

    public GoogleOAuthUserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @Override
    public String getProviderId() {
        return (String) attributes.get("sub");
    }

    @Override
    public String getEmail() {
        return (String) attributes.get("email");
    }

    @Override
    public String getFirstName() {
        return (String) attributes.get("given_name");
    }

    @Override
    public String getLastName() {
        return (String) attributes.get("family_name");
    }

    @Override
    public String getProfileImageUrl() {
        return (String) attributes.get("picture");
    }

    @Override
    public Boolean getEmailVerified() {
        return (Boolean) attributes.get("email_verified");
    }

    @Override
    public String getProvider() {
        return "GOOGLE";
    }
}
