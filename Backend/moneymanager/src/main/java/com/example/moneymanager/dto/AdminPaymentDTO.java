package com.example.moneymanager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdminPaymentDTO {
    private Long orderCode;
    private Long amount;
    private String description;
    private String status;
    private String planId;
    private String planName;
    private Integer cycleMonths;
    private String payerEmail;
    private String payerName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
