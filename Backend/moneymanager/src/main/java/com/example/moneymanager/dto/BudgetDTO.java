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
public class BudgetDTO {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private BigDecimal amountLimit;
    private BigDecimal totalSpent;
    private Integer month;
    private Integer year;
}
