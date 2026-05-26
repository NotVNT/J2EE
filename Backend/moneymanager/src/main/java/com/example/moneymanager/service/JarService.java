package com.example.moneymanager.service;

import com.example.moneymanager.dto.JarDTO;
import com.example.moneymanager.entity.JarEntity;
import com.example.moneymanager.entity.ProfileEntity;
import com.example.moneymanager.entity.SubscriptionPlan;
import com.example.moneymanager.repository.JarRepository;
import com.example.moneymanager.repository.IncomeAllocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JarService {

    private final JarRepository jarRepository;
    private final ProfileService profileService;
    private final SubscriptionService subscriptionService;
    private final IncomeAllocationRepository incomeAllocationRepository;
    private final com.example.moneymanager.repository.ExpenseRepository expenseRepository;

    @Transactional
    public JarDTO createJar(JarDTO jarDTO) {
        if (jarDTO.getName() == null || jarDTO.getName().trim().isEmpty()) {
            throw new RuntimeException("Tên hũ không được để trống");
        }

        ProfileEntity profile = profileService.getCurrentProfile();

        subscriptionService.ensureCanCreateJar(profile);

        if (jarDTO.getTargetPercentage() != null) {
            BigDecimal pct = jarDTO.getTargetPercentage();
            if (pct.compareTo(BigDecimal.ZERO) < 0 || pct.compareTo(new BigDecimal("100")) > 0) {
                throw new RuntimeException("Tỷ lệ phân bổ phải trong khoảng 0-100%");
            }
            BigDecimal currentTotal = jarRepository.sumNonDefaultPercentagesByProfile(profile.getId(), null);
            if (currentTotal.add(pct).compareTo(new BigDecimal("100")) > 0) {
                throw new RuntimeException("Tổng tỷ lệ phân bổ của các hũ không được vượt quá 100%. Hiện tại đã dùng " + currentTotal + "%.");
            }
        }

        JarEntity jar = JarEntity.builder()
                .profile(profile)
                .name(jarDTO.getName())
                .icon(jarDTO.getIcon())
                .color(jarDTO.getColor())
                .targetPercentage(jarDTO.getTargetPercentage() != null ? jarDTO.getTargetPercentage() : BigDecimal.ZERO)
                .currentBalance(BigDecimal.ZERO)  // always zero on creation; use transfer to move funds
                .build();

        JarEntity savedJar = jarRepository.save(jar);

        return mapToDTO(savedJar);
    }

    public List<JarEntity> initializeDefaultJars(ProfileEntity profile) {
        List<JarEntity> defaultJars = List.of(
            JarEntity.builder().profile(profile).name("Thiết yếu").icon("🏠").color("#EF4444").targetPercentage(new BigDecimal("55.00")).currentBalance(BigDecimal.ZERO).build(),
            JarEntity.builder().profile(profile).name("Tiết kiệm").icon("💼").color("#10B981").targetPercentage(new BigDecimal("10.00")).currentBalance(BigDecimal.ZERO).build(),
            JarEntity.builder().profile(profile).name("Giáo dục").icon("🎓").color("#3B82F6").targetPercentage(new BigDecimal("10.00")).currentBalance(BigDecimal.ZERO).build(),
            JarEntity.builder().profile(profile).name("Hưởng thụ").icon("🎉").color("#EC4899").targetPercentage(new BigDecimal("10.00")).currentBalance(BigDecimal.ZERO).build(),
            JarEntity.builder().profile(profile).name("Đầu tư").icon("📈").color("#F59E0B").targetPercentage(new BigDecimal("10.00")).currentBalance(BigDecimal.ZERO).build(),
            JarEntity.builder().profile(profile).name("Từ thiện").icon("❤️").color("#F97316").targetPercentage(new BigDecimal("5.00")).currentBalance(BigDecimal.ZERO).build()
        );
        return jarRepository.saveAll(defaultJars);
    }
    public List<JarDTO> getAllJars() {
        ProfileEntity profile = profileService.getCurrentProfile();
        List<JarEntity> jars = jarRepository.findByProfile(profile);
        return jars.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public List<JarDTO> createJarsBulk(List<JarDTO> jarDTOs) {
        if (jarDTOs == null || jarDTOs.isEmpty()) {
            throw new RuntimeException("Danh sách hũ khởi tạo không được để trống");
        }

        ProfileEntity profile = profileService.getCurrentProfile();

        // 1. Kiểm tra tổng tỷ lệ phân bổ phải bằng đúng 100%
        BigDecimal totalPct = jarDTOs.stream()
                .map(j -> j.getTargetPercentage() != null ? j.getTargetPercentage() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalPct.compareTo(new BigDecimal("100.00")) != 0) {
            throw new RuntimeException("Tổng tỷ lệ phần trăm phân bổ của các hũ phải bằng đúng 100%");
        }

        // 2. Kiểm tra giới hạn số lượng hũ của gói Subscription hiện tại
        long currentJarCount = jarRepository.countByProfileId(profile.getId());
        long newJarCount = jarDTOs.size();
        long totalJarCount = currentJarCount + newJarCount;

        if (profile.getSubscriptionPlan() == SubscriptionPlan.FREE && totalJarCount > 1) {
            throw new RuntimeException("Gói FREE chỉ được tạo tối đa 1 hũ. Vui lòng nâng cấp gói thành viên!");
        } else if (profile.getSubscriptionPlan() == SubscriptionPlan.BASIC && totalJarCount > 6) {
            throw new RuntimeException("Gói BASIC chỉ được tạo tối đa 6 hũ. Vui lòng nâng cấp gói thành viên!");
        }

        // 3. Thực hiện chuyển đổi và lưu hàng loạt
        List<JarEntity> entitiesToSave = jarDTOs.stream().map(dto -> {
            if (dto.getName() == null || dto.getName().trim().isEmpty()) {
                throw new RuntimeException("Tên hũ không được để trống");
            }
            BigDecimal pct = dto.getTargetPercentage();
            if (pct != null && (pct.compareTo(BigDecimal.ZERO) < 0 || pct.compareTo(new BigDecimal("100")) > 0)) {
                throw new RuntimeException("Tỷ lệ phân bổ phải trong khoảng 0-100%");
            }
            return JarEntity.builder()
                    .profile(profile)
                    .name(dto.getName().trim())
                    .icon(dto.getIcon())
                    .color(dto.getColor())
                    .targetPercentage(dto.getTargetPercentage() != null ? dto.getTargetPercentage() : BigDecimal.ZERO)
                    .currentBalance(dto.getCurrentBalance() != null ? dto.getCurrentBalance() : BigDecimal.ZERO)
                    .build();
        }).toList();

        List<JarEntity> saved = jarRepository.saveAll(entitiesToSave);
        return saved.stream().map(this::mapToDTO).toList();
    }

    @Transactional
    public JarDTO updateJar(Long jarId, JarDTO jarDTO) {
        if (jarDTO.getName() == null || jarDTO.getName().trim().isEmpty()) {
            throw new RuntimeException("Tên hũ không được để trống");
        }

        ProfileEntity profile = profileService.getCurrentProfile();
        JarEntity jar = jarRepository.findById(jarId)
                .orElseThrow(() -> new RuntimeException("Jar not found"));

        if (!jar.getProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        jar.setName(jarDTO.getName());
        jar.setIcon(jarDTO.getIcon());
        jar.setColor(jarDTO.getColor());

        if (jarDTO.getTargetPercentage() != null) {
            BigDecimal pct = jarDTO.getTargetPercentage();
            if (pct.compareTo(BigDecimal.ZERO) < 0 || pct.compareTo(new BigDecimal("100")) > 0) {
                throw new RuntimeException("Tỷ lệ phân bổ phải trong khoảng 0-100%");
            }
            jar.setTargetPercentage(jarDTO.getTargetPercentage());
        }

        JarEntity savedJar = jarRepository.save(jar);
        return mapToDTO(savedJar);
    }

    @Transactional
    public void deleteJar(Long jarId) {
        ProfileEntity profile = profileService.getCurrentProfile();
        JarEntity jar = jarRepository.findById(jarId)
                .orElseThrow(() -> new RuntimeException("Jar not found"));

        if (!jar.getProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        // 1. Delete all income allocations referencing this jar
        List<com.example.moneymanager.entity.IncomeAllocationEntity> allocations = incomeAllocationRepository.findByJarId(jarId);
        if (!allocations.isEmpty()) {
            incomeAllocationRepository.deleteAll(allocations);
        }

        // 2. Nullify jar reference in expenses
        List<com.example.moneymanager.entity.ExpenseEntity> expenses = expenseRepository.findByJarId(jarId);
        for (com.example.moneymanager.entity.ExpenseEntity expense : expenses) {
            expense.setJar(null);
            expenseRepository.save(expense);
        }

        // 3. Now safe to delete the jar
        jarRepository.delete(jar);
    }

    @Transactional
    public void transferBalance(Long fromJarId, Long toJarId, BigDecimal amount) {
        if (fromJarId.equals(toJarId)) {
            throw new RuntimeException("Không thể chuyển tiền vào cùng một hũ");
        }
        ProfileEntity profile = profileService.getCurrentProfile();
        JarEntity fromJar = jarRepository.findById(fromJarId)
                .orElseThrow(() -> new RuntimeException("Source Jar not found"));
        JarEntity toJar = jarRepository.findById(toJarId)
                .orElseThrow(() -> new RuntimeException("Destination Jar not found"));

        if (!fromJar.getProfile().getId().equals(profile.getId()) || !toJar.getProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Amount must be positive");
        }
        if (fromJar.getCurrentBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Số dư hũ nguồn không đủ");
        }

        fromJar.setCurrentBalance(fromJar.getCurrentBalance().subtract(amount));
        toJar.setCurrentBalance(toJar.getCurrentBalance().add(amount));

        jarRepository.save(fromJar);
        jarRepository.save(toJar);
    }



    public JarDTO mapToDTO(JarEntity entity) {
        return JarDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .icon(entity.getIcon())
                .color(entity.getColor())
                .targetPercentage(entity.getTargetPercentage())
                .currentBalance(entity.getCurrentBalance())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
