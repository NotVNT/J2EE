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
    private final IncomeAllocationRepository incomeAllocationRepository;
    private final com.example.moneymanager.repository.ExpenseRepository expenseRepository;

    @Transactional
    public JarDTO createJar(JarDTO jarDTO) {
        ProfileEntity profile = profileService.getCurrentProfile();

        long currentJarCount = jarRepository.countByProfileId(profile.getId());

        // Subscription check
        if (profile.getSubscriptionPlan() == SubscriptionPlan.FREE && currentJarCount >= 1) {
            throw new RuntimeException("Gói FREE chỉ được tạo 1 hũ. Vui lòng nâng cấp lên BASIC hoặc PREMIUM.");
        } else if (profile.getSubscriptionPlan() == SubscriptionPlan.BASIC && currentJarCount >= 6) {
            throw new RuntimeException("Gói BASIC tối đa 6 hũ. Vui lòng nâng cấp lên PREMIUM.");
        }

        if (!"Ví tổng".equals(jarDTO.getName()) && jarDTO.getTargetPercentage() != null) {
            BigDecimal pct = jarDTO.getTargetPercentage();
            if (pct.compareTo(BigDecimal.ZERO) < 0 || pct.compareTo(new BigDecimal("100")) > 0) {
                throw new RuntimeException("Tỷ lệ phân bổ phải trong khoảng 0-100%");
            }
        }

        JarEntity jar = JarEntity.builder()
                .profile(profile)
                .name(jarDTO.getName())
                .icon(jarDTO.getIcon())
                .color(jarDTO.getColor())
                .targetPercentage(jarDTO.getTargetPercentage() != null ? jarDTO.getTargetPercentage() : BigDecimal.ZERO)
                .currentBalance(jarDTO.getCurrentBalance() != null ? jarDTO.getCurrentBalance() : BigDecimal.ZERO)
                .build();

        JarEntity savedJar = jarRepository.save(jar);
        if (!"Ví tổng".equals(jar.getName())) {
            recalculateDefaultJarPercentage(profile);
        }
        return mapToDTO(savedJar);
    }

    public List<JarDTO> getAllJars() {
        ProfileEntity profile = profileService.getCurrentProfile();
        List<JarEntity> jars = jarRepository.findByProfile(profile);

        // Create Default Jar if none exists
        if (jars.isEmpty()) {
            JarEntity defaultJar = JarEntity.builder()
                    .profile(profile)
                    .name("Ví tổng")
                    .icon("")
                    .color("#4CAF50")
                    .targetPercentage(new BigDecimal("100.00"))
                    .currentBalance(BigDecimal.ZERO)
                    .build();
            jarRepository.save(defaultJar);
            jars.add(defaultJar);
        }

        return jars.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public JarDTO updateJar(Long jarId, JarDTO jarDTO) {
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
            if (!"Ví tổng".equals(jarDTO.getName())) {
                BigDecimal pct = jarDTO.getTargetPercentage();
                if (pct.compareTo(BigDecimal.ZERO) < 0 || pct.compareTo(new BigDecimal("100")) > 0) {
                    throw new RuntimeException("Tỷ lệ phân bổ phải trong khoảng 0-100%");
                }
            }
            jar.setTargetPercentage(jarDTO.getTargetPercentage());
        }

        JarEntity savedJar = jarRepository.save(jar);
        if (!"Ví tổng".equals(jar.getName())) {
            recalculateDefaultJarPercentage(profile);
        }
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
        recalculateDefaultJarPercentage(profile);
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

    private void recalculateDefaultJarPercentage(ProfileEntity profile) {
        List<JarEntity> jars = jarRepository.findByProfile(profile);
        JarEntity defaultJar = jars.stream()
                .filter(j -> "Ví tổng".equals(j.getName()))
                .findFirst()
                .orElse(null);

        if (defaultJar != null) {
            BigDecimal totalOther = jars.stream()
                    .filter(j -> !j.getId().equals(defaultJar.getId()))
                    .map(j -> j.getTargetPercentage() != null ? j.getTargetPercentage() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal remaining = new BigDecimal("100.00").subtract(totalOther);
            if (remaining.compareTo(BigDecimal.ZERO) < 0) remaining = BigDecimal.ZERO;

            defaultJar.setTargetPercentage(remaining);
            jarRepository.save(defaultJar);
        }
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
