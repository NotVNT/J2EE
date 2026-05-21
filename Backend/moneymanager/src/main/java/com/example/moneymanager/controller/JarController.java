package com.example.moneymanager.controller;

import com.example.moneymanager.dto.JarDTO;
import com.example.moneymanager.service.JarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/jars")
public class JarController {

    private final JarService jarService;

    @PostMapping
    public ResponseEntity<?> createJar(@RequestBody JarDTO jarDTO) {
        try {
            JarDTO created = jarService.createJar(jarDTO);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<JarDTO>> getAllJars() {
        return ResponseEntity.ok(jarService.getAllJars());
    }

    @PutMapping("/{jarId}")
    public ResponseEntity<?> updateJar(@PathVariable Long jarId, @RequestBody JarDTO jarDTO) {
        try {
            JarDTO updated = jarService.updateJar(jarId, jarDTO);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{jarId}")
    public ResponseEntity<?> deleteJar(@PathVariable Long jarId) {
        try {
            jarService.deleteJar(jarId);
            return ResponseEntity.ok(Map.of("message", "Jar deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/transfer")
    public ResponseEntity<?> transferBalance(@RequestBody Map<String, Object> payload) {
        try {
            Long fromJarId = ((Number) payload.get("fromJarId")).longValue();
            Long toJarId = ((Number) payload.get("toJarId")).longValue();
            BigDecimal amount = new BigDecimal(payload.get("amount").toString());

            jarService.transferBalance(fromJarId, toJarId, amount);
            return ResponseEntity.ok(Map.of("message", "Transfer successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
