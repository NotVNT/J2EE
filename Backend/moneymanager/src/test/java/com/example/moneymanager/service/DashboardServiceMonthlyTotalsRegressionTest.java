package com.example.moneymanager.service;

import com.example.moneymanager.entity.ProfileEntity;
import com.example.moneymanager.repository.CategoryRepository;
import com.example.moneymanager.repository.IncomeRepository;
import com.example.moneymanager.repository.ExpenseRepository;
import com.example.moneymanager.repository.JarRepository;
import com.example.moneymanager.repository.IncomeAllocationRepository;
import com.example.moneymanager.repository.BudgetRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceMonthlyTotalsRegressionTest {

    // --- Mocks for IncomeService ---
    @Mock private CategoryRepository categoryRepository;
    @Mock private IncomeRepository incomeRepository;
    @Mock private ProfileService profileService;
    @Mock private SubscriptionService subscriptionService;
    @Mock private NotificationService notificationService;
    @Mock private JarRepository jarRepository;
    @Mock private IncomeAllocationRepository incomeAllocationRepository;
    @Mock private JarService jarService;
    @Mock private ApplicationEventPublisher eventPublisher;
    @Mock private DashboardCacheInvalidationService dashboardCacheInvalidationService;

    @InjectMocks
    private IncomeService incomeService;

    // --- Mocks for ExpenseService ---
    @Mock private ExpenseRepository expenseRepository;
    @Mock private BudgetService budgetService;
    @Mock private BudgetRepository budgetRepository;

    // We can instantiate ExpenseService manually or use another test setup.
    // Let's instantiate both manually or using a helper method to avoid Mockito InjectMocks conflicts.

    @Test
    @DisplayName("REGRESSION: IncomeService monthly totals must handle Long values for month and year without ClassCastException")
    void incomeMonthlyTotals_handlesLongValuesFromDatabase() {
        ProfileEntity profile = ProfileEntity.builder().id(1L).build();
        when(profileService.getCurrentProfile()).thenReturn(profile);

        LocalDate start = LocalDate.now().minusMonths(5);
        LocalDate end = LocalDate.now();

        // Simulate database returning Long for month and year
        List<Object[]> dbResults = new ArrayList<>();
        dbResults.add(new Object[]{6L, 2026L, new BigDecimal("15000000")});
        dbResults.add(new Object[]{5L, 2026L, new BigDecimal("12000000")});

        when(incomeRepository.findMonthlyIncomeTotals(profile.getId(), start, end)).thenReturn(dbResults);

        Map<String, BigDecimal> result = incomeService.getMonthlyTotalsForCurrentUser(start, end);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(new BigDecimal("15000000"), result.get("2026-06"));
        assertEquals(new BigDecimal("12000000"), result.get("2026-05"));
    }

    @Test
    @DisplayName("REGRESSION: ExpenseService monthly totals must handle Long values for month and year without ClassCastException")
    void expenseMonthlyTotals_handlesLongValuesFromDatabase() {
        // Construct ExpenseService manually to resolve InjectMocks conflict
        ExpenseService expenseService = new ExpenseService(
                categoryRepository,
                expenseRepository,
                profileService,
                subscriptionService,
                budgetService,
                notificationService,
                budgetRepository,
                jarRepository,
                eventPublisher,
                dashboardCacheInvalidationService
        );

        ProfileEntity profile = ProfileEntity.builder().id(1L).build();
        when(profileService.getCurrentProfile()).thenReturn(profile);

        LocalDate start = LocalDate.now().minusMonths(5);
        LocalDate end = LocalDate.now();

        // Simulate database returning Long for month and year
        List<Object[]> dbResults = new ArrayList<>();
        dbResults.add(new Object[]{6L, 2026L, new BigDecimal("8000000")});
        dbResults.add(new Object[]{5L, 2026L, new BigDecimal("9500000")});

        when(expenseRepository.findMonthlyExpenseTotals(profile.getId(), start, end)).thenReturn(dbResults);

        Map<String, BigDecimal> result = expenseService.getMonthlyTotalsForCurrentUser(start, end);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(new BigDecimal("8000000"), result.get("2026-06"));
        assertEquals(new BigDecimal("9500000"), result.get("2026-05"));
    }
}
