package com.example.moneymanager.dto;

import com.example.moneymanager.entity.enums.RecurrenceFrequency;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecurringTransactionDTO {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String type; // "EXPENSE" or "INCOME"
    private String name;
    private String description;
    private String icon;
    private BigDecimal amount;
    private RecurrenceFrequency frequency;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate nextRunDate;
    private Boolean isActive;
}
