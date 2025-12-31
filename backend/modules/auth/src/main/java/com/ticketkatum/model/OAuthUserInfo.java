package com.ticketkatum.model;

public interface OAuthUserInfo {
    String getProviderId();

    String getEmail();

    String getFirstName();

    String getLastName();

    String getProfileImageUrl();

    Boolean getEmailVerified();

    String getProvider();
}
