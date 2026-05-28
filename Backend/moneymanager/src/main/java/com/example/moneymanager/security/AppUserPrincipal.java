package com.example.moneymanager.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

public class AppUserPrincipal extends User {

    private final Long profileId;
    private final String fullName;
    private final String subscriptionPlan;
    private final String subscriptionStatus;
    private final Boolean isActive;
    private final String roleName;

    public AppUserPrincipal(Long profileId, String username, String password, String fullName,
                             Collection<? extends GrantedAuthority> authorities) {
        super(username, password, authorities);
        this.profileId = profileId;
        this.fullName = fullName;
        this.subscriptionPlan = null;
        this.subscriptionStatus = null;
        this.isActive = true;
        this.roleName = "USER";
    }

    public Long getProfileId() { return profileId; }
    public String getFullName() { return fullName; }
    public String getSubscriptionPlan() { return subscriptionPlan; }
    public String getSubscriptionStatus() { return subscriptionStatus; }
    public Boolean getIsActive() { return isActive; }
    public String getRoleName() { return roleName; }
}