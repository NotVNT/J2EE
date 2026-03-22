package com.example.moneymanager.controller;

import com.example.moneymanager.dto.BudgetDTO;
import com.example.moneymanager.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    /**
     * POST /budgets – Tạo mới hoặc cập nhật hạn mức ngân sách
     */
    @PostMapping
    public ResponseEntity<BudgetDTO> setBudget(@RequestBody BudgetDTO dto) {
        BudgetDTO result = budgetService.setBudget(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    /**
     * GET /budgets – Lấy danh sách hạn mức tháng hiện tại
     */
    @GetMapping
    public ResponseEntity<List<BudgetDTO>> getCurrentMonthBudgets() {
        List<BudgetDTO> budgets = budgetService.getBudgetsForCurrentMonth();
        return ResponseEntity.ok(budgets);
    }

    /**
     * DELETE /budgets/{id} – Xóa hạn mức
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }
}
