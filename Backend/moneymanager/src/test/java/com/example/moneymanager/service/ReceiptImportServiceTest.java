package com.example.moneymanager.service;

import com.example.moneymanager.config.GeminiKeyRotator;
import com.example.moneymanager.config.GeminiProperties;
import com.example.moneymanager.entity.CategoryEntity;
import com.example.moneymanager.entity.ProfileEntity;
import com.example.moneymanager.repository.CategoryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReceiptImportServiceTest {

    @Mock(answer = org.mockito.Answers.RETURNS_DEEP_STUBS)
    private RestClient geminiRestClient;
    @Mock private GeminiProperties geminiProperties;
    @Mock private GeminiKeyRotator geminiKeyRotator;
    @Spy  private ObjectMapper objectMapper = new ObjectMapper();
    @Mock private ProfileService profileService;
    @Mock private CategoryRepository categoryRepository;
    @Mock private ExpenseService expenseService;
    @Mock private SubscriptionService subscriptionService;

    @InjectMocks
    private ReceiptImportService receiptImportService;

    private ProfileEntity profile;
    private CategoryEntity otherCategory;

    @BeforeEach
    void setUp() {
        profile = ProfileEntity.builder().id(1L).build();
        otherCategory = CategoryEntity.builder()
                .id(99L).name("Khác").type("expense").icon("CircleHelp").profile(profile)
                .build();
    }

    /**
     * RED test: before fix, application/pdf hits the image-only content-type guard and throws
     * "Định dạng tệp không hợp lệ" — not "Nội dung tệp không hợp lệ".
     * After fix, it passes the content-type check and the magic-bytes check rejects the fake bytes.
     */
    @Test
    void validateFile_rejectsPdfWithWrongMagicBytes() {
        byte[] fakePdfBytes = {0x00, 0x01, 0x02, 0x03, 0x04};
        MockMultipartFile file = new MockMultipartFile(
                "file", "fake.pdf", "application/pdf", fakePdfBytes);

        when(profileService.getCurrentProfile()).thenReturn(profile);
        doNothing().when(subscriptionService).ensureCanImportReceipt(any());

        assertThatThrownBy(() -> receiptImportService.analyzeReceipt(file))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Nội dung tệp không hợp lệ");
    }

    /**
     * Regression: unsupported content type (e.g., docx/zip) must always be rejected.
     * This test passes both before and after the fix.
     */
    @Test
    void validateFile_rejectsUnsupportedContentType() {
        byte[] zipMagic = {0x50, 0x4B, 0x03, 0x04};
        MockMultipartFile file = new MockMultipartFile(
                "file", "doc.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                zipMagic);

        when(profileService.getCurrentProfile()).thenReturn(profile);
        doNothing().when(subscriptionService).ensureCanImportReceipt(any());

        assertThatThrownBy(() -> receiptImportService.analyzeReceipt(file))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Định dạng tệp không hợp lệ");
    }
}
