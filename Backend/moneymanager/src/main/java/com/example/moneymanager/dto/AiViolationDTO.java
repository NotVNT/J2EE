package com.example.moneymanager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiViolationDTO {
    private Long id;
    private String type;
    private Integer score;
    private String snippet;
    private String source;
    private LocalDateTime createdAt;
}
