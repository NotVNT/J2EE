package com.example.moneymanager.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

class MailTemplateServiceAiSafetyRegressionTest {

    private final MailTemplateService mailTemplateService = new MailTemplateService();

    @Test
    @DisplayName("REGRESSION: AI warning email template must include warning and remaining points")
    void buildAiWarningEmail_includesWarningAndRemainingPoints() {
        String html = mailTemplateService.buildAiWarningEmail(
                "Minh",
                "Tài khoản của bạn bị ghi nhận vi phạm do hỏi về chủ đề chính trị ngoài phạm vi.",
                2
        );

        assertTrue(html.contains("Minh"));
        assertTrue(html.contains("C&#7843;nh b&#225;o"));
        assertTrue(html.contains("chính trị"));
        assertTrue(html.contains("2 &#273;i&#7875;m"));
    }

    @Test
    @DisplayName("REGRESSION: AI block email template must include reason and user name")
    void buildAiBlockEmail_includesReason() {
        String html = mailTemplateService.buildAiBlockEmail("Minh", "Nhiều lần cố gắng can thiệp vào hệ thống AI");

        assertTrue(html.contains("Minh"));
        assertTrue(html.contains("Tính năng AI"));
        assertTrue(html.contains("Nhiều lần cố gắng can thiệp vào hệ thống AI"));
    }

    @Test
    @DisplayName("REGRESSION: account deletion email template must communicate permanent deletion")
    void buildAccountDeletionEmail_includesPermanentDeletionNotice() {
        String html = mailTemplateService.buildAccountDeletionEmail("Lan");

        assertTrue(html.contains("Lan"));
        assertTrue(html.contains("b&#7883; x&#243;a"));
        assertTrue(html.contains("kh&#244;ng th&#7875; ho&#224;n t&#225;c"));
    }
}
