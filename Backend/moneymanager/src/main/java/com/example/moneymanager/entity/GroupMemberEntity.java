package com.example.moneymanager.entity;

import com.example.moneymanager.entity.enums.GroupMemberRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tbl_group_members", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"group_id", "profile_id"})
})
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GroupMemberEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private GroupEntity group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private ProfileEntity profile;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GroupMemberRole role;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime joinedAt;
}
