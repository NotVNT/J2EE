package com.example.moneymanager.controller;

import com.example.moneymanager.dto.GroupExpenseDTO;
import com.example.moneymanager.service.GroupExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/expenses")
@RequiredArgsConstructor
public class GroupExpenseController {

    private final GroupExpenseService groupExpenseService;

    @PostMapping
    public ResponseEntity<GroupExpenseDTO> addExpense(@PathVariable Long groupId, @RequestBody GroupExpenseDTO request) {
        return ResponseEntity.ok(groupExpenseService.addExpense(groupId, request));
    }

    @GetMapping
    public ResponseEntity<List<GroupExpenseDTO>> getGroupExpenses(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupExpenseService.getGroupExpenses(groupId));
    }
}
