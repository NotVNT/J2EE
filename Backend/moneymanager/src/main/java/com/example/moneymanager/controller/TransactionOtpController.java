package com.example.moneymanager.controller;

import com.example.moneymanager.dto.TransactionOtpRequestDTO;
import com.example.moneymanager.dto.TransactionOtpRequestResponseDTO;
import com.example.moneymanager.dto.TransactionOtpVerifyRequestDTO;
import com.example.moneymanager.dto.TransactionOtpVerifyResponseDTO;
import com.example.moneymanager.service.TransactionOtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/transactions/otp")
public class TransactionOtpController {

    private final TransactionOtpService transactionOtpService;

    @PostMapping("/request")
    public ResponseEntity<?> requestOtp(@RequestBody TransactionOtpRequestDTO requestDTO) {
        try {
            TransactionOtpRequestResponseDTO responseDTO = transactionOtpService.requestOtp(requestDTO);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyOtp(@RequestBody TransactionOtpVerifyRequestDTO requestDTO) {
        try {
            TransactionOtpVerifyResponseDTO responseDTO = transactionOtpService.verifyOtp(requestDTO);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }
}
