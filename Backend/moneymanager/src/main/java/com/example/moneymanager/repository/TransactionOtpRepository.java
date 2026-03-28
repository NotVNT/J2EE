package com.example.moneymanager.repository;

import com.example.moneymanager.entity.TransactionOtpEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionOtpRepository extends JpaRepository<TransactionOtpEntity, Long> {

    Optional<TransactionOtpEntity> findTopByProfileIdOrderByCreatedAtDesc(Long profileId);

    List<TransactionOtpEntity> findByProfileIdAndConsumedAtIsNullAndRevokedAtIsNull(Long profileId);

    Optional<TransactionOtpEntity> findByTransactionAuthorizationToken(String transactionAuthorizationToken);
}
