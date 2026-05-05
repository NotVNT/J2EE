package com.example.moneymanager.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tbl_notification_reads", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"notification_id", "profile_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationReadEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notification_id")
    private NotificationEntity notification;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    private ProfileEntity profile;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime readAt;
}
