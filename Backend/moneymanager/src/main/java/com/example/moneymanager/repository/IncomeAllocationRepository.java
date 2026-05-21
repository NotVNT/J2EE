package com.example.moneymanager.repository;

import com.example.moneymanager.entity.IncomeAllocationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncomeAllocationRepository extends JpaRepository<IncomeAllocationEntity, Long> {
    List<IncomeAllocationEntity> findByIncomeId(Long incomeId);
    List<IncomeAllocationEntity> findByJarId(Long jarId);
}
