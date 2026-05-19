package com.example.moneymanager.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "tbl_income_allocations", indexes = {
    @Index(name = "idx_alloc_income_id", columnList = "income_id"),
    @Index(name = "idx_alloc_jar_id", columnList = "jar_id")
})
public class IncomeAllocationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "income_id", nullable = false)
    private IncomeEntity income;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jar_id", nullable = false)
    private JarEntity jar;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
}
