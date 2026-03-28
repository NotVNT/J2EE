package com.example.moneymanager.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tbl_transaction_otps")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TransactionOtpEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String actionType;

    @Column(nullable = false, length = 255)
    private String payloadHash;

    @Column(nullable = false, length = 255)
    private String otpCodeHash;

    @Column(nullable = false)
    private LocalDateTime otpExpiresAt;

    @Column(nullable = false)
    private LocalDateTime resendAvailableAt;

    @Column(nullable = false)
    private Integer failedAttempts;

    private LocalDateTime verifiedAt;

    @Column(unique = true, length = 120)
    private String transactionAuthorizationToken;

    private LocalDateTime authorizationExpiresAt;

    private LocalDateTime consumedAt;

    private LocalDateTime revokedAt;

    @Column(updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private ProfileEntity profile;
}
