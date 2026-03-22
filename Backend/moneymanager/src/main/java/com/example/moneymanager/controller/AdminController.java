package com.example.moneymanager.controller;

import com.example.moneymanager.dto.AdminOverviewDTO;
import com.example.moneymanager.dto.AdminPaymentDTO;
import com.example.moneymanager.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/overview")
    public ResponseEntity<?> getOverview() {
        try {
            AdminOverviewDTO response = adminService.getOverview();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            HttpStatus status = e.getMessage() != null && e.getMessage().contains("Forbidden")
                    ? HttpStatus.FORBIDDEN
                    : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/payments")
    public ResponseEntity<?> getPayments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer limit
    ) {
        try {
            List<AdminPaymentDTO> response = adminService.getPayments(status, search, limit);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            HttpStatus statusCode = e.getMessage() != null && e.getMessage().contains("Forbidden")
                    ? HttpStatus.FORBIDDEN
                    : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(statusCode).body(Map.of("message", e.getMessage()));
        }
    }
}
