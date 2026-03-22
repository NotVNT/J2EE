package com.example.moneymanager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BudgetStatusDTO {
    private boolean hasBudget;
    private boolean isExceeded;
    private boolean isWarning;
    private double usageRatio;
    private BigDecimal amountLimit;
    private BigDecimal totalSpent;
    private String categoryName;
}
