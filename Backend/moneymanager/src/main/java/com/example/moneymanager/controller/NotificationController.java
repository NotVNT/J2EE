package com.example.moneymanager.controller;

import com.example.moneymanager.dto.NotificationDTO;
import com.example.moneymanager.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications() {
        return ResponseEntity.ok(notificationService.getNotificationsForCurrentUser());
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount() {
        long count = notificationService.getUnreadCount();
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(Map.of("message", "Đánh dấu đã đọc thành công"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(Map.of("message", "Đã đánh dấu tất cả là đã đọc"));
    }
}
