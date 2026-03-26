package com.example.moneymanager.controller;

import com.example.moneymanager.dto.RewardClaimDTO;
import com.example.moneymanager.dto.SavingGoalContributionDTO;
import com.example.moneymanager.dto.SavingGoalDTO;
import com.example.moneymanager.service.SavingGoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/saving-goals")
public class SavingGoalController {

    private final SavingGoalService savingGoalService;

    @PostMapping
    public ResponseEntity<SavingGoalDTO> createGoal(@RequestBody SavingGoalDTO dto) {
        SavingGoalDTO created = savingGoalService.createGoal(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<SavingGoalDTO>> getAllGoals() {
        return ResponseEntity.ok(savingGoalService.getAllGoals());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SavingGoalDTO> getGoalById(@PathVariable Long id) {
        return ResponseEntity.ok(savingGoalService.getGoalById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SavingGoalDTO> updateGoal(@PathVariable Long id, @RequestBody SavingGoalDTO dto) {
        return ResponseEntity.ok(savingGoalService.updateGoal(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        savingGoalService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/contributions")
    public ResponseEntity<SavingGoalContributionDTO> addContribution(
            @PathVariable Long id, @RequestBody SavingGoalContributionDTO dto) {
        SavingGoalContributionDTO created = savingGoalService.addContribution(id, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/claim-reward")
    public ResponseEntity<SavingGoalContributionDTO> claimEarlyReward(
            @PathVariable Long id, @RequestBody RewardClaimDTO dto) {
        SavingGoalContributionDTO created = savingGoalService.claimEarlyReward(id, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}/contributions")
    public ResponseEntity<List<SavingGoalContributionDTO>> getContributions(@PathVariable Long id) {
        return ResponseEntity.ok(savingGoalService.getContributions(id));
    }
}
