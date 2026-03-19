package com.example.moneymanager.repository;

import com.example.moneymanager.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {

    Optional<PaymentEntity> findByOrderCode(Long orderCode);

    Optional<PaymentEntity> findByPaymentLinkId(String paymentLinkId);

    List<PaymentEntity> findByStatusIn(List<String> statuses);
}
