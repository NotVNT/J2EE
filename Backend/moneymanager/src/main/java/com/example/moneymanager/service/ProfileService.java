package com.example.moneymanager.service;

import com.example.moneymanager.dto.AuthDTO;
import com.example.moneymanager.dto.AutoRenewRequestDTO;
import com.example.moneymanager.dto.ForgotPasswordRequestDTO;
import com.example.moneymanager.dto.ProfileDTO;
import com.example.moneymanager.dto.ProfileUpdateDTO;
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
        return registerProfile(profileDTO, false);
    }

    public ProfileDTO registerProfile(ProfileDTO profileDTO, boolean skipActivationForMobile) {
        profileRepository.findByEmail(profileDTO.getEmail()).ifPresent(profile -> {
            throw new RuntimeException("Email này đã được sử dụng.");
        });

        ProfileEntity newProfile = toEntity(profileDTO);

        if (skipActivationForMobile) {
            newProfile.setIsActive(true);
            newProfile.setActivationToken(null);
        } else {
            newProfile.setActivationToken(UUID.randomUUID().toString());
        }

        newProfile = profileRepository.save(newProfile);

        if (!skipActivationForMobile) {
            // Gửi email kích hoạt tài khoản
            String normalizedActivationUrl = activationURL.endsWith("/")
                    ? activationURL.substring(0, activationURL.length() - 1)
                    : activationURL;
            String activationLink = normalizedActivationUrl + "/activate?token=" + newProfile.getActivationToken();
            String subject = "Kích hoạt tài khoản Money Manager";
            String body = "Nhấn vào liên kết sau để kích hoạt tài khoản của bạn: " + activationLink;
            emailService.sendEmail(newProfile.getEmail(), subject, body);
        }

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
                .canImportReceipt(planFeatures.isCanImportReceipt())
                .role(profileEntity.getRole() != null ? profileEntity.getRole().getName() : "user")
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
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản với email: " + authentication.getName()));
    }

    public ProfileDTO getPublicProfile(String email) {
        ProfileEntity currentUser = null;
        if (email == null) {
            currentUser = getCurrentProfile();
        }else {
            currentUser = profileRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản với email: " + email));
        }

        return toDTO(currentUser);
    }

    public Map<String, Object> updateProfile(ProfileUpdateDTO requestDTO) {
        ProfileEntity profile = getCurrentProfile();

        String fullName = requestDTO.getFullName() != null ? requestDTO.getFullName().trim() : "";
        String email = requestDTO.getEmail() != null ? requestDTO.getEmail().trim() : "";

        if (fullName.isBlank()) {
            throw new RuntimeException("Họ và tên không được để trống.");
        }

        if (email.isBlank()) {
            throw new RuntimeException("Email không được để trống.");
        }

        if (!email.equalsIgnoreCase(profile.getEmail()) && profileRepository.existsByEmail(email)) {
            throw new RuntimeException("Email này đã được sử dụng.");
        }

        boolean wantsPasswordChange =
                (requestDTO.getCurrentPassword() != null && !requestDTO.getCurrentPassword().isBlank())
                        || (requestDTO.getNewPassword() != null && !requestDTO.getNewPassword().isBlank());

        if (wantsPasswordChange) {
            if (requestDTO.getCurrentPassword() == null || requestDTO.getCurrentPassword().isBlank()) {
                throw new RuntimeException("Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu.");
            }

            if (requestDTO.getNewPassword() == null || requestDTO.getNewPassword().isBlank()) {
                throw new RuntimeException("Vui lòng nhập mật khẩu mới.");
            }

            if (!passwordEncoder.matches(requestDTO.getCurrentPassword(), profile.getPassword())) {
                throw new RuntimeException("Mật khẩu hiện tại không chính xác.");
            }

            if (requestDTO.getNewPassword().trim().length() < 6) {
                throw new RuntimeException("Mật khẩu mới phải có ít nhất 6 ký tự.");
            }

            profile.setPassword(passwordEncoder.encode(requestDTO.getNewPassword().trim()));
        }

        profile.setFullName(fullName);
        profile.setEmail(email);
        profile.setProfileImageUrl(requestDTO.getProfileImageUrl());

        profile = profileRepository.save(profile);

        return Map.of(
                "token", jwtUtil.generateToken(profile.getEmail()),
                "user", toDTO(profile)
        );
    }

    public Map<String, Object> authenticateAndGenerateToken(AuthDTO authDTO) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(authDTO.getEmail(), authDTO.getPassword()));
            // Tạo JWT token
            String token = jwtUtil.generateToken(authDTO.getEmail());
            return Map.of(
                    "token", token,
                    "user", getPublicProfile(authDTO.getEmail())
            );
        } catch (Exception e) {
            throw new RuntimeException("Email hoặc mật khẩu không đúng.");
        }
    }

    public ProfileDTO updateAutoRenew(AutoRenewRequestDTO requestDTO) {
        ProfileEntity profile = getCurrentProfile();
        profile.setAutoRenew(Boolean.TRUE.equals(requestDTO.getEnabled()));
        profile = profileRepository.save(profile);
        return toDTO(profile);
    }

    // Các phương thức cho chức năng quên mật khẩu

    public void forgotPassword(ForgotPasswordRequestDTO requestDTO) {
        ProfileEntity profile = profileRepository.findByEmail(requestDTO.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy email này."));

        if (!profile.getIsActive()) {
            throw new RuntimeException("Tài khoản chưa được kích hoạt. Vui lòng kích hoạt tài khoản trước.");
        }

        // Tạo token đặt lại mật khẩu
        String resetToken = UUID.randomUUID().toString();
        profile.setResetPasswordToken(resetToken);
        profile.setResetPasswordTokenExpiry(LocalDateTime.now().plusHours(24)); // Token hết hạn sau 24 giờ

        profileRepository.save(profile);

        // Gửi email đặt lại mật khẩu
        String normalizedResetPasswordUrl = resetPasswordURL.endsWith("/")
                ? resetPasswordURL.substring(0, resetPasswordURL.length() - 1)
                : resetPasswordURL;
        String resetLink = normalizedResetPasswordUrl + "/reset-password?token=" + resetToken;

        String subject = "Đặt lại mật khẩu Money Manager";
        String body = "Nhấn vào liên kết sau để đặt lại mật khẩu của bạn: " + resetLink +
                "\n\nLiên kết này sẽ hết hạn sau 24 giờ.\n" +
                "Nếu bạn không yêu cầu thao tác này, vui lòng bỏ qua email này.";

        emailService.sendEmail(profile.getEmail(), subject, body);
    }

    public void resetPassword(ResetPasswordRequestDTO requestDTO) {
        ProfileEntity profile = profileRepository.findByResetPasswordToken(requestDTO.getToken())
                .orElseThrow(() -> new RuntimeException("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."));

        // Kiểm tra token đã hết hạn chưa
        if (profile.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            // Xóa token đã hết hạn
            profile.setResetPasswordToken(null);
            profile.setResetPasswordTokenExpiry(null);
            profileRepository.save(profile);
            throw new RuntimeException("Liên kết đặt lại mật khẩu đã hết hạn.");
        }

        // Cập nhật mật khẩu mới
        profile.setPassword(passwordEncoder.encode(requestDTO.getNewPassword()));
        // Xóa token sau khi đã sử dụng
        profile.setResetPasswordToken(null);
        profile.setResetPasswordTokenExpiry(null);

        profileRepository.save(profile);
    }
}
