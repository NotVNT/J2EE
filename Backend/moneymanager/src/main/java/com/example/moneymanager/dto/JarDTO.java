package com.example.moneymanager.dto;

import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JarDTO {
    private Long id;
    private String name;
    private String icon;
    private String color;
    private BigDecimal targetPercentage;
    @DecimalMin(value = "0", message = "currentBalance không được âm")
    private BigDecimal currentBalance;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
