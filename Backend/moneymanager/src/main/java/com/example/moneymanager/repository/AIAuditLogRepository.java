package com.example.moneymanager.repository;

import com.example.moneymanager.entity.AIAuditLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AIAuditLogRepository extends JpaRepository<AIAuditLogEntity, Long> {

    List<AIAuditLogEntity> findByProfileIdOrderByCreatedAtDesc(Long profileId);

    List<AIAuditLogEntity> findByProfileIdAndStatusOrderByCreatedAtDesc(Long profileId, AIAuditLogEntity.AuditStatus status);
}
