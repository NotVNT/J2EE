package com.example.moneymanager.repository;

import com.example.moneymanager.entity.GroupMemberEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMemberEntity, Long> {
    List<GroupMemberEntity> findByGroupId(Long groupId);
    List<GroupMemberEntity> findByProfileId(Long profileId);
    Optional<GroupMemberEntity> findByGroupIdAndProfileId(Long groupId, Long profileId);
    boolean existsByGroupIdAndProfileId(Long groupId, Long profileId);

    // Batch load members for multiple groups to avoid N+1
    @EntityGraph(attributePaths = {"profile", "group"})
    List<GroupMemberEntity> findByGroupIdIn(List<Long> groupIds);
}
