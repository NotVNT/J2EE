package com.example.moneymanager.repository;

import com.example.moneymanager.entity.PaymentOtpEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentOtpRepository extends JpaRepository<PaymentOtpEntity, Long> {

    Optional<PaymentOtpEntity> findTopByProfileIdOrderByCreatedAtDesc(Long profileId);

    List<PaymentOtpEntity> findByProfileIdAndConsumedAtIsNullAndRevokedAtIsNull(Long profileId);

    Optional<PaymentOtpEntity> findByPaymentAuthorizationToken(String paymentAuthorizationToken);
}
