package com.example.moneymanager.controller;

import com.example.moneymanager.dto.RecurringTransactionDTO;
import com.example.moneymanager.service.RecurringTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recurring-transactions")
@RequiredArgsConstructor
public class RecurringTransactionController {

    private final RecurringTransactionService recurringTransactionService;

    @PostMapping
    public ResponseEntity<RecurringTransactionDTO> create(@RequestBody RecurringTransactionDTO dto) {
        return ResponseEntity.ok(recurringTransactionService.createRecurring(dto));
    }

    @GetMapping
    public ResponseEntity<List<RecurringTransactionDTO>> getAll() {
        return ResponseEntity.ok(recurringTransactionService.getAllForCurrentUser());
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecurringTransactionDTO> update(@PathVariable Long id, @RequestBody RecurringTransactionDTO dto) {
        return ResponseEntity.ok(recurringTransactionService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        recurringTransactionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<RecurringTransactionDTO> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(recurringTransactionService.toggle(id));
    }
}
