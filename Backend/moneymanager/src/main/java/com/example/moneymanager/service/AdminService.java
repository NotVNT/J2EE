package com.example.moneymanager.service;

import com.example.moneymanager.dto.AdminOverviewDTO;
import com.example.moneymanager.dto.AdminPaymentDTO;
import com.example.moneymanager.entity.PaymentEntity;
import com.example.moneymanager.entity.ProfileEntity;
import com.example.moneymanager.entity.SubscriptionStatus;
import com.example.moneymanager.repository.PaymentRepository;
import com.example.moneymanager.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ProfileService profileService;
    private final ProfileRepository profileRepository;
    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public AdminOverviewDTO getOverview() {
        ensureAdmin();

        return AdminOverviewDTO.builder()
                .totalUsers(profileRepository.count())
                .activeSubscriptions(profileRepository.countBySubscriptionStatus(SubscriptionStatus.ACTIVE))
                .totalPayments(paymentRepository.count())
                .paidPayments(paymentRepository.countByStatusIgnoreCase("PAID"))
                .systemStatus("Online")
                .build();
    }

    @Transactional(readOnly = true)
    public List<AdminPaymentDTO> getPayments(String status, String search, Integer limit) {
        ensureAdmin();

        List<PaymentEntity> payments = (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status))
                ? paymentRepository.findAllWithProfileOrderByCreatedAtDesc()
                : paymentRepository.findByStatusWithProfileOrderByCreatedAtDesc(status);

        Stream<PaymentEntity> stream = payments.stream();

        if (search != null && !search.isBlank()) {
            String keyword = search.trim().toLowerCase(Locale.ROOT);
            stream = stream.filter(payment -> containsKeyword(payment, keyword));
        }

        if (limit != null && limit > 0) {
            stream = stream.limit(limit);
        }

        return stream.map(this::toAdminPaymentDTO).toList();
    }

    private boolean containsKeyword(PaymentEntity payment, String keyword) {
        String orderCode = payment.getOrderCode() != null ? String.valueOf(payment.getOrderCode()) : "";
        String description = payment.getDescription() != null ? payment.getDescription().toLowerCase(Locale.ROOT) : "";
        String planName = payment.getPlanName() != null ? payment.getPlanName().toLowerCase(Locale.ROOT) : "";
        String email = payment.getProfile() != null && payment.getProfile().getEmail() != null
                ? payment.getProfile().getEmail().toLowerCase(Locale.ROOT)
                : "";
        String fullName = payment.getProfile() != null && payment.getProfile().getFullName() != null
                ? payment.getProfile().getFullName().toLowerCase(Locale.ROOT)
                : "";

        return orderCode.contains(keyword)
                || description.contains(keyword)
                || planName.contains(keyword)
                || email.contains(keyword)
                || fullName.contains(keyword);
    }

    private AdminPaymentDTO toAdminPaymentDTO(PaymentEntity paymentEntity) {
        return AdminPaymentDTO.builder()
                .orderCode(paymentEntity.getOrderCode())
                .amount(paymentEntity.getAmount())
                .description(paymentEntity.getDescription())
                .status(paymentEntity.getStatus())
                .planId(paymentEntity.getPlanId())
                .planName(paymentEntity.getPlanName())
                .cycleMonths(paymentEntity.getCycleMonths())
                .payerEmail(paymentEntity.getProfile() != null ? paymentEntity.getProfile().getEmail() : null)
                .payerName(paymentEntity.getProfile() != null ? paymentEntity.getProfile().getFullName() : null)
                .createdAt(paymentEntity.getCreatedAt())
                .updatedAt(paymentEntity.getUpdatedAt())
                .build();
    }

    private void ensureAdmin() {
        ProfileEntity currentProfile = profileService.getCurrentProfile();
        String roleName = currentProfile.getRole() != null ? currentProfile.getRole().getName() : "";
        if (!"admin".equalsIgnoreCase(roleName)) {
            throw new RuntimeException("Forbidden: admin access required");
        }
    }
}
