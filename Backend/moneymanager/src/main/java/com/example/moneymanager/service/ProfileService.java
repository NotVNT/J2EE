package com.example.moneymanager.service;

import com.example.moneymanager.dto.AuthDTO;
import com.example.moneymanager.dto.AutoRenewRequestDTO;
import com.example.moneymanager.dto.ForgotPasswordRequestDTO;
import com.example.moneymanager.dto.ProfileDTO;
import com.example.moneymanager.dto.ResetPasswordRequestDTO;
import com.example.moneymanager.entity.ProfileEntity;
import com.example.moneymanager.repository.ProfileRepository;
import com.example.moneymanager.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final SubscriptionService subscriptionService;

    @Value("${app.activation.url}")
    private String activationURL;

    @Value("${app.reset-password.url}")
    private String resetPasswordURL;

    public ProfileDTO registerProfile(ProfileDTO profileDTO) {
        profileRepository.findByEmail(profileDTO.getEmail()).ifPresent(profile -> {
            throw new RuntimeException("Email already exists");
        });

        ProfileEntity newProfile = toEntity(profileDTO);
        newProfile.setActivationToken(UUID.randomUUID().toString());
        newProfile = profileRepository.save(newProfile);
        //send activation email
        String normalizedActivationUrl = activationURL.endsWith("/")
                ? activationURL.substring(0, activationURL.length() - 1)
                : activationURL;
        String activationLink = normalizedActivationUrl + "/activate?token=" + newProfile.getActivationToken();
        String subject = "Activate your Money Manager account";
        String body = "Click on the following link to activate your account: " + activationLink;
        emailService.sendEmail(newProfile.getEmail(), subject, body);
        return toDTO(newProfile);
    }

    public ProfileEntity toEntity(ProfileDTO profileDTO) {
        return ProfileEntity.builder()
                .id(profileDTO.getId())
                .fullName(profileDTO.getFullName())
                .email(profileDTO.getEmail())
                .password(passwordEncoder.encode(profileDTO.getPassword()))
                .profileImageUrl(profileDTO.getProfileImageUrl())
                .createdAt(profileDTO.getCreatedAt())
                .updatedAt(profileDTO.getUpdatedAt())
                .build();
    }

    public ProfileDTO toDTO(ProfileEntity profileEntity) {
        profileEntity = subscriptionService.refreshSubscriptionIfExpired(profileEntity);
        SubscriptionService.PlanFeatures planFeatures = subscriptionService.getPlanFeatures(profileEntity);

        return ProfileDTO.builder()
                .id(profileEntity.getId())
                .fullName(profileEntity.getFullName())
                .email(profileEntity.getEmail())
                .profileImageUrl(profileEntity.getProfileImageUrl())
                .createdAt(profileEntity.getCreatedAt())
                .updatedAt(profileEntity.getUpdatedAt())
                .subscriptionPlan(profileEntity.getSubscriptionPlan())
                .subscriptionStatus(profileEntity.getSubscriptionStatus())
                .subscriptionActivatedAt(profileEntity.getSubscriptionActivatedAt())
                .subscriptionExpiresAt(profileEntity.getSubscriptionExpiresAt())
                .autoRenew(profileEntity.getAutoRenew())
                .categoryLimit(planFeatures.getCategoryLimit())
                .monthlyTransactionLimit(planFeatures.getMonthlyTransactionLimit())
                .historyMonths(planFeatures.getHistoryMonths())
                .canExportReports(planFeatures.isCanExportReports())
                .canUseAdvancedFilters(planFeatures.isCanUseAdvancedFilters())
                .build();
    }

    public boolean activateProfile(String activationToken) {
        return profileRepository.findByActivationToken(activationToken)
                .map(profile -> {
                    profile.setIsActive(true);
                    profile.setActivationToken(null);
                    profileRepository.save(profile);
                    return true;
                })
                .orElse(false);
    }

    public boolean isAccountActive(String email) {
        return profileRepository.findByEmail(email)
                .map(ProfileEntity::getIsActive)
                .orElse(false);
    }

    public ProfileEntity getCurrentProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return profileRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Profile not found with email: " + authentication.getName()));
    }

    public ProfileDTO getPublicProfile(String email) {
        ProfileEntity currentUser = null;
        if (email == null) {
            currentUser = getCurrentProfile();
        }else {
            currentUser = profileRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("Profile not found with email: " + email));
        }

        return ProfileDTO.builder()
                .id(currentUser.getId())
                .fullName(currentUser.getFullName())
                .email(currentUser.getEmail())
                .profileImageUrl(currentUser.getProfileImageUrl())
                .createdAt(currentUser.getCreatedAt())
                .updatedAt(currentUser.getUpdatedAt())
                .build();
    }

    public Map<String, Object> authenticateAndGenerateToken(AuthDTO authDTO) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(authDTO.getEmail(), authDTO.getPassword()));
            //Generate JWT token
            String token = jwtUtil.generateToken(authDTO.getEmail());
            return Map.of(
                    "token", token,
                    "user", getPublicProfile(authDTO.getEmail())
            );
        } catch (Exception e) {
            throw new RuntimeException("Invalid email or password");
        }
    }

    public ProfileDTO updateAutoRenew(AutoRenewRequestDTO requestDTO) {
        ProfileEntity profile = getCurrentProfile();
        profile.setAutoRenew(Boolean.TRUE.equals(requestDTO.getEnabled()));
        profile = profileRepository.save(profile);
        return toDTO(profile);
    }

    // Thêm các phương thức mới cho quên mật khẩu

    public void forgotPassword(ForgotPasswordRequestDTO requestDTO) {
        ProfileEntity profile = profileRepository.findByEmail(requestDTO.getEmail())
                .orElseThrow(() -> new RuntimeException("Email not found"));

        if (!profile.getIsActive()) {
            throw new RuntimeException("Account is not active. Please activate your account first.");
        }

        // Tạo token reset password
        String resetToken = UUID.randomUUID().toString();
        profile.setResetPasswordToken(resetToken);
        profile.setResetPasswordTokenExpiry(LocalDateTime.now().plusHours(24)); // Token hết hạn sau 24 giờ

        profileRepository.save(profile);

        // Gửi email reset password
        // Gửi email reset password
        String resetLink = "http://localhost:3000/reset-password?token=" + resetToken;

        String subject = "Reset your Money Manager password";
        String body = "Click on the following link to reset your password: " + resetLink +
                "\n\nThis link will expire in 24 hours.\n" +
                "If you didn't request this, please ignore this email.";

        emailService.sendEmail(profile.getEmail(), subject, body);
    }

    public void resetPassword(ResetPasswordRequestDTO requestDTO) {
        ProfileEntity profile = profileRepository.findByResetPasswordToken(requestDTO.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        // Kiểm tra token đã hết hạn chưa
        if (profile.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            // Xóa token đã hết hạn
            profile.setResetPasswordToken(null);
            profile.setResetPasswordTokenExpiry(null);
            profileRepository.save(profile);
            throw new RuntimeException("Reset token has expired");
        }

        // Cập nhật mật khẩu mới
        profile.setPassword(passwordEncoder.encode(requestDTO.getNewPassword()));
        // Xóa token sau khi đã sử dụng
        profile.setResetPasswordToken(null);
        profile.setResetPasswordTokenExpiry(null);

        profileRepository.save(profile);
    }
}