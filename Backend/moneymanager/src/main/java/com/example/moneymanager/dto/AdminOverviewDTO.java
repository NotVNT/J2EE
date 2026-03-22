package com.example.moneymanager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdminOverviewDTO {
    private Long totalUsers;
    private Long activeSubscriptions;
    private Long totalPayments;
    private Long paidPayments;
    private String systemStatus;
}
