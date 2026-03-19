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
public class CreatePaymentResponseDTO {

    private Long orderCode;
    private Long amount;
    private String description;
    private String status;
    private String paymentLinkId;
    private String checkoutUrl;
    private String planId;
    private String planName;
    private Integer cycleMonths;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
