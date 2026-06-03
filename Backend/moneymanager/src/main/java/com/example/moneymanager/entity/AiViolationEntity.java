package com.example.moneymanager.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

import java.time.LocalDateTime;

@Entity
@Table(name = "tbl_ai_violations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiViolationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private ProfileEntity profile;

    @Enumerated(EnumType.STRING)
    @Column(name = "violation_type", nullable = false)
    private ViolationType violationType;

    @Column(name = "violation_score", nullable = false)
    private Integer violationScore;

    @Column(name = "message_snippet", length = 500)
    private String messageSnippet;

    @Column(nullable = false, length = 100)
    private String source;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum ViolationType {
        INJECTION,
        SEXUAL_CONTENT,
        VIOLENCE_HATE,
        HARMFUL_CONTENT,
        POLITICAL,
        MEDICAL_DIAGNOSIS,
        UNHEALTHY_CONTENT,
        SELF_HARM
    }
}
