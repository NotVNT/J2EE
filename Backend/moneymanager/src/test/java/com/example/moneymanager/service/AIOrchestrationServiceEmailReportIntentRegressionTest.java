package com.example.moneymanager.service;

import com.example.moneymanager.config.GeminiProperties;
import com.example.moneymanager.dto.AIChatMessageDTO;
import com.example.moneymanager.dto.AIChatRequestDTO;
import com.example.moneymanager.dto.AIIntentRequestDTO;
import com.example.moneymanager.dto.AIIntentResponseDTO;
import com.example.moneymanager.entity.ProfileEntity;
import com.example.moneymanager.entity.SubscriptionPlan;
import com.example.moneymanager.model.ChatMessage;
import com.example.moneymanager.repository.BudgetRepository;
import com.example.moneymanager.repository.CategoryRepository;
import com.example.moneymanager.repository.ExpenseRepository;
import com.example.moneymanager.repository.IncomeRepository;
import com.example.moneymanager.repository.JarRepository;
import com.example.moneymanager.repository.ProfileRepository;
import com.example.moneymanager.repository.SavingGoalRepository;
import com.example.moneymanager.util.AIInstructionPromptBuilder;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AIOrchestrationServiceEmailReportIntentRegressionTest {

    @Mock private AIChatService aiChatService;
    @Mock private GeminiProperties geminiProperties;
    @Mock private ProfileService profileService;
    @Mock private ChatHistoryService chatHistoryService;
    @Mock private ExpenseService expenseService;
    @Mock private IncomeService incomeService;
    @Mock private CategoryService categoryService;
    @Mock private BudgetService budgetService;
    @Mock private SavingGoalService savingGoalService;
    @Mock private JarService jarService;
    @Mock private CategoryRepository categoryRepository;
    @Mock private ExpenseRepository expenseRepository;
    @Mock private IncomeRepository incomeRepository;
    @Mock private BudgetRepository budgetRepository;
    @Mock private SavingGoalRepository savingGoalRepository;
    @Mock private ProfileRepository profileRepository;
    @Mock private JarRepository jarRepository;
    @Spy private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private AIOrchestrationService aiOrchestrationService;

    @Test
    @DisplayName("REGRESSION: follow-up email request after export history must become EMAIL_EXPENSE_REPORT")
    void parseIntentFromChat_reclassifiesEmailFollowUpFromRecentExportHistory() {
        ProfileEntity basicProfile = ProfileEntity.builder()
                .id(7L)
                .subscriptionPlan(SubscriptionPlan.BASIC)
                .build();

        AIIntentRequestDTO request = AIIntentRequestDTO.builder()
                .provider("gemini")
                .model("gemini-3.1-flash-lite")
                .sessionId("session-1")
                .pageContext("aiChat")
                .userMessage("email luôn nhé")
                .conversationHistory(List.of(
                        AIChatMessageDTO.builder().role("user").content("xuất báo cáo qua excel cho tôi đi").build(),
                        AIChatMessageDTO.builder().role("assistant").content("Đã xác nhận xuất Excel chi tiêu").build()
                ))
                .build();

        when(profileService.getCurrentProfile()).thenReturn(basicProfile);
        when(geminiProperties.model()).thenReturn("gemini-3.1-flash-lite");
        when(expenseService.getTotalExpenseCountForCurrentUser()).thenReturn(0L);
        when(expenseService.getTotalExpenseForCurrentUser()).thenReturn(BigDecimal.ZERO);
        when(expenseService.getLatest5ExpensesForCurrentUser()).thenReturn(List.of());
        when(incomeService.getTotalIncomeCountForCurrentUser()).thenReturn(0L);
        when(incomeService.getTotalIncomeForCurrentUser()).thenReturn(BigDecimal.ZERO);
        when(incomeService.getLatest5IncomesForCurrentUser()).thenReturn(List.of());
        when(chatHistoryService.addMessage(anyString(), anyString(), anyString()))
                .thenReturn(ChatMessage.builder().id("msg-1").build());
        when(aiChatService.chatWithSystemPrompt(anyString(), any(AIChatRequestDTO.class)))
                .thenReturn("{\"intent\":\"ANSWER_QUESTION\",\"intentType\":\"QUESTION\",\"answer\":\"Mình sẽ hỗ trợ bạn.\"}");

        AIIntentResponseDTO response = aiOrchestrationService.parseIntentFromChat(request);

        assertEquals("EMAIL_EXPENSE_REPORT", response.getIntent());
        assertEquals("ACTION", response.getIntentType());
        assertEquals("NEED_CONFIRMATION", response.getStatus());
        assertTrue(response.getMissingFields() == null || response.getMissingFields().isEmpty());
    }

    @Test
    @DisplayName("REGRESSION: intent prompt must include follow-up export-to-email example for aiChat")
    void buildSystemPrompt_includesExportToEmailFollowUpExample() {
        String prompt = AIInstructionPromptBuilder.buildSystemPrompt("aiChat", Map.of());

        assertTrue(prompt.contains("ok gửi qua email cho tôi luôn nhé"));
        assertTrue(prompt.contains("EMAIL_EXPENSE_REPORT"));
        assertTrue(prompt.contains("pageContext='dashboard' hoặc 'aiChat'"));
    }
}
