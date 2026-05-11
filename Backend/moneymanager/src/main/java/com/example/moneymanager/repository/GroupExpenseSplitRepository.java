package com.example.moneymanager.repository;

import com.example.moneymanager.entity.GroupExpenseSplitEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupExpenseSplitRepository extends JpaRepository<GroupExpenseSplitEntity, Long> {
    
    @Query("SELECT s FROM GroupExpenseSplitEntity s WHERE s.member.id = :memberId AND s.groupExpense.group.id = :groupId AND s.isPaid = false")
    List<GroupExpenseSplitEntity> findUnpaidByMemberIdAndGroupId(@Param("memberId") Long memberId, @Param("groupId") Long groupId);

    List<GroupExpenseSplitEntity> findByGroupExpenseId(Long groupExpenseId);
}
