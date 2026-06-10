package com.example.moneymanager.repository;

import com.example.moneymanager.entity.AiViolationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface AiViolationRepository extends JpaRepository<AiViolationEntity, Long> {

    List<AiViolationEntity> findByProfileIdOrderByCreatedAtDesc(Long profileId);

    long countByProfileId(Long profileId);

    @Transactional
    void deleteByProfileId(Long profileId);
}
