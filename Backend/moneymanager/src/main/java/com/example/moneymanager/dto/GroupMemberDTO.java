package com.example.moneymanager.dto;

import com.example.moneymanager.entity.enums.GroupMemberRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupMemberDTO {
    private Long id; // ID of the member record, not the profile
    private Long groupId;
    private Long profileId;
    private String fullName;
    private String email;
    private String profileImageUrl;
    private GroupMemberRole role;
    private LocalDateTime joinedAt;
}
