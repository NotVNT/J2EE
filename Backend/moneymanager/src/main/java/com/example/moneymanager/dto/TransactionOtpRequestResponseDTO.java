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
public class TransactionOtpRequestResponseDTO {

    private Long otpRequestId;
    private String actionType;
    private String maskedEmail;
    private LocalDateTime otpExpiresAt;
    private LocalDateTime resendAvailableAt;
    private String message;
}
