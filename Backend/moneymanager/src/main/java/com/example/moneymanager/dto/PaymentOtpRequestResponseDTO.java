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
public class PaymentOtpRequestResponseDTO {

    private Long otpRequestId;
    private String planId;
    private String planName;
    private String maskedEmail;
    private LocalDateTime otpExpiresAt;
    private LocalDateTime resendAvailableAt;
    private String message;
}
