package com.example.moneymanager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReceiptImportResponseDTO {
    private String merchant;
    private LocalDate receiptDate;
    private Integer detectedItemCount;
    private Integer importedCount;
    private List<ExpenseDTO> importedExpenses;
}
