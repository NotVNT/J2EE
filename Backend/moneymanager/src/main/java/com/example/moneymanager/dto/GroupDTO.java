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
public class GroupDTO {
    private Long id;
    private String name;
    private String description;
    private String avatarIcon;
    private Long creatorId;
    private String creatorName;
    private LocalDateTime createdAt;
    private int memberCount;
    private String myRole;
}
