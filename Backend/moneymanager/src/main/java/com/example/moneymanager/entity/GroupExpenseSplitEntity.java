package com.example.moneymanager.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "tbl_group_expense_splits")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GroupExpenseSplitEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_expense_id", nullable = false)
    private GroupExpenseEntity groupExpense;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private ProfileEntity member;

    @Column(nullable = false)
    private BigDecimal amount;

    @Builder.Default
    private Boolean isPaid = false;
}
