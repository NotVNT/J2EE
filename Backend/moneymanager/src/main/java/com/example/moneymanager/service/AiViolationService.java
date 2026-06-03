package com.example.moneymanager.service;

import com.example.moneymanager.entity.AiViolationEntity;
import com.example.moneymanager.entity.NotificationType;
import com.example.moneymanager.entity.ProfileEntity;
import com.example.moneymanager.repository.AiViolationRepository;
import com.example.moneymanager.repository.ProfileRepository;
import com.example.moneymanager.util.AIContentGuard;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiViolationService {

    private static final int SCORE_AI_BLOCK_THRESHOLD = 3;
    private static final int SCORE_ACCOUNT_DELETE_THRESHOLD = 6;

    private final AiViolationRepository aiViolationRepository;
    private final ProfileRepository profileRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final MailTemplateService mailTemplateService;

    @Lazy
    @Autowired
    private AdminService adminService;

    @Transactional
    public ViolationAction recordViolation(ProfileEntity profile,
                                           AIContentGuard.GuardResult guardResult,
                                           String messageSnippet,
                                           String source) {
        if (guardResult == AIContentGuard.GuardResult.SELF_HARM) {
            logViolation(profile, AiViolationEntity.ViolationType.SELF_HARM, 0, messageSnippet, source);
            log.info("[AI-SAFETY] Self-harm signal logged for profileId={} - no penalty applied", profile.getId());
            return ViolationAction.WARN_ONLY;
        }

        ProfileEntity lockedProfile = profileRepository.findByIdForUpdate(profile.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với id: " + profile.getId()));

        int scoreToAdd = getScoreForViolation(guardResult);
        AiViolationEntity.ViolationType violationType = mapToViolationType(guardResult);

        logViolation(lockedProfile, violationType, scoreToAdd, messageSnippet, source);

        int currentScore = lockedProfile.getAiViolationScore() != null ? lockedProfile.getAiViolationScore() : 0;
        int totalScore = currentScore + scoreToAdd;
        lockedProfile.setAiViolationScore(totalScore);
        profileRepository.save(lockedProfile);

        log.warn("[AI-SAFETY] Violation recorded: profileId={}, type={}, +{}pts -> total={}pts, source={}",
                lockedProfile.getId(), violationType, scoreToAdd, totalScore, source);

        if (totalScore >= SCORE_ACCOUNT_DELETE_THRESHOLD) {
            return executeAccountDeletion(lockedProfile);
        }
        if (totalScore >= SCORE_AI_BLOCK_THRESHOLD) {
            return executeAiBlock(lockedProfile, violationType);
        }
        return executeWarning(lockedProfile, violationType, totalScore);
    }

    @Transactional(readOnly = true)
    public boolean isAiBlocked(ProfileEntity profile) {
        return profile.getAiBlockedReason() != null && !profile.getAiBlockedReason().isBlank();
    }

    @Transactional
    public void unblockAi(Long profileId) {
        ProfileEntity profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với id: " + profileId));

        profile.setAiBlockedReason(null);
        profile.setAiBlockedAt(null);
        int newScore = Math.max(0, (profile.getAiViolationScore() != null ? profile.getAiViolationScore() : 0)
                - SCORE_AI_BLOCK_THRESHOLD);
        profile.setAiViolationScore(newScore);
        profileRepository.save(profile);

        notificationService.createNotification(
                profile,
                "Tài khoản AI đã được mở khóa 🔓",
                "Tính năng AI của bạn đã được phục hồi. Vui lòng sử dụng đúng mục đích.",
                NotificationType.SYSTEM
        );

        log.info("[AI-SAFETY] Admin unblocked AI for profileId={}, new score={}", profileId, newScore);
    }

    public enum ViolationAction {
        WARN_ONLY,
        WARNED,
        AI_BLOCKED,
        ACCOUNT_DELETED
    }

    private ViolationAction executeWarning(ProfileEntity profile,
                                           AiViolationEntity.ViolationType type,
                                           int currentScore) {
        int pointsUntilBlock = SCORE_AI_BLOCK_THRESHOLD - currentScore;
        String message = buildWarningMessage(type, pointsUntilBlock);

        notificationService.createNotification(
                profile,
                "⚠️ Cảnh báo sử dụng AI",
                message,
                NotificationType.SYSTEM
        );

        try {
            String htmlBody = mailTemplateService.buildAiWarningEmail(
                    profile.getFullName(),
                    message,
                    Math.max(pointsUntilBlock, 0)
            );
            emailService.sendHtmlEmail(
                    profile.getEmail(),
                    "Cảnh báo sử dụng AI - Money Manager",
                    htmlBody
            );
        } catch (Exception exception) {
            log.warn("[AI-SAFETY] Failed to send AI warning email to {}: {}", profile.getEmail(), exception.getMessage());
        }

        log.info("[AI-SAFETY] Warning sent to profileId={}, currentScore={}, pointsUntilBlock={}",
                profile.getId(), currentScore, pointsUntilBlock);
        return ViolationAction.WARNED;
    }

    private ViolationAction executeAiBlock(ProfileEntity profile, AiViolationEntity.ViolationType type) {
        String reason = buildBlockReason(type);
        profile.setAiBlockedReason(reason);
        profile.setAiBlockedAt(LocalDateTime.now());
        profileRepository.save(profile);

        notificationService.createNotification(
                profile,
                "Tính năng AI đã bị khóa 🔒",
                "Do vi phạm nhiều lần chính sách sử dụng AI, tất cả tính năng AI của bạn tạm thời bị khóa. Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ hỗ trợ qua email.",
                NotificationType.SYSTEM
        );

        try {
            String htmlBody = mailTemplateService.buildAiBlockEmail(profile.getFullName(), reason);
            emailService.sendHtmlEmail(
                    profile.getEmail(),
                    "🔒 Tính năng AI bị tạm khóa - Money Manager",
                    htmlBody
            );
        } catch (Exception exception) {
            log.warn("[AI-SAFETY] Failed to send AI block email to {}: {}", profile.getEmail(), exception.getMessage());
        }

        log.warn("[AI-SAFETY] AI BLOCKED for profileId={}, reason={}", profile.getId(), reason);
        return ViolationAction.AI_BLOCKED;
    }

    private ViolationAction executeAccountDeletion(ProfileEntity profile) {
        log.warn("[AI-SAFETY] ACCOUNT DELETION triggered for profileId={}, email={}",
                profile.getId(), profile.getEmail());

        try {
            String htmlBody = mailTemplateService.buildAccountDeletionEmail(profile.getFullName());
            emailService.sendHtmlEmail(
                    profile.getEmail(),
                    "Tài khoản Money Manager đã bị xoá ❌",
                    htmlBody
            );
        } catch (Exception exception) {
            log.warn("[AI-SAFETY] Failed to send deletion notification email: {}", exception.getMessage());
        }

        try {
            adminService.deleteUserBySystem(profile.getId());
        } catch (Exception exception) {
            log.error("[AI-SAFETY] Failed to delete account for profileId={}: {}",
                    profile.getId(), exception.getMessage(), exception);
            profile.setIsActive(false);
            profile.setAiBlockedReason("ACCOUNT_PENDING_DELETION");
            profileRepository.save(profile);
        }

        return ViolationAction.ACCOUNT_DELETED;
    }

    private void logViolation(ProfileEntity profile,
                              AiViolationEntity.ViolationType type,
                              int score,
                              String messageSnippet,
                              String source) {
        String snippet = messageSnippet == null ? "" : messageSnippet
                .replaceAll("[\\n\\r\\t]", " ")
                .trim();
        snippet = snippet.substring(0, Math.min(100, snippet.length()));

        aiViolationRepository.save(AiViolationEntity.builder()
                .profile(profile)
                .violationType(type)
                .violationScore(score)
                .messageSnippet(snippet)
                .source(source)
                .build());
    }

    private int getScoreForViolation(AIContentGuard.GuardResult result) {
        return switch (result) {
            case INJECTION_DETECTED, HARMFUL_CONTENT, SEXUAL_CONTENT, VIOLENCE_HATE -> 2;
            case POLITICAL_TOPIC, MEDICAL_DIAGNOSIS, UNHEALTHY_CONTENT -> 1;
            default -> 0;
        };
    }

    private AiViolationEntity.ViolationType mapToViolationType(AIContentGuard.GuardResult result) {
        return switch (result) {
            case INJECTION_DETECTED -> AiViolationEntity.ViolationType.INJECTION;
            case HARMFUL_CONTENT -> AiViolationEntity.ViolationType.HARMFUL_CONTENT;
            case POLITICAL_TOPIC -> AiViolationEntity.ViolationType.POLITICAL;
            case MEDICAL_DIAGNOSIS -> AiViolationEntity.ViolationType.MEDICAL_DIAGNOSIS;
            case SEXUAL_CONTENT -> AiViolationEntity.ViolationType.SEXUAL_CONTENT;
            case VIOLENCE_HATE -> AiViolationEntity.ViolationType.VIOLENCE_HATE;
            case UNHEALTHY_CONTENT -> AiViolationEntity.ViolationType.UNHEALTHY_CONTENT;
            case SELF_HARM -> AiViolationEntity.ViolationType.SELF_HARM;
            default -> AiViolationEntity.ViolationType.HARMFUL_CONTENT;
        };
    }

    private String buildWarningMessage(AiViolationEntity.ViolationType type, int pointsUntilBlock) {
        String topic = switch (type) {
            case INJECTION -> "cố gắng thay đổi hành vi hệ thống AI";
            case HARMFUL_CONTENT -> "yêu cầu tạo nội dung không phù hợp";
            case POLITICAL -> "hỏi về chủ đề chính trị ngoài phạm vi";
            case MEDICAL_DIAGNOSIS -> "hỏi về chẩn đoán y tế ngoài phạm vi";
            case SEXUAL_CONTENT -> "yêu cầu nội dung người lớn";
            case VIOLENCE_HATE -> "yêu cầu bạo lực hoặc kích động ghét thù";
            case UNHEALTHY_CONTENT -> "yêu cầu liên quan đến cờ bạc hoặc cá độ";
            default -> "sử dụng AI không đúng mục đích";
        };
        return String.format(
                "Tài khoản của bạn bị ghi nhận vi phạm do %s. Money Manager chỉ hỗ trợ tài chính cá nhân. Nếu tiếp tục vi phạm, tính năng AI của bạn sẽ bị khóa. Còn %d điểm trước khi bị khóa.",
                topic,
                Math.max(pointsUntilBlock, 0)
        );
    }

    private String buildBlockReason(AiViolationEntity.ViolationType type) {
        return switch (type) {
            case INJECTION -> "Nhiều lần cố gắng can thiệp vào hệ thống AI";
            case HARMFUL_CONTENT -> "Nhiều lần yêu cầu tạo nội dung vi phạm";
            case POLITICAL -> "Nhiều lần hỏi về chủ đề chính trị";
            case MEDICAL_DIAGNOSIS -> "Nhiều lần yêu cầu chẩn đoán y tế";
            case SEXUAL_CONTENT -> "Nhiều lần yêu cầu nội dung người lớn";
            case VIOLENCE_HATE -> "Nhiều lần yêu cầu bạo lực hoặc kích động ghét thù";
            case UNHEALTHY_CONTENT -> "Nhiều lần liên quan đến cờ bạc hoặc cá độ";
            default -> "Vi phạm chính sách sử dụng AI nhiều lần";
        };
    }
}
