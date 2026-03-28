package com.example.moneymanager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TransactionOtpRequestDTO {

    private String actionType;
    private Long expenseId;
    private Long incomeId;
    private Long goalId;
    private String name;
    private Long categoryId;
    private BigDecimal amount;
    private LocalDate date;
    private String note;
}
