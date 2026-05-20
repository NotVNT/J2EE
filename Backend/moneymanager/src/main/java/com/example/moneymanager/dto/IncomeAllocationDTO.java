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
public class IncomeAllocationDTO {
    private Long id;
    private Long incomeId;
    private Long jarId;
    private String jarName;
    private BigDecimal amount;
}
