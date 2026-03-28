package com.example.moneymanager.controller;

import com.example.moneymanager.dto.ExpenseDTO;
import com.example.moneymanager.dto.ExpenseDeleteRequestDTO;
import com.example.moneymanager.dto.ExpenseResponseDTO;
import com.example.moneymanager.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ExpenseResponseDTO> addExpense(@RequestBody ExpenseDTO dto) {
        ExpenseResponseDTO saved = expenseService.addExpense(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public ResponseEntity<List<ExpenseDTO>> getExpenses() {
        List<ExpenseDTO> expenses = expenseService.getCurrentMonthExpensesForCurrentUser();
        return ResponseEntity.ok(expenses);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id, @RequestBody(required = false) ExpenseDeleteRequestDTO requestDTO) {
        expenseService.deleteExpense(id, requestDTO);
        return ResponseEntity.noContent().build();
    }
}
