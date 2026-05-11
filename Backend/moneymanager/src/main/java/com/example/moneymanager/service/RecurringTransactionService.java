package com.example.moneymanager.service;

import com.example.moneymanager.dto.ExpenseDTO;
import com.example.moneymanager.dto.IncomeDTO;
import com.example.moneymanager.dto.RecurringTransactionDTO;
import com.example.moneymanager.entity.CategoryEntity;
import com.example.moneymanager.entity.ProfileEntity;
import com.example.moneymanager.entity.RecurringTransactionEntity;
import com.example.moneymanager.entity.NotificationType;
import com.example.moneymanager.entity.enums.RecurrenceFrequency;
import com.example.moneymanager.repository.CategoryRepository;
import com.example.moneymanager.repository.RecurringTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecurringTransactionService {

    private final RecurringTransactionRepository recurringTransactionRepository;
    private final CategoryRepository categoryRepository;
    private final ExpenseService expenseService;
    private final IncomeService incomeService;
    private final NotificationService notificationService;
    private final SubscriptionService subscriptionService;
    private final ProfileService profileService;

    public RecurringTransactionDTO createRecurring(RecurringTransactionDTO dto) {
        ProfileEntity profile = profileService.getCurrentProfile();
        subscriptionService.ensureCanUseRecurring(profile);

        CategoryEntity category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Unauthorized category access");
        }

        RecurringTransactionEntity entity = RecurringTransactionEntity.builder()
                .profile(profile)
                .category(category)
                .type(dto.getType())
                .name(dto.getName())
                .description(dto.getDescription())
                .icon(dto.getIcon())
                .amount(dto.getAmount())
                .frequency(dto.getFrequency())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .nextRunDate(dto.getStartDate())
                .isActive(true)
                .build();

        return toDTO(recurringTransactionRepository.save(entity));
    }

    public List<RecurringTransactionDTO> getAllForCurrentUser() {
        ProfileEntity profile = profileService.getCurrentProfile();
        return recurringTransactionRepository.findByProfileIdOrderByNextRunDateAsc(profile.getId())
                .stream().map(this::toDTO).toList();
    }

    public RecurringTransactionDTO update(Long id, RecurringTransactionDTO dto) {
        ProfileEntity profile = profileService.getCurrentProfile();
        subscriptionService.ensureCanUseRecurring(profile);

        RecurringTransactionEntity entity = recurringTransactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recurring transaction not found"));

        if (!entity.getProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        CategoryEntity category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Unauthorized category access");
        }

        entity.setCategory(category);
        entity.setType(dto.getType());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setIcon(dto.getIcon());
        entity.setAmount(dto.getAmount());
        entity.setFrequency(dto.getFrequency());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setNextRunDate(dto.getNextRunDate() != null ? dto.getNextRunDate() : dto.getStartDate());

        return toDTO(recurringTransactionRepository.save(entity));
    }

    public void delete(Long id) {
        ProfileEntity profile = profileService.getCurrentProfile();
        RecurringTransactionEntity entity = recurringTransactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recurring transaction not found"));

        if (!entity.getProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        recurringTransactionRepository.delete(entity);
    }

    public RecurringTransactionDTO toggle(Long id) {
        ProfileEntity profile = profileService.getCurrentProfile();
        subscriptionService.ensureCanUseRecurring(profile);

        RecurringTransactionEntity entity = recurringTransactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recurring transaction not found"));

        if (!entity.getProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        entity.setIsActive(!entity.getIsActive());
        return toDTO(recurringTransactionRepository.save(entity));
    }

    @Scheduled(cron = "0 1 0 * * *") // Daily at 00:01
    @Transactional
    public void processRecurringTransactions() {
        log.info("Job started: processRecurringTransactions()");
        LocalDate today = LocalDate.now();
        List<RecurringTransactionEntity> dueTransactions = recurringTransactionRepository
                .findByIsActiveTrueAndNextRunDateLessThanEqual(today);

        for (RecurringTransactionEntity recurring : dueTransactions) {
            try {
                if (recurring.getEndDate() != null && today.isAfter(recurring.getEndDate())) {
                    recurring.setIsActive(false);
                    recurringTransactionRepository.save(recurring);
                    continue;
                }

                if ("EXPENSE".equalsIgnoreCase(recurring.getType())) {
                    ExpenseDTO dto = ExpenseDTO.builder()
                            .categoryId(recurring.getCategory().getId())
                            .name(recurring.getName())
                            .icon(recurring.getIcon())
                            .amount(recurring.getAmount())
                            .date(today)
                            .build();
                    expenseService.addExpenseInternal(dto, recurring.getProfile());
                } else if ("INCOME".equalsIgnoreCase(recurring.getType())) {
                    IncomeDTO dto = IncomeDTO.builder()
                            .categoryId(recurring.getCategory().getId())
                            .name(recurring.getName())
                            .icon(recurring.getIcon())
                            .amount(recurring.getAmount())
                            .date(today)
                            .build();
                    incomeService.addIncomeInternal(dto, recurring.getProfile());
                }

                recurring.setNextRunDate(calculateNextRunDate(recurring.getNextRunDate(), recurring.getFrequency()));
                recurringTransactionRepository.save(recurring);

                notificationService.createNotification(
                        recurring.getProfile(),
                        "Giao dịch định kỳ đã thực hiện",
                        String.format("Giao dịch '%s' đã được tạo tự động.", recurring.getName()),
                        NotificationType.SYSTEM
                );
            } catch (Exception e) {
                log.error("Failed to process recurring transaction ID {}: {}", recurring.getId(), e.getMessage());
            }
        }
        log.info("Job completed: processRecurringTransactions()");
    }

    private LocalDate calculateNextRunDate(LocalDate currentRunDate, RecurrenceFrequency frequency) {
        return switch (frequency) {
            case DAILY -> currentRunDate.plusDays(1);
            case WEEKLY -> currentRunDate.plusWeeks(1);
            case MONTHLY -> currentRunDate.plusMonths(1);
            case YEARLY -> currentRunDate.plusYears(1);
        };
    }

    private RecurringTransactionDTO toDTO(RecurringTransactionEntity entity) {
        return RecurringTransactionDTO.builder()
                .id(entity.getId())
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
                .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : null)
                .type(entity.getType())
                .name(entity.getName())
                .description(entity.getDescription())
                .icon(entity.getIcon())
                .amount(entity.getAmount())
                .frequency(entity.getFrequency())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .nextRunDate(entity.getNextRunDate())
                .isActive(entity.getIsActive())
                .build();
    }
}
