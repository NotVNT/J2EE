package com.example.moneymanager.service;

import com.example.moneymanager.dto.PaymentOtpRequestDTO;
import com.example.moneymanager.dto.PaymentOtpRequestResponseDTO;
import com.example.moneymanager.dto.PaymentOtpVerifyRequestDTO;
import com.example.moneymanager.dto.PaymentOtpVerifyResponseDTO;
import com.example.moneymanager.entity.PaymentOtpEntity;
import com.example.moneymanager.entity.ProfileEntity;
import com.example.moneymanager.repository.PaymentOtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentOtpService {

    private final PaymentOtpRepository paymentOtpRepository;
    private final ProfileService profileService;
    private final SubscriptionService subscriptionService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${payment.otp.expiry-minutes:5}")
    private long otpExpiryMinutes;

    @Value("${payment.otp.resend-cooldown-seconds:60}")
    private long resendCooldownSeconds;

    @Value("${payment.otp.max-attempts:5}")
    private int maxAttempts;

    @Value("${payment.otp.authorization-expiry-minutes:5}")
    private long authorizationExpiryMinutes;

    @Transactional
    public PaymentOtpRequestResponseDTO requestOtp(PaymentOtpRequestDTO requestDTO) {
        if (requestDTO == null || requestDTO.getPlanId() == null || requestDTO.getPlanId().isBlank()) {
            throw new RuntimeException("Vui lòng chọn gói dịch vụ trước khi yêu cầu OTP.");
        }

        ProfileEntity profile = profileService.getCurrentProfile();
        LocalDateTime now = LocalDateTime.now();
        PaymentOtpEntity latestOtp = paymentOtpRepository.findTopByProfileIdOrderByCreatedAtDesc(profile.getId())
                .orElse(null);

        if (latestOtp != null
                && latestOtp.getRevokedAt() == null
                && latestOtp.getConsumedAt() == null
                && latestOtp.getResendAvailableAt() != null
                && latestOtp.getResendAvailableAt().isAfter(now)
                && latestOtp.getOtpExpiresAt() != null
                && latestOtp.getOtpExpiresAt().isAfter(now)) {
            long waitSeconds = Duration.between(now, latestOtp.getResendAvailableAt()).getSeconds();
            throw new RuntimeException("Vui lòng chờ " + Math.max(waitSeconds, 1) + " giây trước khi yêu cầu OTP mới.");
        }

        revokeActiveRequests(profile.getId(), now);

        SubscriptionService.PlanCatalogItem plan = subscriptionService.getPlanCatalogItem(requestDTO.getPlanId());
        String otpCode = generateOtpCode();

        PaymentOtpEntity paymentOtp = PaymentOtpEntity.builder()
                .planId(plan.id())
                .planName(plan.displayName())
                .otpCodeHash(passwordEncoder.encode(otpCode))
                .otpExpiresAt(now.plusMinutes(otpExpiryMinutes))
                .resendAvailableAt(now.plusSeconds(resendCooldownSeconds))
                .failedAttempts(0)
                .profile(profile)
                .build();

        paymentOtp = paymentOtpRepository.save(paymentOtp);
        sendOtpEmail(profile, plan, otpCode);

        return PaymentOtpRequestResponseDTO.builder()
                .otpRequestId(paymentOtp.getId())
                .planId(plan.id())
                .planName(plan.displayName())
                .maskedEmail(maskEmail(profile.getEmail()))
                .otpExpiresAt(paymentOtp.getOtpExpiresAt())
                .resendAvailableAt(paymentOtp.getResendAvailableAt())
                .message("Mã OTP đã được gửi tới email của bạn.")
                .build();
    }

    @Transactional
    public PaymentOtpVerifyResponseDTO verifyOtp(PaymentOtpVerifyRequestDTO requestDTO) {
        if (requestDTO == null || requestDTO.getOtpRequestId() == null) {
            throw new RuntimeException("Thiếu thông tin yêu cầu xác thực OTP.");
        }

        if (requestDTO.getOtpCode() == null || requestDTO.getOtpCode().trim().isEmpty()) {
            throw new RuntimeException("Vui lòng nhập mã OTP.");
        }

        ProfileEntity profile = profileService.getCurrentProfile();
        PaymentOtpEntity paymentOtp = findOwnedOtpRequest(profile.getId(), requestDTO.getOtpRequestId());
        LocalDateTime now = LocalDateTime.now();

        ensureOtpCanBeVerified(paymentOtp, now);

        String normalizedOtpCode = requestDTO.getOtpCode().trim();
        if (!passwordEncoder.matches(normalizedOtpCode, paymentOtp.getOtpCodeHash())) {
            int nextAttempts = paymentOtp.getFailedAttempts() + 1;
            paymentOtp.setFailedAttempts(nextAttempts);
            if (nextAttempts >= maxAttempts) {
                paymentOtp.setRevokedAt(now);
                paymentOtpRepository.save(paymentOtp);
                throw new RuntimeException("Bạn đã nhập sai OTP quá số lần cho phép. Vui lòng yêu cầu mã mới.");
            }

            paymentOtpRepository.save(paymentOtp);
            throw new RuntimeException("Mã OTP không chính xác. Bạn còn " + (maxAttempts - nextAttempts) + " lần thử.");
        }

        if (paymentOtp.getVerifiedAt() == null
                || paymentOtp.getAuthorizationExpiresAt() == null
                || paymentOtp.getAuthorizationExpiresAt().isBefore(now)
                || paymentOtp.getPaymentAuthorizationToken() == null
                || paymentOtp.getPaymentAuthorizationToken().isBlank()) {
            paymentOtp.setVerifiedAt(now);
            paymentOtp.setPaymentAuthorizationToken(UUID.randomUUID().toString());
            paymentOtp.setAuthorizationExpiresAt(now.plusMinutes(authorizationExpiryMinutes));
        }

        paymentOtpRepository.save(paymentOtp);

        return PaymentOtpVerifyResponseDTO.builder()
                .paymentAuthorizationToken(paymentOtp.getPaymentAuthorizationToken())
                .authorizationExpiresAt(paymentOtp.getAuthorizationExpiresAt())
                .message("Xác thực OTP thành công. Bạn có thể tiếp tục thanh toán.")
                .build();
    }

    @Transactional(readOnly = true)
    public void ensureValidAuthorization(String paymentAuthorizationToken, String planId) {
        if (paymentAuthorizationToken == null || paymentAuthorizationToken.isBlank()) {
            throw new RuntimeException("Thiếu xác thực OTP cho giao dịch thanh toán.");
        }

        if (planId == null || planId.isBlank()) {
            throw new RuntimeException("Thiếu thông tin gói dịch vụ.");
        }

        ProfileEntity profile = profileService.getCurrentProfile();
        PaymentOtpEntity paymentOtp = paymentOtpRepository.findByPaymentAuthorizationToken(paymentAuthorizationToken.trim())
                .orElseThrow(() -> new RuntimeException("Phiên xác thực thanh toán không hợp lệ hoặc đã hết hạn."));

        if (paymentOtp.getProfile() == null || !paymentOtp.getProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Bạn không có quyền sử dụng phiên xác thực thanh toán này.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (paymentOtp.getRevokedAt() != null) {
            throw new RuntimeException("Phiên xác thực thanh toán này đã bị thu hồi.");
        }
        if (paymentOtp.getConsumedAt() != null) {
            throw new RuntimeException("Phiên xác thực thanh toán này đã được sử dụng.");
        }
        if (paymentOtp.getVerifiedAt() == null) {
            throw new RuntimeException("Phiên xác thực thanh toán này chưa được xác minh OTP.");
        }
        if (paymentOtp.getAuthorizationExpiresAt() == null || paymentOtp.getAuthorizationExpiresAt().isBefore(now)) {
            throw new RuntimeException("Phiên xác thực thanh toán đã hết hạn. Vui lòng yêu cầu OTP mới.");
        }
        if (!paymentOtp.getPlanId().equalsIgnoreCase(planId.trim())) {
            throw new RuntimeException("Mã OTP này không áp dụng cho gói dịch vụ đã chọn.");
        }
    }

    @Transactional
    public void markAuthorizationConsumed(String paymentAuthorizationToken) {
        if (paymentAuthorizationToken == null || paymentAuthorizationToken.isBlank()) {
            return;
        }

        ProfileEntity profile = profileService.getCurrentProfile();
        PaymentOtpEntity paymentOtp = paymentOtpRepository.findByPaymentAuthorizationToken(paymentAuthorizationToken.trim())
                .orElseThrow(() -> new RuntimeException("Phiên xác thực thanh toán không hợp lệ hoặc đã hết hạn."));

        if (paymentOtp.getProfile() == null || !paymentOtp.getProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Bạn không có quyền sử dụng phiên xác thực thanh toán này.");
        }

        if (paymentOtp.getConsumedAt() != null) {
            throw new RuntimeException("Phiên xác thực thanh toán này đã được sử dụng.");
        }

        LocalDateTime now = LocalDateTime.now();
        paymentOtp.setConsumedAt(now);
        paymentOtpRepository.save(paymentOtp);
    }

    private void revokeActiveRequests(Long profileId, LocalDateTime now) {
        List<PaymentOtpEntity> activeRequests = paymentOtpRepository.findByProfileIdAndConsumedAtIsNullAndRevokedAtIsNull(profileId);
        activeRequests.forEach(paymentOtp -> {
            paymentOtp.setRevokedAt(now);
            if (paymentOtp.getAuthorizationExpiresAt() != null && paymentOtp.getAuthorizationExpiresAt().isAfter(now)) {
                paymentOtp.setAuthorizationExpiresAt(now);
            }
            if (paymentOtp.getOtpExpiresAt() != null && paymentOtp.getOtpExpiresAt().isAfter(now)) {
                paymentOtp.setOtpExpiresAt(now);
            }
        });
        paymentOtpRepository.saveAll(activeRequests);
    }

    private PaymentOtpEntity findOwnedOtpRequest(Long profileId, Long otpRequestId) {
        PaymentOtpEntity paymentOtp = paymentOtpRepository.findById(otpRequestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu OTP thanh toán."));

        if (paymentOtp.getProfile() == null || !paymentOtp.getProfile().getId().equals(profileId)) {
            throw new RuntimeException("Bạn không có quyền truy cập yêu cầu OTP này.");
        }

        return paymentOtp;
    }

    private void ensureOtpCanBeVerified(PaymentOtpEntity paymentOtp, LocalDateTime now) {
        if (paymentOtp.getRevokedAt() != null) {
            throw new RuntimeException("Yêu cầu OTP này không còn hiệu lực. Vui lòng lấy mã mới.");
        }
        if (paymentOtp.getConsumedAt() != null) {
            throw new RuntimeException("Yêu cầu OTP này đã được sử dụng.");
        }
        if (paymentOtp.getOtpExpiresAt() == null || paymentOtp.getOtpExpiresAt().isBefore(now)) {
            paymentOtp.setRevokedAt(now);
            paymentOtpRepository.save(paymentOtp);
            throw new RuntimeException("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
        }
    }

    private void sendOtpEmail(ProfileEntity profile, SubscriptionService.PlanCatalogItem plan, String otpCode) {
        String subject = "[devbot] Mã OTP xác nhận thanh toán";
        String body = """
                Xin chào %s,

                Bạn đang thực hiện thanh toán cho gói %s trên Devbot Money Manager.
                Mã OTP xác nhận của bạn là: %s

                Mã này có hiệu lực trong %d phút.
                Nếu bạn không thực hiện thao tác này, vui lòng bỏ qua email.
                """
                .formatted(
                        profile.getFullName() != null && !profile.getFullName().isBlank() ? profile.getFullName() : "bạn",
                        plan.displayName(),
                        otpCode,
                        otpExpiryMinutes
                );

        emailService.sendEmail(profile.getEmail(), subject, body);
    }

    private String generateOtpCode() {
        return String.valueOf(100000 + secureRandom.nextInt(900000));
    }

    private String maskEmail(String email) {
        if (email == null || email.isBlank() || !email.contains("@")) {
            return "email của bạn";
        }

        String[] parts = email.split("@", 2);
        String name = parts[0];
        String domain = parts[1];

        if (name.length() <= 2) {
            return name.charAt(0) + "***@" + domain;
        }

        return name.substring(0, 2) + "***@" + domain;
    }
}
