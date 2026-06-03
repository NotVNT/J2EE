package com.example.moneymanager.service;

import com.example.moneymanager.dto.*;
import com.example.moneymanager.entity.ProfileEntity;
import com.example.moneymanager.entity.ExpenseEntity;
import com.example.moneymanager.entity.IncomeEntity;
import com.example.moneymanager.repository.ExpenseRepository;
import com.example.moneymanager.repository.IncomeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.util.stream.Stream.concat;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    public Long getProfileId() {
        ProfileEntity profile = profileService.getCurrentProfile();
        return profile != null ? profile.getId() : null;
    }

    private final IncomeService incomeService;
    private final ExpenseService expenseService;
    private final ProfileService profileService;
    private final SavingGoalService savingGoalService;
    private final BudgetService budgetService;
    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;

    @Lazy
    @Autowired
    private GeminiService geminiService;

    @Lazy
    @Autowired
    private GptOssService gptOssService;

    @Lazy
    @Autowired
    private AiViolationService aiViolationService;

    @Transactional(readOnly = true)
    @Cacheable(value = "dashboard", key = "#root.target.getProfileId()", unless = "#result == null or #result.isEmpty()")
    public Map<String, Object> getDashboardData() {
        try {
            ProfileEntity profile = profileService.getCurrentProfile();
            if (profile == null) {
                log.error("Profile not found when getting dashboard data");
                return new HashMap<>();
            }

            Map<String, Object> returnValue = new LinkedHashMap<>();
            List<IncomeDTO> latestIncomes = incomeService.getLatest5IncomesForCurrentUser();
            List<ExpenseDTO> latestExpenses = expenseService.getLatest5ExpensesForCurrentUser();

            List<RecentTransactionDTO> recentTransactions = concat(
                    latestIncomes.stream().map(income ->
                            RecentTransactionDTO.builder()
                                    .id(income.getId())
                                    .profileId(profile.getId())
                                    .icon(income.getIcon())
                                    .name(income.getName())
                                    .amount(income.getAmount())
                                    .date(income.getDate())
                                    .createdAt(income.getCreatedAt())
                                    .updatedAt(income.getUpdatedAt())
                                    .type("income")
                                    .build()
                    ),
                    latestExpenses.stream().map(expense ->
                            RecentTransactionDTO.builder()
                                    .id(expense.getId() != null ? -expense.getId() : null)
                                    .profileId(profile.getId())
                                    .icon(expense.getIcon())
                                    .name(expense.getName())
                                    .amount(expense.getAmount())
                                    .date(expense.getDate())
                                    .createdAt(expense.getCreatedAt())
                                    .updatedAt(expense.getUpdatedAt())
                                    .type("expense")
                                    .build()
                    )
            ).sorted((a, b) -> {
                int cmp = b.getDate().compareTo(a.getDate());
                if (cmp == 0 && a.getCreatedAt() != null && b.getCreatedAt() != null) {
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                }
                return cmp;
            }).collect(Collectors.toList());

            // Thống kê theo tháng hiện tại
            LocalDate currentLocalDate = LocalDate.now();
            LocalDate startOfMonth = currentLocalDate.withDayOfMonth(1);
            LocalDate endOfMonth = currentLocalDate.withDayOfMonth(currentLocalDate.lengthOfMonth());
            java.math.BigDecimal totalIncome = incomeService.getIncomeTotalForCurrentUserBetween(startOfMonth, endOfMonth);
            java.math.BigDecimal totalExpense = expenseService.getExpenseTotalForCurrentUserBetween(startOfMonth, endOfMonth);
            
            returnValue.put("totalBalance", totalIncome.subtract(totalExpense));
            returnValue.put("totalIncome", totalIncome);
            returnValue.put("totalExpense", totalExpense);
            returnValue.put("recent5Expenses", latestExpenses);
            returnValue.put("recent5Incomes", latestIncomes);
            returnValue.put("recentTransactions", recentTransactions);

            // Saving Goals summary
            Map<String, Object> savingGoalSummary = savingGoalService.getSavingGoalSummary();
            returnValue.put("savingGoalActiveCount", savingGoalSummary.getOrDefault("activeCount", 0));
            returnValue.put("savingGoalCompletedCount", savingGoalSummary.getOrDefault("completedCount", 0));
            returnValue.put("savingGoalTotalSaved", savingGoalSummary.getOrDefault("totalSaved", 0));

            // Budgets for current month
            returnValue.put("budgets", budgetService.getBudgetsForCurrentMonth());

            // Priority Saving Goal
            List<SavingGoalDTO> allGoals = savingGoalService.getAllGoals();
            returnValue.put("priorityGoal", allGoals.isEmpty() ? null : allGoals.get(0));

            // Tối ưu: dùng aggregate query thay vì loop 6 lần
            List<Map<String, Object>> monthlyHistory = new ArrayList<>();
            LocalDate now = LocalDate.now();
            LocalDate startDate = now.minusMonths(5).withDayOfMonth(1);
            LocalDate endDate = now.withDayOfMonth(now.lengthOfMonth());
            
            // Lấy tất cả monthly totals trong 2 queries
            Map<String, java.math.BigDecimal> incomeByMonth = incomeService.getMonthlyTotalsForCurrentUser(startDate, endDate);
            Map<String, java.math.BigDecimal> expenseByMonth = expenseService.getMonthlyTotalsForCurrentUser(startDate, endDate);
            
            for (int i = 5; i >= 0; i--) {
                LocalDate date = now.minusMonths(i);
                String monthKey = date.getYear() + "-" + String.format("%02d", date.getMonthValue());
                
                Map<String, Object> history = new HashMap<>();
                history.put("month", "Tháng " + date.getMonthValue());
                history.put("fullLabel", "Tháng " + date.getMonthValue() + "/" + date.getYear());
                history.put("income", incomeByMonth.getOrDefault(monthKey, java.math.BigDecimal.ZERO));
                history.put("expense", expenseByMonth.getOrDefault(monthKey, java.math.BigDecimal.ZERO));
                monthlyHistory.add(history);
            }
            returnValue.put("monthlyHistory", monthlyHistory);

            // 1. Daily History (Thứ/Ngày/Tháng của tuần hiện tại)
            List<Map<String, Object>> dailyHistory = new ArrayList<>();
            LocalDate startOfWeek = now.with(java.time.DayOfWeek.MONDAY);
            LocalDate endOfWeek = now.with(java.time.DayOfWeek.SUNDAY);

            List<ExpenseEntity> weekExpenses = expenseRepository.findByProfileIdAndDateBetween(
                    profile.getId(), startOfWeek, endOfWeek);
            List<IncomeEntity> weekIncomes = incomeRepository.findByProfileIdAndDateBetween(
                    profile.getId(), startOfWeek, endOfWeek);

            Map<LocalDate, java.math.BigDecimal> expenseByDate = weekExpenses.stream()
                    .filter(e -> e.getDate() != null && e.getAmount() != null)
                    .collect(Collectors.groupingBy(ExpenseEntity::getDate,
                            Collectors.reducing(java.math.BigDecimal.ZERO, ExpenseEntity::getAmount, java.math.BigDecimal::add)));

            Map<LocalDate, java.math.BigDecimal> incomeByDate = weekIncomes.stream()
                    .filter(i -> i.getDate() != null && i.getAmount() != null)
                    .collect(Collectors.groupingBy(IncomeEntity::getDate,
                            Collectors.reducing(java.math.BigDecimal.ZERO, IncomeEntity::getAmount, java.math.BigDecimal::add)));

            String[] dayNames = {"T2", "T3", "T4", "T5", "T6", "T7", "CN"};
            String[] fullDayNames = {"Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"};

            for (int i = 0; i < 7; i++) {
                LocalDate date = startOfWeek.plusDays(i);
                Map<String, Object> dayData = new HashMap<>();
                dayData.put("label", dayNames[i] + " (" + String.format("%02d/%02d", date.getDayOfMonth(), date.getMonthValue()) + ")");
                dayData.put("fullLabel", fullDayNames[i] + ", ngày " + String.format("%02d/%02d/%d", date.getDayOfMonth(), date.getMonthValue(), date.getYear()));
                dayData.put("income", incomeByDate.getOrDefault(date, java.math.BigDecimal.ZERO));
                dayData.put("expense", expenseByDate.getOrDefault(date, java.math.BigDecimal.ZERO));
                dailyHistory.add(dayData);
            }
            returnValue.put("dailyHistory", dailyHistory);

            // 2. Weekly History of Current Month ("Tháng này")
            List<Map<String, Object>> weeklyHistory = new ArrayList<>();
            LocalDate weekStartOfMonth = now.withDayOfMonth(1);
            LocalDate weekEndOfMonth = now.withDayOfMonth(now.lengthOfMonth());

            List<ExpenseEntity> monthExpenses = expenseRepository.findByProfileIdAndDateBetween(
                    profile.getId(), weekStartOfMonth, weekEndOfMonth);
            List<IncomeEntity> monthIncomes = incomeRepository.findByProfileIdAndDateBetween(
                    profile.getId(), weekStartOfMonth, weekEndOfMonth);

            for (int w = 1; w <= 5; w++) {
                LocalDate wStart = weekStartOfMonth.plusDays((w - 1) * 7);
                if (wStart.isAfter(weekEndOfMonth)) {
                    break;
                }
                LocalDate wEnd = weekStartOfMonth.plusDays(w * 7 - 1);
                if (wEnd.isAfter(weekEndOfMonth)) {
                    wEnd = weekEndOfMonth;
                }

                final LocalDate finalWStart = wStart;
                final LocalDate finalWEnd = wEnd;

                java.math.BigDecimal wExpense = monthExpenses.stream()
                        .filter(e -> e.getDate() != null && !e.getDate().isBefore(finalWStart) && !e.getDate().isAfter(finalWEnd) && e.getAmount() != null)
                        .map(ExpenseEntity::getAmount)
                        .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

                java.math.BigDecimal wIncome = monthIncomes.stream()
                        .filter(in -> in.getDate() != null && !in.getDate().isBefore(finalWStart) && !in.getDate().isAfter(finalWEnd) && in.getAmount() != null)
                        .map(IncomeEntity::getAmount)
                        .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

                Map<String, Object> weekData = new HashMap<>();
                weekData.put("label", "Tuần " + w);
                weekData.put("fullLabel", "Tuần " + w + " (" + String.format("%02d/%02d", wStart.getDayOfMonth(), wStart.getMonthValue()) + " - " + String.format("%02d/%02d", wEnd.getDayOfMonth(), wEnd.getMonthValue()) + ")");
                weekData.put("income", wIncome);
                weekData.put("expense", wExpense);
                weeklyHistory.add(weekData);
            }
            returnValue.put("weeklyHistory", weeklyHistory);

            return returnValue;



        } catch (Exception e) {
            log.error("Error getting dashboard data: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get dashboard data: " + e.getMessage());
        }
    }

    // AI Insight ngắn gọn (hiển thị ban đầu)
    public Map<String, String> getAiInsight() {
        try {
            ProfileEntity profile = profileService.getCurrentProfile();
            if (profile == null) {
                log.error("Profile not found when getting AI insight");
                return Map.of("insight", "Vui lòng đăng nhập để sử dụng tính năng này");
            }

            String userName = profile.getFullName() != null ? profile.getFullName() : "bạn";
            if (aiViolationService.isAiBlocked(profile)) {
                return Map.of("insight", "Tính năng AI tạm thời không khả dụng.");
            }
            Map<String, Object> currentData = getDashboardData();

            if (currentData == null || currentData.isEmpty()) {
                log.warn("Dashboard data is empty");
                return Map.of("insight", "Chưa có dữ liệu để phân tích. Hãy thêm giao dịch đầu tiên!");
            }

            AssistantChatResponseDTO aiResponse = gptOssService.getDashboardInsight(currentData, userName);

            if (aiResponse == null || aiResponse.getReply() == null) {
                return Map.of("insight", "AI đang cập nhật, vui lòng thử lại sau");
            }

            return Map.of("insight", aiResponse.getReply());

        } catch (Exception e) {
            log.error("Error getting AI insight: {}", e.getMessage(), e);
            return Map.of("insight", "Hệ thống AI đang bảo trì, vui lòng thử lại sau");
        }
    }

    // AI Insight CHI TIẾT - DỰ ĐOÁN TƯƠNG LAI
    public Map<String, Object> getDetailedAiInsight() {
        try {
            ProfileEntity profile = profileService.getCurrentProfile();
            if (profile == null) {
                log.error("Profile not found when getting detailed AI insight");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "User not authenticated");
                errorResponse.put("message", "Vui lòng đăng nhập để sử dụng tính năng này");
                return errorResponse;
            }

            String userName = profile.getFullName() != null ? profile.getFullName() : "bạn";
            if (aiViolationService.isAiBlocked(profile)) {
                Map<String, Object> blockedResponse = new HashMap<>();
                blockedResponse.put("message", "Tính năng AI tạm thời không khả dụng.");
                blockedResponse.put("status", "ai_blocked");
                return blockedResponse;
            }
            log.info("Getting detailed insight for user: {}", userName);

            Map<String, Object> currentData = getDashboardData();
            if (currentData == null || currentData.isEmpty()) {
                log.warn("Dashboard data is empty for user: {}", userName);
                Map<String, Object> emptyResponse = new HashMap<>();
                emptyResponse.put("message", "Chưa có đủ dữ liệu để phân tích chi tiết");
                emptyResponse.put("status", "insufficient_data");
                return emptyResponse;
            }

            Map<String, Object> detailedInsight = geminiService.getDetailedDashboardInsight(currentData, userName);

            if (detailedInsight == null || detailedInsight.isEmpty()) {
                log.warn("Detailed insight is empty for user: {}", userName);
                Map<String, Object> emptyResponse = new HashMap<>();
                emptyResponse.put("message", "Không thể tạo phân tích chi tiết. Vui lòng thử lại sau");
                emptyResponse.put("status", "analysis_failed");
                return emptyResponse;
            }

            log.info("Detailed insight generated successfully for user: {}", userName);
            return detailedInsight;

        } catch (Exception e) {
            log.error("Error getting detailed AI insight: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Không thể tải phân tích chi tiết: " + e.getMessage());
            return errorResponse;
        }
    }
}
