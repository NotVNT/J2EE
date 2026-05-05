package com.example.moneymanager.service;

import com.example.moneymanager.dto.BudgetStatusDTO;
import com.example.moneymanager.dto.ExpenseDTO;
import com.example.moneymanager.dto.NotificationDTO;
import com.example.moneymanager.entity.NotificationEntity;
import com.example.moneymanager.entity.NotificationReadEntity;
import com.example.moneymanager.entity.NotificationType;
import com.example.moneymanager.entity.ProfileEntity;
import com.example.moneymanager.repository.NotificationReadRepository;
import com.example.moneymanager.repository.NotificationRepository;
import com.example.moneymanager.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final ProfileRepository profileRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationReadRepository notificationReadRepository;
    private final EmailService emailService;
    private final ProfileService profileService;
    
    @Autowired
    @Lazy
    private ExpenseService expenseService;

    @Value("${money.manager.frontend.url}")
    private String frontendUrl;

    // --- Core Notification Methods ---
    
    @Transactional
    public void createNotification(ProfileEntity profile, String title, String message, NotificationType type) {
        NotificationEntity notification = NotificationEntity.builder()
                .profile(profile)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @Transactional
    public void createBroadcast(String title, String message) {
        NotificationEntity notification = NotificationEntity.builder()
                .profile(null) // null indicates broadcast to all
                .title(title)
                .message(message)
                .type(NotificationType.ADMIN)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsForCurrentUser() {
        ProfileEntity profile = profileService.getCurrentProfile();
        List<NotificationEntity> notifications = notificationRepository.findByProfileIdOrProfileIsNullOrderByCreatedAtDesc(profile.getId());
        
        return notifications.stream().map(n -> {
            boolean isRead = n.getIsRead();
            if (n.getProfile() == null) {
                // For broadcast, check the read table
                isRead = notificationReadRepository.existsByNotificationIdAndProfileId(n.getId(), profile.getId());
            }
            return NotificationDTO.builder()
                    .id(n.getId())
                    .title(n.getTitle())
                    .message(n.getMessage())
                    .type(n.getType().name())
                    .isRead(isRead)
                    .createdAt(n.getCreatedAt())
                    .build();
        }).toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        ProfileEntity profile = profileService.getCurrentProfile();
        long personalUnread = notificationRepository.countUnreadByProfileId(profile.getId());
        
        // Count unread broadcasts
        List<NotificationEntity> broadcasts = notificationRepository.findByProfileIsNullOrderByCreatedAtDesc();
        long unreadBroadcasts = broadcasts.stream()
                .filter(b -> !notificationReadRepository.existsByNotificationIdAndProfileId(b.getId(), profile.getId()))
                .count();
                
        return personalUnread + unreadBroadcasts;
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        ProfileEntity profile = profileService.getCurrentProfile();
        NotificationEntity notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));
                
        if (notification.getProfile() == null) {
            // It's a broadcast
            if (!notificationReadRepository.existsByNotificationIdAndProfileId(notificationId, profile.getId())) {
                NotificationReadEntity readEntity = NotificationReadEntity.builder()
                        .notification(notification)
                        .profile(profile)
                        .build();
                notificationReadRepository.save(readEntity);
            }
        } else if (notification.getProfile().getId().equals(profile.getId())) {
            // It's a personal notification
            notification.setIsRead(true);
            notificationRepository.save(notification);
        } else {
            throw new RuntimeException("Không có quyền truy cập thông báo này");
        }
    }

    @Transactional
    public void markAllAsRead() {
        ProfileEntity profile = profileService.getCurrentProfile();
        List<NotificationEntity> notifications = notificationRepository.findByProfileIdOrProfileIsNullOrderByCreatedAtDesc(profile.getId());
        
        for (NotificationEntity n : notifications) {
            if (n.getProfile() == null) {
                if (!notificationReadRepository.existsByNotificationIdAndProfileId(n.getId(), profile.getId())) {
                    NotificationReadEntity readEntity = NotificationReadEntity.builder()
                            .notification(n)
                            .profile(profile)
                            .build();
                    notificationReadRepository.save(readEntity);
                }
            } else if (!n.getIsRead()) {
                n.setIsRead(true);
                notificationRepository.save(n);
            }
        }
    }

    // --- Helper Methods to generate specific notifications ---

    @Transactional
    public void notifyExpenseAdded(ProfileEntity profile, String expenseName, BigDecimal amount) {
        String formattedAmount = NumberFormat.getInstance(new Locale("vi", "VN")).format(amount);
        String message = String.format("Bạn vừa thêm khoản chi tiêu '%s' với số tiền %s VNĐ.", expenseName, formattedAmount);
        createNotification(profile, "Thêm chi tiêu mới", message, NotificationType.EXPENSE);
    }

    @Transactional
    public void notifyIncomeAdded(ProfileEntity profile, String incomeName, BigDecimal amount) {
        String formattedAmount = NumberFormat.getInstance(new Locale("vi", "VN")).format(amount);
        String message = String.format("Bạn vừa thêm khoản thu nhập '%s' với số tiền %s VNĐ.", incomeName, formattedAmount);
        createNotification(profile, "Thêm thu nhập mới", message, NotificationType.INCOME);
    }

    @Transactional
    public void notifyBudgetWarning(ProfileEntity profile, BudgetStatusDTO budgetStatus) {
        if (!budgetStatus.isHasBudget()) return;
        
        if (budgetStatus.isExceeded()) {
            String message = String.format("Ngân sách cho danh mục '%s' đã VƯỢT HẠN MỨC! Hãy điều chỉnh chi tiêu của bạn.", budgetStatus.getCategoryName());
            createNotification(profile, "Vượt ngân sách", message, NotificationType.BUDGET_EXCEEDED);
        } else if (budgetStatus.isWarning()) {
            String message = String.format("Ngân sách cho danh mục '%s' sắp hết (đã dùng %d%%).", 
                    budgetStatus.getCategoryName(), (int)(budgetStatus.getUsageRatio() * 100));
            createNotification(profile, "Cảnh báo ngân sách", message, NotificationType.BUDGET_WARNING);
        }
    }

    @Transactional
    public void notifyPaymentSuccess(ProfileEntity profile, String planName) {
        String message = String.format("Thanh toán thành công! Gói đăng ký %s của bạn đã được kích hoạt.", planName);
        createNotification(profile, "Thanh toán thành công", message, NotificationType.PAYMENT);
    }

    // --- Scheduled Email Jobs ---

    @Scheduled(cron = "0 0 22 * * *", zone = "IST")
    public void sendDailyIncomeExpenseReminder() {
        log.info("Job started: sendDailyIncomeExpenseReminder()");
        List<ProfileEntity> profiles = profileRepository.findAll();
        for(ProfileEntity profile : profiles) {
            String body = "Xin chào " + profile.getFullName() + ",<br><br>"
                    + "Đây là lời nhắc để bạn cập nhật các khoản thu và chi trong hôm nay trên Money Manager.<br><br>"
                    + "<a href=" + frontendUrl + " style='display:inline-block;padding:10px 20px;background-color:#4CAF50;color:#fff;text-decoration:none;border-radius:5px;font-weight:bold;'>Mở Money Manager</a>"
                    + "<br><br>Trân trọng,<br>Đội ngũ Money Manager";
            emailService.sendEmail(profile.getEmail(), "Nhắc nhở hằng ngày: cập nhật thu chi", body);
        }
        log.info("Job completed: sendDailyIncomeExpenseReminder()");
    }

    @Scheduled(cron = "0 0 23 * * *", zone = "IST")
    public void sendDailyExpenseSummary() {
        log.info("Job started: sendDailyExpenseSummary()");
        List<ProfileEntity> profiles = profileRepository.findAll();
        for (ProfileEntity profile : profiles) {
            List<ExpenseDTO> todaysExpenses = expenseService.getExpensesForUserOnDate(profile.getId(), LocalDate.now());
            if (!todaysExpenses.isEmpty()) {
                StringBuilder table = new StringBuilder();
                table.append("<table style='border-collapse:collapse;width:100%;'>");
                table.append("<tr style='background-color:#f2f2f2;'><th style='border:1px solid #ddd;padding:8px;'>STT</th><th style='border:1px solid #ddd;padding:8px;'>Tên khoản chi</th><th style='border:1px solid #ddd;padding:8px;'>Số tiền</th><th style='border:1px solid #ddd;padding:8px;'>Danh mục</th></tr>");
                int i = 1;
                for(ExpenseDTO expense : todaysExpenses) {
                    table.append("<tr>");
                    table.append("<td style='border:1px solid #ddd;padding:8px;'>").append(i++).append("</td>");
                    table.append("<td style='border:1px solid #ddd;padding:8px;'>").append(expense.getName()).append("</td>");
                    table.append("<td style='border:1px solid #ddd;padding:8px;'>").append(expense.getAmount()).append("</td>");
                    table.append("<td style='border:1px solid #ddd;padding:8px;'>").append(expense.getCategoryId() != null ? expense.getCategoryName() : "Không có").append("</td>");
                    table.append("</tr>");
                }
                table.append("</table>");
                String body = "Xin chào " + profile.getFullName() + ",<br/><br/>Dưới đây là tổng hợp các khoản chi của bạn trong hôm nay:<br/><br/>"
                        + table
                        + "<br/><br/>Trân trọng,<br/>Đội ngũ Money Manager";
                emailService.sendEmail(profile.getEmail(), "Tổng hợp chi tiêu hằng ngày", body);
            }
        }
        log.info("Job completed: sendDailyExpenseSummary()");
    }
}
