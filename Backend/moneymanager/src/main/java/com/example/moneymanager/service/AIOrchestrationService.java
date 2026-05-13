package com.example.moneymanager.service;

import com.example.moneymanager.dto.*;
import com.example.moneymanager.entity.*;
import com.example.moneymanager.repository.*;
import com.example.moneymanager.util.AIInstructionPromptBuilder;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIOrchestrationService {

    private final AIChatService aiChatService;
    private final ProfileService profileService;
    private final ExpenseService expenseService;
    private final IncomeService incomeService;
    private final CategoryService categoryService;
    private final BudgetService budgetService;
    private final SavingGoalService savingGoalService;
    private final CategoryRepository categoryRepository;
    private final ProfileRepository profileRepository;
    private final ObjectMapper objectMapper;

    public AIIntentResponseDTO parseIntentFromChat(AIIntentRequestDTO request) {
        String userMessage = request.getUserMessage();
        if (userMessage == null || userMessage.isBlank()) {
            return AIIntentResponseDTO.builder()
                    .intent("INVALID_REQUEST")
                    .validationErrors(List.of("Tin nhắn không được để trống."))
                    .build();
        }

        try {
            ProfileEntity profile = profileService.getCurrentProfile();
            String pageContext = request.getPageContext() != null ? request.getPageContext() : "dashboard";
            Map<String, Object> pageData = loadPageData(pageContext, profile);
            String systemPrompt = AIInstructionPromptBuilder.buildSystemPrompt(pageContext, pageData);

            String crudInstruction = userMessage + "\n\n" +
                    "Hãy phân tích yêu cầu trên và trả về JSON với intent và extracted fields. " +
                    "Nếu là CRUD, bao gồm confirmationPrompt bằng tiếng Việt.";

            String rawResponse = callGeminiForIntent(systemPrompt, crudInstruction, null);
            String cleanedJson = extractJson(rawResponse);

            Map<String, Object> parsed = objectMapper.readValue(cleanedJson, new TypeReference<Map<String, Object>>() {});

            String intent = (String) parsed.getOrDefault("intent", "ANSWER_QUESTION");
            Map<String, Object> extractedFields = (Map<String, Object>) parsed.getOrDefault("extractedFields", parsed);
            Map<String, Object> suggestedValues = (Map<String, Object>) parsed.getOrDefault("suggestedValues", new HashMap<>());
            List<String> validationErrors = (List<String>) parsed.getOrDefault("validationErrors", new ArrayList<>());
            String confirmationPrompt = (String) parsed.get("confirmationPrompt");
            String answer = (String) parsed.get("answer");

            if (confirmationPrompt == null && isCrudIntent(intent)) {
                confirmationPrompt = generateConfirmationPrompt(intent, extractedFields);
            }

            return AIIntentResponseDTO.builder()
                    .status("NEED_CONFIRMATION")
                    .intent(intent)
                    .extractedFields(extractedFields)
                    .suggestedValues(suggestedValues)
                    .validationErrors(validationErrors)
                    .confirmationPrompt(confirmationPrompt)
                    .answer(answer)
                    .provider("gemini")
                    .modelUsed("gemini-2.5-flash")
                    .build();
        } catch (Exception e) {
            log.error("Error parsing intent: {}", e.getMessage(), e);
            try {
                AIChatResponseDTO fallback = aiChatService.chat(AIChatRequestDTO.builder()
                        .provider(request.getProvider())
                        .messages(buildMessages(request))
                        .build());
                return AIIntentResponseDTO.builder()
                        .intent("ANSWER_QUESTION")
                        .answer(fallback.getReply())
                        .provider(fallback.getProvider())
                        .modelUsed(fallback.getModelUsed())
                        .build();
            } catch (Exception fallbackError) {
                return AIIntentResponseDTO.builder()
                        .intent("ANSWER_QUESTION")
                        .answer("Xin lỗi, tôi chưa xử lý được yêu cầu này. Bạn thử lại nhé.")
                        .build();
            }
        }
    }

    @Transactional
    public AIConfirmActionResponseDTO executeConfirmedIntent(AIConfirmActionRequestDTO request) {
        ProfileEntity profile = profileService.getCurrentProfile();
        String intent = request.getIntent();
        Map<String, Object> data = request.getExtractedData();

        if (intent == null || data == null) {
            return AIConfirmActionResponseDTO.builder()
                    .status("ERROR")
                    .message("Dữ liệu không hợp lệ.")
                    .build();
        }

        try {
            String validationError = validateIntentData(intent, data, profile);
            if (validationError != null) {
                return AIConfirmActionResponseDTO.builder()
                        .status("ERROR")
                        .message(validationError)
                        .build();
            }

            String resultMessage = executeIntent(intent, data, profile);

            return AIConfirmActionResponseDTO.builder()
                    .status("SUCCESS")
                    .message(resultMessage)
                    .undoable(true)
                    .build();
        } catch (Exception e) {
            log.error("Error executing intent {}: {}", intent, e.getMessage(), e);
            return AIConfirmActionResponseDTO.builder()
                    .status("ERROR")
                    .message("Lỗi: " + e.getMessage())
                    .build();
        }
    }

    private String validateIntentData(String intent, Map<String, Object> data, ProfileEntity profile) {
        return switch (intent) {
            case "CREATE_EXPENSE", "UPDATE_EXPENSE" -> {
                Object amountObj = data.get("amount");
                if (amountObj == null) yield "Vui lòng nhập số tiền.";
                BigDecimal amount = toBigDecimal(amountObj);
                if (amount.compareTo(BigDecimal.ZERO) <= 0) yield "Số tiền phải lớn hơn 0.";
                String catName = (String) data.get("categoryName");
                if (catName == null || catName.isBlank()) yield "Vui lòng chọn danh mục.";
                yield null;
            }
            case "CREATE_INCOME", "UPDATE_INCOME" -> {
                Object amountObj = data.get("amount");
                if (amountObj == null) yield "Vui lòng nhập số tiền.";
                BigDecimal amount = toBigDecimal(amountObj);
                if (amount.compareTo(BigDecimal.ZERO) <= 0) yield "Số tiền phải lớn hơn 0.";
                yield null;
            }
            case "CREATE_CATEGORY", "UPDATE_CATEGORY" -> {
                String name = (String) data.get("name");
                if (name == null || name.isBlank()) yield "Vui lòng nhập tên danh mục.";
                yield null;
            }
            case "CREATE_BUDGET", "UPDATE_BUDGET" -> {
                Object amountObj = data.get("amount");
                if (amountObj == null) yield "Vui lòng nhập số tiền ngân sách.";
                BigDecimal amount = toBigDecimal(amountObj);
                if (amount.compareTo(BigDecimal.ZERO) <= 0) yield "Số tiền ngân sách phải lớn hơn 0.";
                String catName = (String) data.get("categoryName");
                if (catName == null || catName.isBlank()) yield "Vui lòng chọn danh mục.";
                yield null;
            }
            case "CREATE_SAVING_GOAL", "UPDATE_SAVING_GOAL" -> {
                String name = (String) data.get("name");
                if (name == null || name.isBlank()) yield "Vui lòng nhập tên mục tiêu.";
                Object targetObj = data.get("targetAmount");
                if (targetObj == null) yield "Vui lòng nhập số tiền mục tiêu.";
                BigDecimal targetAmount = toBigDecimal(targetObj);
                if (targetAmount.compareTo(BigDecimal.ZERO) <= 0) yield "Số tiền mục tiêu phải lớn hơn 0.";
                yield null;
            }
            default -> null;
        };
    }

    private String executeIntent(String intent, Map<String, Object> data, ProfileEntity profile) {
        return switch (intent) {
            case "CREATE_EXPENSE" -> {
                ExpenseDTO dto = mapToExpenseDTO(data, profile);
                ExpenseResponseDTO result = expenseService.addExpense(dto);
                yield "✅ Đã tạo chi tiêu " + formatCurrency(dto.getAmount()) + "đ cho " + dto.getCategoryName();
            }
            case "CREATE_INCOME" -> {
                IncomeDTO dto = mapToIncomeDTO(data, profile);
                incomeService.addIncome(dto);
                yield "✅ Đã tạo thu nhập " + formatCurrency(dto.getAmount()) + "đ";
            }
            case "CREATE_CATEGORY" -> {
                CategoryDTO dto = mapToCategoryDTO(data);
                CategoryDTO result = categoryService.saveCategory(dto);
                yield "✅ Đã tạo danh mục \"" + result.getName() + "\"";
            }
            case "CREATE_BUDGET" -> {
                BudgetDTO dto = mapToBudgetDTO(data, profile);
                budgetService.setBudget(dto);
                yield "✅ Đã tạo ngân sách " + formatCurrency(dto.getAmountLimit()) + "đ cho " + dto.getCategoryName();
            }
            case "CREATE_SAVING_GOAL" -> {
                SavingGoalDTO dto = mapToSavingGoalDTO(data);
                savingGoalService.createGoal(dto);
                yield "✅ Đã tạo mục tiêu \"" + dto.getName() + "\"";
            }
            case "DELETE_EXPENSE" -> {
                Object idObj = data.get("expenseId");
                if (idObj != null) {
                    expenseService.deleteExpense(toLong(idObj));
                    yield "✅ Đã xóa chi tiêu.";
                }
                yield "⚠️ Không tìm thấy chi tiêu để xóa.";
            }
            case "DELETE_INCOME" -> {
                Object idObj = data.get("incomeId");
                if (idObj != null) {
                    incomeService.deleteIncome(toLong(idObj));
                    yield "✅ Đã xóa thu nhập.";
                }
                yield "⚠️ Không tìm thấy thu nhập để xóa. Vui lòng cung cấp ID giao dịch.";
            }
            case "DELETE_CATEGORY" -> {
                Object idObj = data.get("categoryId");
                if (idObj != null) {
                    categoryService.deleteCategory(toLong(idObj));
                    yield "✅ Đã xóa danh mục.";
                }
                yield "⚠️ Không tìm thấy danh mục để xóa.";
            }
            case "DELETE_BUDGET" -> {
                Object idObj = data.get("budgetId");
                if (idObj != null) {
                    budgetService.deleteBudget(toLong(idObj));
                    yield "✅ Đã xóa ngân sách.";
                }
                yield "⚠️ Không tìm thấy ngân sách để xóa.";
            }
            case "DELETE_SAVING_GOAL" -> {
                Object idObj = data.get("savingGoalId");
                if (idObj != null) {
                    savingGoalService.deleteGoal(toLong(idObj));
                    yield "✅ Đã xóa mục tiêu tiết kiệm.";
                }
                yield "⚠️ Không tìm thấy mục tiêu để xóa.";
            }
            default -> "✅ Thao tác thành công!";
        };
    }

    private String generateConfirmationPrompt(String intent, Map<String, Object> data) {
        return switch (intent) {
            case "CREATE_EXPENSE" -> {
                Object amount = data.get("amount");
                Object category = data.get("categoryName");
                Object date = data.get("date");
                yield String.format("Bạn muốn tạo chi tiêu %sđ cho %s vào ngày %s, đúng không?",
                        amount != null ? formatCurrency(toBigDecimal(amount)) : "?",
                        category != null ? category : "?",
                        date != null ? date : "hôm nay");
            }
            case "CREATE_INCOME" -> {
                Object amount = data.get("amount");
                yield String.format("Bạn muốn tạo thu nhập %sđ, đúng không?",
                        amount != null ? formatCurrency(toBigDecimal(amount)) : "?");
            }
            case "CREATE_CATEGORY" -> {
                Object name = data.get("name");
                yield String.format("Bạn muốn tạo danh mục \"%s\", đúng không?", name != null ? name : "?");
            }
            case "CREATE_BUDGET" -> {
                Object amount = data.get("amount");
                Object category = data.get("categoryName");
                yield String.format("Bạn muốn đặt ngân sách %sđ cho %s, đúng không?",
                        amount != null ? formatCurrency(toBigDecimal(amount)) : "?",
                        category != null ? category : "?");
            }
            default -> "Bạn xác nhận thực hiện thao tác này?";
        };
    }

    private String extractJson(String raw) {
        if (raw == null) return "{}";
        String s = raw.trim();
        if (s.startsWith("```")) {
            int firstNewline = s.indexOf('\n');
            if (firstNewline != -1) s = s.substring(firstNewline + 1).trim();
            int closingFence = s.lastIndexOf("```");
            if (closingFence != -1) s = s.substring(0, closingFence).trim();
        }
        int start = s.indexOf('{');
        int end = s.lastIndexOf('}');
        if (start != -1 && end != -1 && end > start) {
            return s.substring(start, end + 1);
        }
        return s;
    }

    private String callGeminiForIntent(String systemPrompt, String userMessage, List<AIChatMessageDTO> history) {
        List<AIChatMessageDTO> messages = new ArrayList<>();
        if (history != null) messages.addAll(history);
        messages.add(AIChatMessageDTO.builder().role("user").content(userMessage).build());

        AIChatRequestDTO chatRequest = AIChatRequestDTO.builder()
                .provider("gemini")
                .messages(messages)
                .build();

        return aiChatService.chatWithSystemPrompt(systemPrompt, chatRequest);
    }

    private List<AIChatMessageDTO> buildMessages(AIIntentRequestDTO request) {
        List<AIChatMessageDTO> messages = new ArrayList<>();
        if (request.getConversationHistory() != null) messages.addAll(request.getConversationHistory());
        messages.add(AIChatMessageDTO.builder().role("user").content(request.getUserMessage()).build());
        return messages;
    }

    private Map<String, Object> loadPageData(String pageContext, ProfileEntity profile) {
        Map<String, Object> result = new HashMap<>();
        try {
            switch (pageContext.trim().toLowerCase()) {
                case "category" -> {
                    List<CategoryDTO> categories = categoryService.getCategoriesForCurrentUser();
                    result.put("categories", categories.stream().map(c -> Map.of("id", c.getId(), "name", c.getName(), "type", c.getType())).toList());
                }
                case "expense" -> {
                    List<CategoryDTO> categories = categoryService.getCategoriesForCurrentUser();
                    result.put("categories", categories.stream().map(c -> Map.of("id", c.getId(), "name", c.getName(), "type", c.getType())).toList());
                    result.put("totalExpenseCount", expenseService.getTotalExpenseCountForCurrentUser());
                    result.put("totalExpenseAmount", expenseService.getTotalExpenseForCurrentUser());
                    List<ExpenseDTO> recent = expenseService.getLatest5ExpensesForCurrentUser();
                    result.put("recentExpenses", recent.stream().map(e -> buildExpenseMap(e)).toList());
                }
                case "income" -> {
                    List<CategoryDTO> categories = categoryService.getCategoriesForCurrentUser();
                    result.put("categories", categories.stream().map(c -> Map.of("id", c.getId(), "name", c.getName(), "type", c.getType())).toList());
                    result.put("totalIncomeCount", incomeService.getTotalIncomeCountForCurrentUser());
                    result.put("totalIncomeAmount", incomeService.getTotalIncomeForCurrentUser());
                    List<IncomeDTO> recent = incomeService.getLatest5IncomesForCurrentUser();
                    result.put("recentIncomes", recent.stream().map(i -> buildIncomeMap(i)).toList());
                }
                case "budget" -> {
                    List<CategoryDTO> categories = categoryService.getCategoriesForCurrentUser();
                    result.put("categories", categories.stream().map(c -> Map.of("id", c.getId(), "name", c.getName(), "type", c.getType())).toList());
                    List<BudgetDTO> budgets = budgetService.getBudgetsForCurrentMonth();
                    result.put("budgets", budgets.stream().map(b -> Map.of("id", b.getId(), "categoryName", b.getCategoryName(), "amount", b.getAmountLimit())).toList());
                }
                case "savinggoals" -> {
                    List<SavingGoalDTO> goals = savingGoalService.getAllGoals();
                    result.put("savingGoals", goals.stream().map(g -> Map.of("id", g.getId(), "name", g.getName(), "targetAmount", g.getTargetAmount())).toList());
                }
                default -> {
                    // Dashboard and other pages: load a financial summary
                    result.put("totalExpenseCount", expenseService.getTotalExpenseCountForCurrentUser());
                    result.put("totalIncomeCount", incomeService.getTotalIncomeCountForCurrentUser());
                    result.put("totalExpenseAmount", expenseService.getTotalExpenseForCurrentUser());
                    result.put("totalIncomeAmount", incomeService.getTotalIncomeForCurrentUser());
                    List<ExpenseDTO> recentExp = expenseService.getLatest5ExpensesForCurrentUser();
                    result.put("recentExpenses", recentExp.stream().map(e -> buildExpenseMap(e)).toList());
                    List<IncomeDTO> recentInc = incomeService.getLatest5IncomesForCurrentUser();
                    result.put("recentIncomes", recentInc.stream().map(i -> buildIncomeMap(i)).toList());
                }
            }
        } catch (Exception e) {
            log.warn("Could not load page data for {}: {}", pageContext, e.getMessage());
        }
        return result;
    }

    private Map<String, Object> buildExpenseMap(ExpenseDTO e) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", e.getId());
        m.put("amount", e.getAmount());
        m.put("categoryName", e.getCategoryName() != null ? e.getCategoryName() : "");
        m.put("date", e.getDate() != null ? e.getDate().toString() : "");
        m.put("name", e.getName() != null ? e.getName() : "");
        return m;
    }

    private Map<String, Object> buildIncomeMap(IncomeDTO i) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", i.getId());
        m.put("amount", i.getAmount());
        m.put("categoryName", i.getCategoryName() != null ? i.getCategoryName() : "");
        m.put("date", i.getDate() != null ? i.getDate().toString() : "");
        m.put("name", i.getName() != null ? i.getName() : "");
        return m;
    }

    private boolean isCrudIntent(String intent) {
        return intent != null && (intent.startsWith("CREATE_") || intent.startsWith("UPDATE_") || intent.startsWith("DELETE_"));
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        try {
            return new BigDecimal(value.toString());
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }

    private Long toLong(Object value) {
        if (value == null) return null;
        try {
            return Long.valueOf(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "0";
        return String.format("%,.0f", amount);
    }

    private ExpenseDTO mapToExpenseDTO(Map<String, Object> data, ProfileEntity profile) {
        BigDecimal amount = toBigDecimal(data.get("amount"));
        String categoryName = (String) data.get("categoryName");
        String dateStr = (String) data.get("date");
        String description = (String) data.get("description");

        LocalDate date = parseDate(dateStr);
        Long categoryId = findCategoryId(categoryName, profile.getId());

        return ExpenseDTO.builder()
                .name(categoryName)
                .amount(amount)
                .categoryId(categoryId)
                .categoryName(categoryName)
                .date(date)
                .build();
    }

    private IncomeDTO mapToIncomeDTO(Map<String, Object> data, ProfileEntity profile) {
        BigDecimal amount = toBigDecimal(data.get("amount"));
        String categoryName = (String) data.get("categoryName");
        String dateStr = (String) data.get("date");
        String description = (String) data.get("description");

        LocalDate date = parseDate(dateStr);
        Long categoryId = findCategoryId(categoryName, profile.getId());

        return IncomeDTO.builder()
                .name(categoryName)
                .amount(amount)
                .categoryId(categoryId)
                .categoryName(categoryName)
                .date(date)
                .build();
    }

    private CategoryDTO mapToCategoryDTO(Map<String, Object> data) {
        return CategoryDTO.builder()
                .name((String) data.get("name"))
                .icon((String) data.getOrDefault("icon", "📁"))
                .type((String) data.getOrDefault("type", "expense"))
                .build();
    }

    private BudgetDTO mapToBudgetDTO(Map<String, Object> data, ProfileEntity profile) {
        BigDecimal amount = toBigDecimal(data.get("amount"));
        String categoryName = (String) data.get("categoryName");
        Long categoryId = findCategoryId(categoryName, profile.getId());
        LocalDate now = LocalDate.now();

        return BudgetDTO.builder()
                .amountLimit(amount)
                .categoryId(categoryId)
                .categoryName(categoryName)
                .month(now.getMonthValue())
                .year(now.getYear())
                .build();
    }

    private SavingGoalDTO mapToSavingGoalDTO(Map<String, Object> data) {
        BigDecimal target = toBigDecimal(data.get("targetAmount"));
        LocalDate now = LocalDate.now();

        return SavingGoalDTO.builder()
                .name((String) data.get("name"))
                .targetAmount(target)
                .currentAmount(toBigDecimal(data.getOrDefault("currentAmount", 0)))
                .startDate(now)
                .targetDate(now.plusMonths(3))
                .build();
    }

    private Long findCategoryId(String categoryName, Long profileId) {
        if (categoryName == null || categoryName.isBlank()) return null;
        Optional<CategoryEntity> category = categoryRepository.findByNameIgnoreCaseAndProfileId(categoryName, profileId);
        return category.map(CategoryEntity::getId).orElse(null);
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return LocalDate.now();
        try {
            return LocalDate.parse(dateStr);
        } catch (Exception e) {
            return LocalDate.now();
        }
    }
}
