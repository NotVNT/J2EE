package com.example.moneymanager.service;

import com.example.moneymanager.dto.ExpenseDTO;
import com.example.moneymanager.dto.IncomeDTO;
import com.example.moneymanager.dto.SavingGoalContributionDTO;
import com.example.moneymanager.dto.TransactionOtpRequestDTO;
import com.example.moneymanager.dto.TransactionOtpRequestResponseDTO;
import com.example.moneymanager.dto.TransactionOtpVerifyRequestDTO;
import com.example.moneymanager.dto.TransactionOtpVerifyResponseDTO;
import com.example.moneymanager.entity.ExpenseEntity;
import com.example.moneymanager.entity.IncomeEntity;
import com.example.moneymanager.entity.ProfileEntity;
import com.example.moneymanager.entity.SavingGoalEntity;
import com.example.moneymanager.entity.TransactionOtpEntity;
import com.example.moneymanager.repository.ExpenseRepository;
import com.example.moneymanager.repository.IncomeRepository;
import com.example.moneymanager.repository.SavingGoalRepository;
import com.example.moneymanager.repository.TransactionOtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionOtpService {

    public static final String ACTION_INCOME = "INCOME";
    public static final String ACTION_EXPENSE = "EXPENSE";
    public static final String ACTION_DELETE_INCOME = "DELETE_INCOME";
    public static final String ACTION_DELETE_EXPENSE = "DELETE_EXPENSE";
    public static final String ACTION_SAVING_GOAL_CONTRIBUTION = "SAVING_GOAL_CONTRIBUTION";

    private final TransactionOtpRepository transactionOtpRepository;
    private final ProfileService profileService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final SavingGoalRepository savingGoalRepository;

    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${transaction.otp.expiry-minutes:5}")
    private long otpExpiryMinutes;

    @Value("${transaction.otp.resend-cooldown-seconds:60}")
    private long resendCooldownSeconds;

    @Value("${transaction.otp.max-attempts:5}")
    private int maxAttempts;

    @Value("${transaction.otp.authorization-expiry-minutes:5}")
    private long authorizationExpiryMinutes;

    @Transactional
    public TransactionOtpRequestResponseDTO requestOtp(TransactionOtpRequestDTO requestDTO) {
        validateTransactionRequest(requestDTO);

        ProfileEntity profile = profileService.getCurrentProfile();
        LocalDateTime now = LocalDateTime.now();
        TransactionOtpEntity latestOtp = transactionOtpRepository.findTopByProfileIdOrderByCreatedAtDesc(profile.getId())
                .orElse(null);

        if (latestOtp != null
                && latestOtp.getRevokedAt() == null
                && latestOtp.getConsumedAt() == null
                && latestOtp.getResendAvailableAt() != null
                && latestOtp.getResendAvailableAt().isAfter(now)
                && latestOtp.getOtpExpiresAt() != null
                && latestOtp.getOtpExpiresAt().isAfter(now)) {
            long waitSeconds = Duration.between(now, latestOtp.getResendAvailableAt()).getSeconds();
            throw new RuntimeException("Vui long cho " + Math.max(waitSeconds, 1) + " giay truoc khi yeu cau OTP moi.");
        }

        revokeActiveRequests(profile.getId(), now);

        String actionType = normalizeActionType(requestDTO.getActionType());
        TransactionOtpRequestDTO normalizedRequest = normalizeRequestForAction(profile, requestDTO, actionType);
        String otpCode = generateOtpCode();

        TransactionOtpEntity otpEntity = TransactionOtpEntity.builder()
                .actionType(actionType)
                .payloadHash(buildPayloadHash(normalizedRequest))
                .otpCodeHash(passwordEncoder.encode(otpCode))
                .otpExpiresAt(now.plusMinutes(otpExpiryMinutes))
                .resendAvailableAt(now.plusSeconds(resendCooldownSeconds))
                .failedAttempts(0)
                .profile(profile)
                .build();

        otpEntity = transactionOtpRepository.save(otpEntity);
        sendOtpEmail(profile, normalizedRequest, actionType, otpCode);

        return TransactionOtpRequestResponseDTO.builder()
                .otpRequestId(otpEntity.getId())
                .actionType(actionType)
                .maskedEmail(maskEmail(profile.getEmail()))
                .otpExpiresAt(otpEntity.getOtpExpiresAt())
                .resendAvailableAt(otpEntity.getResendAvailableAt())
                .message("Ma OTP da duoc gui toi email cua ban.")
                .build();
    }

    @Transactional
    public TransactionOtpVerifyResponseDTO verifyOtp(TransactionOtpVerifyRequestDTO requestDTO) {
        if (requestDTO == null || requestDTO.getOtpRequestId() == null) {
            throw new RuntimeException("Thieu thong tin yeu cau xac thuc OTP.");
        }
        if (requestDTO.getOtpCode() == null || requestDTO.getOtpCode().trim().isEmpty()) {
            throw new RuntimeException("Vui long nhap ma OTP.");
        }

        ProfileEntity profile = profileService.getCurrentProfile();
        TransactionOtpEntity otpEntity = findOwnedOtpRequest(profile.getId(), requestDTO.getOtpRequestId());
        LocalDateTime now = LocalDateTime.now();

        ensureOtpCanBeVerified(otpEntity, now);

        if (!passwordEncoder.matches(requestDTO.getOtpCode().trim(), otpEntity.getOtpCodeHash())) {
            int nextAttempts = otpEntity.getFailedAttempts() + 1;
            otpEntity.setFailedAttempts(nextAttempts);
            if (nextAttempts >= maxAttempts) {
                otpEntity.setRevokedAt(now);
                transactionOtpRepository.save(otpEntity);
                throw new RuntimeException("Ban da nhap sai OTP qua so lan cho phep. Vui long yeu cau ma moi.");
            }

            transactionOtpRepository.save(otpEntity);
            throw new RuntimeException("Ma OTP khong chinh xac. Ban con " + (maxAttempts - nextAttempts) + " lan thu.");
        }

        if (otpEntity.getVerifiedAt() == null
                || otpEntity.getAuthorizationExpiresAt() == null
                || otpEntity.getAuthorizationExpiresAt().isBefore(now)
                || otpEntity.getTransactionAuthorizationToken() == null
                || otpEntity.getTransactionAuthorizationToken().isBlank()) {
            otpEntity.setVerifiedAt(now);
            otpEntity.setTransactionAuthorizationToken(UUID.randomUUID().toString());
            otpEntity.setAuthorizationExpiresAt(now.plusMinutes(authorizationExpiryMinutes));
        }

        transactionOtpRepository.save(otpEntity);

        return TransactionOtpVerifyResponseDTO.builder()
                .transactionAuthorizationToken(otpEntity.getTransactionAuthorizationToken())
                .authorizationExpiresAt(otpEntity.getAuthorizationExpiresAt())
                .message("Xac thuc OTP thanh cong.")
                .build();
    }

    @Transactional(readOnly = true)
    public void ensureValidAuthorization(String authorizationToken, String actionType, String payloadHash) {
        if (authorizationToken == null || authorizationToken.isBlank()) {
            throw new RuntimeException("Thieu xac thuc OTP cho giao dich nay.");
        }

        ProfileEntity profile = profileService.getCurrentProfile();
        TransactionOtpEntity otpEntity = transactionOtpRepository.findByTransactionAuthorizationToken(authorizationToken.trim())
                .orElseThrow(() -> new RuntimeException("Phien xac thuc giao dich khong hop le hoac da het han."));

        if (otpEntity.getProfile() == null || !otpEntity.getProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Ban khong co quyen su dung phien xac thuc giao dich nay.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (otpEntity.getRevokedAt() != null) {
            throw new RuntimeException("Phien xac thuc giao dich nay da bi thu hoi.");
        }
        if (otpEntity.getConsumedAt() != null) {
            throw new RuntimeException("Phien xac thuc giao dich nay da duoc su dung.");
        }
        if (otpEntity.getVerifiedAt() == null) {
            throw new RuntimeException("Phien xac thuc giao dich nay chua duoc xac minh OTP.");
        }
        if (otpEntity.getAuthorizationExpiresAt() == null || otpEntity.getAuthorizationExpiresAt().isBefore(now)) {
            throw new RuntimeException("Phien xac thuc giao dich da het han. Vui long yeu cau OTP moi.");
        }
        if (!otpEntity.getActionType().equals(normalizeActionType(actionType))) {
            throw new RuntimeException("Ma OTP nay khong ap dung cho thao tac hien tai.");
        }
        if (!otpEntity.getPayloadHash().equals(payloadHash)) {
            throw new RuntimeException("Du lieu giao dich da thay doi. Vui long yeu cau OTP moi.");
        }
    }

    @Transactional
    public void markAuthorizationConsumed(String authorizationToken) {
        if (authorizationToken == null || authorizationToken.isBlank()) {
            return;
        }

        ProfileEntity profile = profileService.getCurrentProfile();
        TransactionOtpEntity otpEntity = transactionOtpRepository.findByTransactionAuthorizationToken(authorizationToken.trim())
                .orElseThrow(() -> new RuntimeException("Phien xac thuc giao dich khong hop le hoac da het han."));

        if (otpEntity.getProfile() == null || !otpEntity.getProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Ban khong co quyen su dung phien xac thuc giao dich nay.");
        }
        if (otpEntity.getConsumedAt() != null) {
            throw new RuntimeException("Phien xac thuc giao dich nay da duoc su dung.");
        }

        otpEntity.setConsumedAt(LocalDateTime.now());
        transactionOtpRepository.save(otpEntity);
    }

    public String buildIncomePayloadHash(IncomeDTO dto) {
        return buildPayloadHash(TransactionOtpRequestDTO.builder()
                .actionType(ACTION_INCOME)
                .name(dto.getName())
                .categoryId(dto.getCategoryId())
                .amount(dto.getAmount())
                .date(dto.getDate())
                .build());
    }

    public String buildExpensePayloadHash(ExpenseDTO dto) {
        return buildPayloadHash(TransactionOtpRequestDTO.builder()
                .actionType(ACTION_EXPENSE)
                .name(dto.getName())
                .categoryId(dto.getCategoryId())
                .amount(dto.getAmount())
                .date(dto.getDate())
                .build());
    }

    public String buildDeleteExpensePayloadHash(ExpenseEntity entity) {
        return buildPayloadHash(TransactionOtpRequestDTO.builder()
                .actionType(ACTION_DELETE_EXPENSE)
                .expenseId(entity.getId())
                .name(entity.getName())
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
                .amount(entity.getAmount())
                .date(entity.getDate())
                .build());
    }

    public String buildDeleteIncomePayloadHash(IncomeEntity entity) {
        return buildPayloadHash(TransactionOtpRequestDTO.builder()
                .actionType(ACTION_DELETE_INCOME)
                .incomeId(entity.getId())
                .name(entity.getName())
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
                .amount(entity.getAmount())
                .date(entity.getDate())
                .build());
    }

    public String buildSavingGoalContributionPayloadHash(SavingGoalEntity goal, SavingGoalContributionDTO dto) {
        return buildPayloadHash(TransactionOtpRequestDTO.builder()
                .actionType(ACTION_SAVING_GOAL_CONTRIBUTION)
                .goalId(goal.getId())
                .name(goal.getName())
                .amount(dto.getAmount())
                .date(dto.getContributionDate())
                .note(dto.getNote())
                .build());
    }

    private void validateTransactionRequest(TransactionOtpRequestDTO requestDTO) {
        if (requestDTO == null) {
            throw new RuntimeException("Thieu du lieu giao dich de gui OTP.");
        }

        String actionType = normalizeActionType(requestDTO.getActionType());
        if (ACTION_DELETE_EXPENSE.equals(actionType) || ACTION_DELETE_INCOME.equals(actionType)) {
            if (ACTION_DELETE_EXPENSE.equals(actionType) && requestDTO.getExpenseId() == null) {
                throw new RuntimeException("Thieu thong tin chi tieu can xoa.");
            }
            if (ACTION_DELETE_INCOME.equals(actionType) && requestDTO.getIncomeId() == null) {
                throw new RuntimeException("Thieu thong tin thu nhap can xoa.");
            }
            return;
        }

        if (ACTION_SAVING_GOAL_CONTRIBUTION.equals(actionType) && requestDTO.getGoalId() == null) {
            throw new RuntimeException("Thieu thong tin muc tieu tiet kiem.");
        }

        if (!ACTION_SAVING_GOAL_CONTRIBUTION.equals(actionType)
                && (requestDTO.getName() == null || requestDTO.getName().trim().isEmpty())) {
            throw new RuntimeException("Ten giao dich khong duoc de trong.");
        }
        if (!ACTION_SAVING_GOAL_CONTRIBUTION.equals(actionType) && requestDTO.getCategoryId() == null) {
            throw new RuntimeException("Vui long chon danh muc.");
        }
        if (requestDTO.getAmount() == null || requestDTO.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("So tien phai lon hon 0.");
        }
        if (requestDTO.getDate() == null) {
            throw new RuntimeException("Vui long chon ngay giao dich.");
        }
        if (requestDTO.getDate().isAfter(LocalDate.now())) {
            throw new RuntimeException("Ngay giao dich khong duoc lon hon hien tai.");
        }
    }

    private void revokeActiveRequests(Long profileId, LocalDateTime now) {
        List<TransactionOtpEntity> activeRequests = transactionOtpRepository.findByProfileIdAndConsumedAtIsNullAndRevokedAtIsNull(profileId);
        activeRequests.forEach(otpEntity -> {
            otpEntity.setRevokedAt(now);
            if (otpEntity.getAuthorizationExpiresAt() != null && otpEntity.getAuthorizationExpiresAt().isAfter(now)) {
                otpEntity.setAuthorizationExpiresAt(now);
            }
            if (otpEntity.getOtpExpiresAt() != null && otpEntity.getOtpExpiresAt().isAfter(now)) {
                otpEntity.setOtpExpiresAt(now);
            }
        });
        transactionOtpRepository.saveAll(activeRequests);
    }

    private TransactionOtpEntity findOwnedOtpRequest(Long profileId, Long otpRequestId) {
        TransactionOtpEntity otpEntity = transactionOtpRepository.findById(otpRequestId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay yeu cau OTP giao dich."));

        if (otpEntity.getProfile() == null || !otpEntity.getProfile().getId().equals(profileId)) {
            throw new RuntimeException("Ban khong co quyen truy cap yeu cau OTP nay.");
        }

        return otpEntity;
    }

    private void ensureOtpCanBeVerified(TransactionOtpEntity otpEntity, LocalDateTime now) {
        if (otpEntity.getRevokedAt() != null) {
            throw new RuntimeException("Yeu cau OTP nay khong con hieu luc. Vui long lay ma moi.");
        }
        if (otpEntity.getConsumedAt() != null) {
            throw new RuntimeException("Yeu cau OTP nay da duoc su dung.");
        }
        if (otpEntity.getOtpExpiresAt() == null || otpEntity.getOtpExpiresAt().isBefore(now)) {
            otpEntity.setRevokedAt(now);
            transactionOtpRepository.save(otpEntity);
            throw new RuntimeException("Ma OTP da het han. Vui long yeu cau ma moi.");
        }
    }

    private String buildPayloadHash(TransactionOtpRequestDTO requestDTO) {
        String canonicalPayload = String.join("|",
                normalizeActionType(requestDTO.getActionType()),
                String.valueOf(requestDTO.getExpenseId()),
                String.valueOf(requestDTO.getIncomeId()),
                String.valueOf(requestDTO.getGoalId()),
                normalizeText(requestDTO.getName()),
                String.valueOf(requestDTO.getCategoryId()),
                normalizeAmount(requestDTO.getAmount()),
                requestDTO.getDate() != null ? requestDTO.getDate().toString() : "",
                normalizeText(requestDTO.getNote()));

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(canonicalPayload.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (Exception e) {
            throw new RuntimeException("Khong the tao chu ky bao mat cho giao dich.", e);
        }
    }

    private void sendOtpEmail(ProfileEntity profile, TransactionOtpRequestDTO requestDTO, String actionType, String otpCode) {
        String actionLabel = switch (actionType) {
            case ACTION_INCOME -> "them thu nhap";
            case ACTION_EXPENSE -> "them chi tieu";
            case ACTION_DELETE_INCOME -> "xoa thu nhap";
            case ACTION_DELETE_EXPENSE -> "xoa chi tieu";
            case ACTION_SAVING_GOAL_CONTRIBUTION -> "dong gop tiet kiem";
            default -> "xac nhan giao dich";
        };

        String subject = "[devbot] Ma OTP xac nhan giao dich";
        String body = """
                Xin chao %s,

                Ban dang thuc hien thao tac %s tren Devbot Money Manager.
                Chi tiet giao dich:
                - Ten: %s
                - So tien: %s VND
                - Ngay: %s

                Ma OTP xac nhan cua ban la: %s
                Ma nay co hieu luc trong %d phut.

                Neu ban khong thuc hien thao tac nay, vui long bo qua email.
                """
                .formatted(
                        profile.getFullName() != null && !profile.getFullName().isBlank() ? profile.getFullName() : "ban",
                        actionLabel,
                        normalizeText(requestDTO.getName()),
                        formatAmountForEmail(requestDTO.getAmount()),
                        requestDTO.getDate(),
                        otpCode,
                        otpExpiryMinutes
                );

        emailService.sendEmail(profile.getEmail(), subject, body);
    }

    private String normalizeActionType(String actionType) {
        if (actionType == null || actionType.isBlank()) {
            throw new RuntimeException("Thieu loai thao tac giao dich.");
        }

        String normalized = actionType.trim().toUpperCase(Locale.ROOT);
        if (!ACTION_INCOME.equals(normalized)
                && !ACTION_EXPENSE.equals(normalized)
                && !ACTION_DELETE_INCOME.equals(normalized)
                && !ACTION_DELETE_EXPENSE.equals(normalized)
                && !ACTION_SAVING_GOAL_CONTRIBUTION.equals(normalized)) {
            throw new RuntimeException("Loai thao tac OTP khong hop le.");
        }
        return normalized;
    }

    private TransactionOtpRequestDTO normalizeRequestForAction(ProfileEntity profile, TransactionOtpRequestDTO requestDTO, String actionType) {
        if (ACTION_SAVING_GOAL_CONTRIBUTION.equals(actionType)) {
            SavingGoalEntity goalEntity = savingGoalRepository.findById(requestDTO.getGoalId())
                    .orElseThrow(() -> new RuntimeException("Khong tim thay muc tieu tiet kiem."));

            if (goalEntity.getProfile() == null || !goalEntity.getProfile().getId().equals(profile.getId())) {
                throw new RuntimeException("Ban khong co quyen thao tac voi muc tieu nay.");
            }

            return TransactionOtpRequestDTO.builder()
                    .actionType(ACTION_SAVING_GOAL_CONTRIBUTION)
                    .goalId(goalEntity.getId())
                    .name(goalEntity.getName())
                    .amount(requestDTO.getAmount())
                    .date(requestDTO.getDate())
                    .note(requestDTO.getNote())
                    .build();
        }

        if (!ACTION_DELETE_EXPENSE.equals(actionType) && !ACTION_DELETE_INCOME.equals(actionType)) {
            return requestDTO;
        }

        if (ACTION_DELETE_EXPENSE.equals(actionType)) {
            ExpenseEntity expenseEntity = expenseRepository.findById(requestDTO.getExpenseId())
                    .orElseThrow(() -> new RuntimeException("Khong tim thay chi tieu can xoa."));

            if (expenseEntity.getProfile() == null || !expenseEntity.getProfile().getId().equals(profile.getId())) {
                throw new RuntimeException("Ban khong co quyen thao tac voi chi tieu nay.");
            }

            return TransactionOtpRequestDTO.builder()
                    .actionType(ACTION_DELETE_EXPENSE)
                    .expenseId(expenseEntity.getId())
                    .name(expenseEntity.getName())
                    .categoryId(expenseEntity.getCategory() != null ? expenseEntity.getCategory().getId() : null)
                    .amount(expenseEntity.getAmount())
                    .date(expenseEntity.getDate())
                    .build();
        }

        IncomeEntity incomeEntity = incomeRepository.findById(requestDTO.getIncomeId())
                .orElseThrow(() -> new RuntimeException("Khong tim thay thu nhap can xoa."));

        if (incomeEntity.getProfile() == null || !incomeEntity.getProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Ban khong co quyen thao tac voi thu nhap nay.");
        }

        return TransactionOtpRequestDTO.builder()
                .actionType(ACTION_DELETE_INCOME)
                .incomeId(incomeEntity.getId())
                .name(incomeEntity.getName())
                .categoryId(incomeEntity.getCategory() != null ? incomeEntity.getCategory().getId() : null)
                .amount(incomeEntity.getAmount())
                .date(incomeEntity.getDate())
                .build();
    }

    private String normalizeText(String value) {
        return value == null ? "" : value.trim().replaceAll("\\s+", " ");
    }

    private String normalizeAmount(BigDecimal amount) {
        BigDecimal safeAmount = amount != null ? amount.stripTrailingZeros() : BigDecimal.ZERO;
        return safeAmount.toPlainString();
    }

    private String formatAmountForEmail(BigDecimal amount) {
        return String.format(Locale.forLanguageTag("vi-VN"), "%,.0f", amount != null ? amount : BigDecimal.ZERO);
    }

    private String generateOtpCode() {
        return String.valueOf(100000 + secureRandom.nextInt(900000));
    }

    private String maskEmail(String email) {
        if (email == null || email.isBlank() || !email.contains("@")) {
            return "email cua ban";
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
