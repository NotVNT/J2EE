package com.example.moneymanager.repository;

import com.example.moneymanager.entity.ProfileEntity;
import com.example.moneymanager.entity.SubscriptionStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProfileRepository extends JpaRepository<ProfileEntity, Long> {

    Optional<ProfileEntity> findByEmail(String email);

    Optional<ProfileEntity> findByActivationToken(String activationToken);

    Optional<ProfileEntity> findByResetPasswordToken(String resetPasswordToken);

    Boolean existsByEmail(String email);

    long countBySubscriptionStatus(SubscriptionStatus status);

    /**
     * Pessimistic write lock on the profile row — used as a serialization point
     * before checking child-row limits (e.g. jar count) to prevent TOCTOU races
     * even when the child table is empty and has no rows to lock itself.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM ProfileEntity p WHERE p.id = :id")
    Optional<ProfileEntity> findByIdForUpdate(@Param("id") Long id);
}