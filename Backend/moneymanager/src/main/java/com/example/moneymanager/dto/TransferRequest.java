package com.example.moneymanager.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransferRequest {

    @NotNull(message = "fromJarId không được để trống")
    private Long fromJarId;

    @NotNull(message = "toJarId không được để trống")
    private Long toJarId;

    @NotNull(message = "amount không được để trống")
    @DecimalMin(value = "0.01", message = "Số tiền chuyển phải lớn hơn 0")
    private BigDecimal amount;
}
