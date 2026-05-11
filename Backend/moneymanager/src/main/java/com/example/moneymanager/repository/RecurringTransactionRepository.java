package com.example.moneymanager.repository;

import com.example.moneymanager.entity.RecurringTransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RecurringTransactionRepository extends JpaRepository<RecurringTransactionEntity, Long> {
    List<RecurringTransactionEntity> findByProfileIdOrderByNextRunDateAsc(Long profileId);
    List<RecurringTransactionEntity> findByIsActiveTrueAndNextRunDateLessThanEqual(LocalDate date);
}
