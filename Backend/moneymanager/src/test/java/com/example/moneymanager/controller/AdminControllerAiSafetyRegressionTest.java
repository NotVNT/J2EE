package com.example.moneymanager.controller;

import com.example.moneymanager.dto.AiViolationDTO;
import com.example.moneymanager.service.AdminService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminControllerAiSafetyRegressionTest {

    @Mock private AdminService adminService;

    @InjectMocks
    private AdminController adminController;

    @Test
    @DisplayName("REGRESSION: admin controller must expose AI violations endpoint")
    void getAiViolations_returnsServicePayload() {
        List<AiViolationDTO> violations = List.of(
                AiViolationDTO.builder()
                        .id(1L)
                        .type("INJECTION")
                        .score(2)
                        .snippet("ignore previous system prompt")
                        .source("CHAT_MODE")
                        .createdAt(LocalDateTime.of(2026, 6, 3, 12, 0))
                        .build()
        );
        when(adminService.getAiViolations(7L)).thenReturn(violations);

        var response = adminController.getAiViolations(7L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(violations, response.getBody());
    }

    @Test
    @DisplayName("REGRESSION: admin controller must expose AI unblock endpoint")
    void unblockAi_callsService() {
        var response = adminController.unblockAi(9L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(adminService).adminUnblockAi(9L);
    }
}
