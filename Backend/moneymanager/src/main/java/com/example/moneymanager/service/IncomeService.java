package com.example.moneymanager.service;

import com.example.moneymanager.dto.IncomeDTO;
import com.example.moneymanager.entity.CategoryEntity;
import com.example.moneymanager.entity.IncomeEntity;
import com.example.moneymanager.entity.ProfileEntity;
import com.example.moneymanager.repository.CategoryRepository;
import com.example.moneymanager.repository.IncomeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IncomeService {
    private final CategoryRepository categoryRepository;
    private final IncomeRepository incomeRepository;
    private final ProfileService profileService;
    private final SubscriptionService subscriptionService;
    private final NotificationService notificationService;
    private final com.example.moneymanager.repository.JarRepository jarRepository;
    private final com.example.moneymanager.repository.IncomeAllocationRepository incomeAllocationRepository;
    private final JarService jarService;

    // Adds a new income to the database
    public IncomeDTO addIncome(IncomeDTO dto) {
        ProfileEntity profile = profileService.getCurrentProfile();
        subscriptionService.ensureCanCreateTransaction(profile, dto.getDate());
        return addIncomeInternal(dto, profile);
    }

    // Internal method bypassing plan limits (used by cron)
    public IncomeDTO addIncomeInternal(IncomeDTO dto, ProfileEntity profile) {
        CategoryEntity category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        IncomeEntity newIncome = toEntity(dto, profile, category);
        newIncome = incomeRepository.save(newIncome);

        if (dto.getAllocations() != null && !dto.getAllocations().isEmpty()) {
            for (com.example.moneymanager.dto.IncomeAllocationDTO allocDTO : dto.getAllocations()) {
                com.example.moneymanager.entity.JarEntity jar = jarRepository.findById(allocDTO.getJarId())
                    .orElseThrow(() -> new RuntimeException("Jar not found"));
                if (!jar.getProfile().getId().equals(profile.getId())) {
                    throw new RuntimeException("Unauthorized jar access");
                }
                jar.setCurrentBalance(jar.getCurrentBalance().add(allocDTO.getAmount()));
                jarRepository.save(jar);
                
                com.example.moneymanager.entity.IncomeAllocationEntity allocation = com.example.moneymanager.entity.IncomeAllocationEntity.builder()
                        .income(newIncome)
                        .jar(jar)
                        .amount(allocDTO.getAmount())
                        .build();
                incomeAllocationRepository.save(allocation);
            }
        } else {
            List<com.example.moneymanager.entity.JarEntity> jars = jarRepository.findByProfile(profile);
            if (jars.isEmpty()) {
                jars = jarService.initializeDefaultJars(profile);
            }
            
            java.math.BigDecimal totalAmount = dto.getAmount();
            java.math.BigDecimal allocatedSum = java.math.BigDecimal.ZERO;
            
            for (int i = 0; i < jars.size(); i++) {
                com.example.moneymanager.entity.JarEntity jar = jars.get(i);
                java.math.BigDecimal pct = jar.getTargetPercentage() != null ? jar.getTargetPercentage() : java.math.BigDecimal.ZERO;
                java.math.BigDecimal allocAmount;
                
                if (i == jars.size() - 1) {
                    allocAmount = totalAmount.subtract(allocatedSum);
                } else {
                    allocAmount = totalAmount.multiply(pct).divide(new java.math.BigDecimal("100.00"), 2, java.math.RoundingMode.HALF_UP);
                }
                
                if (allocAmount.compareTo(java.math.BigDecimal.ZERO) > 0) {
                    jar.setCurrentBalance(jar.getCurrentBalance().add(allocAmount));
                    jarRepository.save(jar);
                    
                    com.example.moneymanager.entity.IncomeAllocationEntity allocation = com.example.moneymanager.entity.IncomeAllocationEntity.builder()
                            .income(newIncome)
                            .jar(jar)
                            .amount(allocAmount)
                            .build();
                    incomeAllocationRepository.save(allocation);
                    
                    allocatedSum = allocatedSum.add(allocAmount);
                }
            }
        }

        // Notify income added
        notificationService.notifyIncomeAdded(profile, newIncome.getName(), newIncome.getAmount());

        return toDTO(newIncome);
    }

    // Wrapper for Excel/Email controllers to keep backward compatibility
    public List<IncomeDTO> getCurrentMonthIncomesForCurrentUser() {
        return getIncomesForCurrentUser(null, null, false);
    }

    // Retrieves incomes flexibly: all, specific month/year, or defaults to current month
    public List<IncomeDTO> getIncomesForCurrentUser(Integer month, Integer year, Boolean all) {
        ProfileEntity profile = profileService.getCurrentProfile();
        if (Boolean.TRUE.equals(all)) {
            List<IncomeEntity> list = incomeRepository.findByProfileIdOrderByDateDesc(profile.getId());
            return list.stream().map(this::toDTO).toList();
        }
        LocalDate now = LocalDate.now();
        int targetMonth = (month != null && month >= 1 && month <= 12) ? month : now.getMonthValue();
        int targetYear = (year != null && year > 1900) ? year : now.getYear();
        LocalDate startDate = LocalDate.of(targetYear, targetMonth, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        List<IncomeEntity> list = incomeRepository.findByProfileIdAndDateBetween(profile.getId(), startDate, endDate);
        return list.stream().map(this::toDTO).toList();
    }

    //delete income by id for current user
    @Transactional
    public void deleteIncome(Long incomeId) {
        ProfileEntity profile = profileService.getCurrentProfile();
        IncomeEntity entity = incomeRepository.findById(incomeId)
                .orElseThrow(() -> new RuntimeException("Income not found"));
        if (!entity.getProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Unauthorized to delete this income");
        }
        
        List<com.example.moneymanager.entity.IncomeAllocationEntity> allocations = incomeAllocationRepository.findByIncomeId(incomeId);
        for (com.example.moneymanager.entity.IncomeAllocationEntity alloc : allocations) {
            com.example.moneymanager.entity.JarEntity jar = alloc.getJar();
            jar.setCurrentBalance(jar.getCurrentBalance().subtract(alloc.getAmount()));
            jarRepository.save(jar);
        }
        
        incomeRepository.delete(entity);
    }

    // Get latest 5 incomes for current user
    public List<IncomeDTO> getLatest5IncomesForCurrentUser() {
        ProfileEntity profile = profileService.getCurrentProfile();
        List<IncomeEntity> list = incomeRepository.findTop5ByProfileIdOrderByDateDesc(profile.getId());
        return list.stream().map(this::toDTO).toList();
    }

    // Get total incomes for current user
    public BigDecimal getTotalIncomeForCurrentUser() {
        ProfileEntity profile = profileService.getCurrentProfile();
        BigDecimal total = incomeRepository.findTotalIncomeByProfileId(profile.getId());
        return total != null ? total : BigDecimal.ZERO;
    }

    public long getTotalIncomeCountForCurrentUser() {
        ProfileEntity profile = profileService.getCurrentProfile();
        return incomeRepository.countByProfileId(profile.getId());
    }

    //filter incomes
    public List<IncomeDTO> filterIncomes(LocalDate startDate, LocalDate endDate, String keyword, Sort sort) {
        ProfileEntity profile = profileService.getCurrentProfile();
        List<IncomeEntity> list = incomeRepository.findByProfileIdAndDateBetweenAndNameContainingIgnoreCase(profile.getId(), startDate, endDate, keyword, sort);
        return list.stream().map(this::toDTO).toList();
    }

    //helper methods
    private IncomeEntity toEntity(IncomeDTO dto, ProfileEntity profile, CategoryEntity category) {
        return IncomeEntity.builder()
                .name(dto.getName())
                .icon(dto.getIcon())
                .amount(dto.getAmount())
                .date(dto.getDate())
                .profile(profile)
                .category(category)
                .build();
    }

    private IncomeDTO toDTO(IncomeEntity entity) {
        return IncomeDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .icon(entity.getIcon())
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
                .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : "N/A")
                .amount(entity.getAmount())
                .date(entity.getDate())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .allocations(entity.getAllocations() != null ? entity.getAllocations().stream().map(alloc -> com.example.moneymanager.dto.IncomeAllocationDTO.builder()
                        .id(alloc.getId())
                        .incomeId(alloc.getIncome().getId())
                        .jarId(alloc.getJar().getId())
                        .jarName(alloc.getJar().getName())
                        .amount(alloc.getAmount())
                        .build()).collect(java.util.stream.Collectors.toList()) : new java.util.ArrayList<>())
                .build();
    }

    public List<IncomeDTO> getIncomesByMonthForCurrentUser(int year, int monthValue) {
        ProfileEntity profile = profileService.getCurrentProfile();

        // Tạo ngày bắt đầu và kết thúc của tháng cần lấy
        LocalDate startDate = LocalDate.of(year, monthValue, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        // Lấy danh sách thu nhập trong khoảng thời gian đó
        List<IncomeEntity> incomes = incomeRepository.findByProfileIdAndDateBetween(
                profile.getId(),
                startDate,
                endDate
        );

        // Chuyển đổi sang DTO và trả về
        return incomes.stream()
                .map(this::toDTO)
                .collect(java.util.stream.Collectors.toList());
    }
}
