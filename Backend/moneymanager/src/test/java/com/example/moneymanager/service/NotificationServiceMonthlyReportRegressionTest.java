package com.example.moneymanager.service;

import com.example.moneymanager.entity.NotificationEntity;
import com.example.moneymanager.entity.NotificationType;
import com.example.moneymanager.entity.ProfileEntity;
import com.example.moneymanager.repository.BudgetRepository;
import com.example.moneymanager.repository.ExpenseRepository;
import com.example.moneymanager.repository.IncomeRepository;
import com.example.moneymanager.repository.NotificationReadRepository;
import com.example.moneymanager.repository.NotificationRepository;
import com.example.moneymanager.repository.ProfileRepository;
import com.example.moneymanager.repository.SavingGoalContributionRepository;
import com.example.moneymanager.repository.SavingGoalRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceMonthlyReportRegressionTest {

    @Mock private ProfileRepository profileRepository;
    @Mock private NotificationRepository notificationRepository;
    @Mock private NotificationReadRepository notificationReadRepository;
    @Mock private EmailService emailService;
    @Mock private MailTemplateService mailTemplateService;
    @Mock private ProfileService profileService;
    @Mock private ExpenseRepository expenseRepository;
    @Mock private IncomeRepository incomeRepository;
    @Mock private SavingGoalContributionRepository savingGoalContributionRepository;
    @Mock private SavingGoalRepository savingGoalRepository;
    @Mock private BudgetRepository budgetRepository;
    @Mock private EmailNotificationPreferenceService emailNotificationPreferenceService;
    @Mock private ExpenseService expenseService;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    @DisplayName("REGRESSION: monthly report notification must use repository totals for each profile")
    void sendMonthlyReportCardNotification_usesProfileTotalsWithoutCurrentProfile() {
        ProfileEntity profile = ProfileEntity.builder()
                .id(99L)
                .fullName("Nova")
                .build();
        YearMonth previousMonth = YearMonth.from(LocalDate.now()).minusMonths(1);

        ReflectionTestUtils.setField(notificationService, "scheduledJobsEnabled", true);
        when(profileRepository.findAll(any(PageRequest.class))).thenReturn(new PageImpl<>(List.of(profile)));
        when(incomeRepository.findTotalIncomeByProfileIdAndDateBetween(
                eq(99L),
                eq(previousMonth.atDay(1)),
                eq(previousMonth.atEndOfMonth())
        )).thenReturn(new BigDecimal("10000000"));
        when(expenseRepository.findTotalExpenseByProfileIdAndDateBetween(
                eq(99L),
                eq(previousMonth.atDay(1)),
                eq(previousMonth.atEndOfMonth())
        )).thenReturn(new BigDecimal("6000000"));

        notificationService.sendMonthlyReportCardNotification();

        ArgumentCaptor<NotificationEntity> notificationCaptor = ArgumentCaptor.forClass(NotificationEntity.class);
        verify(notificationRepository).save(notificationCaptor.capture());
        verify(profileService, never()).getCurrentProfile();

        NotificationEntity notification = notificationCaptor.getValue();
        assertEquals(profile, notification.getProfile());
        assertEquals(NotificationType.MONTHLY_REPORT, notification.getType());
        assertTrue(notification.getMessage().contains("A"));
        assertTrue(notification.getMessage().contains("10.000.000"));
        assertTrue(notification.getMessage().contains("6.000.000"));
        assertTrue(notification.getMessage().contains("4.000.000"));
        assertTrue(notification.getMessage().contains("40.0%"));
    }
}
