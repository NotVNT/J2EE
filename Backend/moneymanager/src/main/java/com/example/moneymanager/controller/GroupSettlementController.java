package com.example.moneymanager.controller;

import com.example.moneymanager.dto.GroupSettlementDTO;
import com.example.moneymanager.dto.MemberBalanceDTO;
import com.example.moneymanager.service.GroupSettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/groups/{groupId}/settlements")
@RequiredArgsConstructor
public class GroupSettlementController {

    private final GroupSettlementService groupSettlementService;

    @GetMapping("/balances")
    public ResponseEntity<List<MemberBalanceDTO>> getGroupBalances(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupSettlementService.getGroupBalances(groupId));
    }

    @PostMapping
    public ResponseEntity<GroupSettlementDTO> settleDebt(@PathVariable Long groupId, @RequestBody GroupSettlementDTO request) {
        return ResponseEntity.ok(groupSettlementService.settleDebt(groupId, request));
    }

    @GetMapping
    public ResponseEntity<List<GroupSettlementDTO>> getSettlements(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupSettlementService.getSettlements(groupId));
    }
}
