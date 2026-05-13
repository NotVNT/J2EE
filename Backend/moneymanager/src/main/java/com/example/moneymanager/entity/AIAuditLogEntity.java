package com.example.moneymanager.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tbl_ai_audit_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIAuditLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "profile_id", nullable = false)
    private Long profileId;

    @Column(nullable = false)
    private String intent;

    @Column(name = "original_message", length = 2000)
    private String originalMessage;

    @Column(name = "extracted_data", length = 2000)
    private String extractedData;

    @Column(name = "executed_data", length = 2000)
    private String executedData;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AuditStatus status;

    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public enum AuditStatus {
        SUCCESS, VALIDATION_FAILED, EXECUTION_FAILED, ROLLED_BACK
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
