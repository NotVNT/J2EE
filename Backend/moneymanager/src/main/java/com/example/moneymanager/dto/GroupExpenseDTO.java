package com.example.moneymanager.dto;

import com.example.moneymanager.entity.enums.SplitType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupExpenseDTO {
    private Long id;
    private Long groupId;
    private Long paidById;
    private String paidByName;
    private BigDecimal amount;
    private String description;
    private LocalDate date;
    private SplitType splitType;
    private LocalDateTime createdAt;
    private List<GroupExpenseSplitDTO> splits;
}
