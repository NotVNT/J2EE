package com.example.moneymanager.repository;

import com.example.moneymanager.entity.ProfileEntity;
import com.example.moneymanager.entity.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfileRepository extends JpaRepository<ProfileEntity, Long> {

    Optional<ProfileEntity> findByEmail(String email);

    Optional<ProfileEntity> findByActivationToken(String activationToken);

    Optional<ProfileEntity> findByResetPasswordToken(String resetPasswordToken);

    Boolean existsByEmail(String email);

    long countBySubscriptionStatus(SubscriptionStatus status);
}