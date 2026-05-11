package com.example.moneymanager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupExpenseSplitDTO {
    private Long id;
    private Long memberId;
    private String memberName;
    private BigDecimal amount;
    private Boolean isPaid;
}
