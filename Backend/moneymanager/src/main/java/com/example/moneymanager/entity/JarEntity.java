package com.example.moneymanager.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "tbl_jars", indexes = {
    @Index(name = "idx_jar_profile_id", columnList = "profile_id")
})
public class JarEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String icon;
    
    private String color;

    @Column(precision = 5, scale = 2)
    private BigDecimal targetPercentage;

    @Column(precision = 19, scale = 2)
    private BigDecimal currentBalance;

    @Column(updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private ProfileEntity profile;
    
    @PrePersist
    public void prePersist() {
        if (this.currentBalance == null) {
            this.currentBalance = BigDecimal.ZERO;
        }
        if (this.targetPercentage == null) {
            this.targetPercentage = BigDecimal.ZERO;
        }
    }
}
