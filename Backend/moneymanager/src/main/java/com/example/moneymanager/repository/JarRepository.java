package com.example.moneymanager.repository;

import com.example.moneymanager.entity.JarEntity;
import com.example.moneymanager.entity.ProfileEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JarRepository extends JpaRepository<JarEntity, Long> {
    List<JarEntity> findByProfile(ProfileEntity profile);
    List<JarEntity> findByProfileId(Long profileId);
    long countByProfileId(Long profileId);
    void deleteByProfileId(Long profileId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT COUNT(j) FROM JarEntity j WHERE j.profile.id = :profileId AND j.name != :excludedName")
    long countByProfileIdExcludingNameForUpdate(@Param("profileId") Long profileId, @Param("excludedName") String excludedName);
}
