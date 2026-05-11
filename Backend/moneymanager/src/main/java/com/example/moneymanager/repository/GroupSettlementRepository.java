package com.example.moneymanager.repository;

import com.example.moneymanager.entity.GroupSettlementEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupSettlementRepository extends JpaRepository<GroupSettlementEntity, Long> {
    
    @Query("SELECT s FROM GroupSettlementEntity s WHERE s.group.id = :groupId AND (s.payer.id = :profileId OR s.payee.id = :profileId) ORDER BY s.settledAt DESC")
    List<GroupSettlementEntity> findByGroupIdAndPayerIdOrPayeeId(@Param("groupId") Long groupId, @Param("profileId") Long profileId);

    List<GroupSettlementEntity> findByGroupIdOrderBySettledAtDesc(Long groupId);
}
