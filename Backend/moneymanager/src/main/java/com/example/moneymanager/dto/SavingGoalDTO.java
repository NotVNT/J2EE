package com.example.moneymanager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SavingGoalDTO {
    private Long id;
    private String name;
    private BigDecimal targetAmount;
    private BigDecimal currentAmount;
    private BigDecimal remainingAmount;
    private Double progressPercent;
    private BigDecimal monthlyTarget;
    private BigDecimal monthlyContributed;
    private Double monthlyProgressPercent;
    private Boolean isBehindSchedule;
    private LocalDate startDate;
    private LocalDate targetDate;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
