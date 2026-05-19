package com.example.moneymanager.repository;

import com.example.moneymanager.entity.JarEntity;
import com.example.moneymanager.entity.ProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JarRepository extends JpaRepository<JarEntity, Long> {
    List<JarEntity> findByProfile(ProfileEntity profile);
    List<JarEntity> findByProfileId(Long profileId);
    long countByProfileId(Long profileId);
}
