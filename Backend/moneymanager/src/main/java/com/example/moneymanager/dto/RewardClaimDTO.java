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
public class RewardClaimDTO {
    private String rewardType; // GAME_CARD | PHONE_CARD
    private BigDecimal amount;
    private LocalDate claimDate;
    private String note;
}
