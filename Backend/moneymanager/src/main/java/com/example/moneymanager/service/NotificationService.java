package com.example.moneymanager.service;

import com.example.moneymanager.dto.ExpenseDTO;
import com.example.moneymanager.entity.ProfileEntity;
import com.example.moneymanager.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final ProfileRepository profileRepository;
    private final EmailService emailService;
    private final ExpenseService expenseService;

    @Value("${money.manager.frontend.url}")
    private String frontendUrl;


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
