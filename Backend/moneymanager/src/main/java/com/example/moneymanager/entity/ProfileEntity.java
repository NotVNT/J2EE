package com.example.moneymanager.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tbl_profiles")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProfileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fullName;
    @Column(unique = true)
    private String email;
    private String password;
    private String profileImageUrl;
    @Column(updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    private Boolean isActive;
    private String activationToken;
    private String resetPasswordToken;
    private LocalDateTime resetPasswordTokenExpiry;
    @Enumerated(EnumType.STRING)
    private SubscriptionPlan subscriptionPlan;
    @Enumerated(EnumType.STRING)
    private SubscriptionStatus subscriptionStatus;
    private LocalDate subscriptionActivatedAt;
    private LocalDate subscriptionExpiresAt;
    private Boolean autoRenew;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private RoleEntity role;

    @PrePersist
    public void prePersist() {
        if (this.isActive == null) {
            isActive = false;
        }
        if (this.subscriptionPlan == null) {
            subscriptionPlan = SubscriptionPlan.FREE;
        }
        if (this.subscriptionStatus == null) {
            subscriptionStatus = SubscriptionStatus.INACTIVE;
        }
        if (this.autoRenew == null) {
            autoRenew = false;
        }
        if (this.role == null) {
            this.role = RoleEntity.builder().id(2L).name("user").build();
        }
    }
}