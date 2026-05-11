package com.example.moneymanager.repository;

import com.example.moneymanager.entity.GroupExpenseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupExpenseRepository extends JpaRepository<GroupExpenseEntity, Long> {
    List<GroupExpenseEntity> findByGroupIdOrderByDateDesc(Long groupId);
    Page<GroupExpenseEntity> findByGroupIdOrderByDateDesc(Long groupId, Pageable pageable);
}
