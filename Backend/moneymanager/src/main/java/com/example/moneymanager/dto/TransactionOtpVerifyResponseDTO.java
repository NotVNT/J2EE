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
public class TransactionOtpVerifyResponseDTO {

    private String transactionAuthorizationToken;
    private LocalDateTime authorizationExpiresAt;
    private String message;
}
