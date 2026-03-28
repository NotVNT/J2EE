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
public class ReceiptImportItemDTO {
    private String name;
    private BigDecimal amount;
    private Long categoryId;
    private String categoryHint;
    private String icon;
    private LocalDate date;
}
