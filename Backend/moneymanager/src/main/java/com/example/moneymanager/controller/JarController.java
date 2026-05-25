package com.example.moneymanager.controller;

import com.example.moneymanager.dto.JarDTO;
import com.example.moneymanager.dto.TransferRequest;
import com.example.moneymanager.service.JarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/jars")
public class JarController {

    private final JarService jarService;

    // Exceptions propagate to GlobalExceptionHandler:
    //   ForbiddenException  → 403 (subscription limit violations)
    //   RuntimeException    → 400 (validation, not-found, unauthorized)
    //   Exception           → 500 (unexpected errors, generic message)

    @PostMapping
    public ResponseEntity<JarDTO> createJar(@Valid @RequestBody JarDTO jarDTO) {
        JarDTO created = jarService.createJar(jarDTO);
        return ResponseEntity.ok(created);
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> createJarsBulk(@RequestBody List<JarDTO> jarDTOs) {
        try {
            List<JarDTO> created = jarService.createJarsBulk(jarDTOs);
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
    public ResponseEntity<JarDTO> updateJar(@PathVariable Long jarId, @RequestBody JarDTO jarDTO) {
        JarDTO updated = jarService.updateJar(jarId, jarDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{jarId}")
    public ResponseEntity<Map<String, String>> deleteJar(@PathVariable Long jarId) {
        jarService.deleteJar(jarId);
        return ResponseEntity.ok(Map.of("message", "Jar deleted successfully"));
    }

    @PostMapping("/transfer")
    public ResponseEntity<Map<String, String>> transferBalance(@Valid @RequestBody TransferRequest request) {
        jarService.transferBalance(request.getFromJarId(), request.getToJarId(), request.getAmount());
        return ResponseEntity.ok(Map.of("message", "Transfer successful"));
    }
}
