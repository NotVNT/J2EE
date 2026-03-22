package com.example.moneymanager.service;

import com.example.moneymanager.config.GeminiProperties;
import com.example.moneymanager.dto.AssistantChatResponseDTO;
import com.example.moneymanager.dto.ExpenseDTO;
import com.example.moneymanager.dto.IncomeDTO;
import com.example.moneymanager.entity.ProfileEntity;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GeminiService {

    private final RestClient geminiRestClient;
    private final GeminiProperties geminiProperties;
    private final ObjectMapper objectMapper;
    private final ProfileService profileService;
    private final IncomeService incomeService;
    private final ExpenseService expenseService;

    public AssistantChatResponseDTO testConnection(String message) {
        String prompt = (message == null || message.isBlank())
                ? "Trả lời đúng 5 từ: Gemini đang hoạt động tốt."
                : message.trim();

        JsonNode responseBody = executeGenerateContentRequest(buildPublicRequestBody(prompt));
        String outputText = extractOutputText(responseBody);

        if (outputText == null || outputText.isBlank()) {
            throw new RuntimeException("Gemini không trả về nội dung hợp lệ.");
        }

        return AssistantChatResponseDTO.builder()
                .reply(outputText.trim())
                .model(geminiProperties.model())
                .build();
    }

    public AssistantChatResponseDTO chat(String message) {
        validateConfiguration();

        if (message == null || message.isBlank()) {
            throw new RuntimeException("Nội dung tin nhắn không được để trống.");
        }

        String trimmedMessage = message.trim();
        if (!isSupportedQuestion(trimmedMessage)) {
            return AssistantChatResponseDTO.builder()
                    .reply("Tôi chỉ hỗ trợ các câu hỏi về quản lý chi tiêu, tài chính cá nhân và cách sử dụng Money Manager. Bạn hãy hỏi một nội dung liên quan đến các chủ đề này nhé.")
                    .model("Trợ lý Money Manager")
                    .build();
        }

        ProfileEntity currentProfile = profileService.getCurrentProfile();
        JsonNode responseBody = executeGenerateContentRequest(
                buildAuthenticatedRequestBody(currentProfile, trimmedMessage)
        );
        String outputText = extractOutputText(responseBody);

        if (outputText == null || outputText.isBlank()) {
            throw new RuntimeException("Gemini không trả về nội dung hợp lệ.");
        }

        return AssistantChatResponseDTO.builder()
                .reply(outputText.trim())
                .model(geminiProperties.model())
                .build();
    }

    private void validateConfiguration() {
        if (geminiProperties.apiKey() == null || geminiProperties.apiKey().isBlank()) {
            throw new RuntimeException("Gemini API key chưa được cấu hình.");
        }
        if (geminiProperties.model() == null || geminiProperties.model().isBlank()) {
            throw new RuntimeException("Gemini model chưa được cấu hình.");
        }
    }

    private JsonNode executeGenerateContentRequest(ObjectNode requestBody) {
        validateConfiguration();

        try {
            String requestJson = objectMapper.writeValueAsString(requestBody);
            String responseJson = geminiRestClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1beta/models/{model}:generateContent")
                            .queryParam("key", geminiProperties.apiKey())
                            .build(geminiProperties.model()))
                    .body(requestJson)
                    .retrieve()
                    .body(String.class);

            if (responseJson == null || responseJson.isBlank()) {
                throw new RuntimeException("Gemini không trả về dữ liệu.");
            }

            return objectMapper.readTree(responseJson);
        } catch (Exception exception) {
            throw new RuntimeException("Không thể gọi Gemini API: " + exception.getMessage(), exception);
        }
    }

    private ObjectNode buildPublicRequestBody(String message) {
        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.set("systemInstruction", buildSystemInstruction(
                """
                Bạn là trợ lý AI cho ứng dụng Money Manager.
                Luôn trả lời bằng tiếng Việt, đúng trọng tâm, rõ ràng, dễ hiểu.
                Trả lời thẳng vào câu hỏi, không viết lời chào hoặc mở bài dài dòng.
                Không dùng markdown. Không dùng dấu *, **, # hoặc bảng.
                Nếu câu hỏi đơn giản, trả lời trong 2 đến 3 câu.
                Nếu câu hỏi cần giải thích, trả lời tối đa 3 ý chính, mỗi ý ngắn gọn.
                Chỉ nêu thêm chi tiết khi người dùng yêu cầu giải thích sâu.
                Nếu liệt kê, mỗi ý một dòng để dễ đọc.
                Luôn kết thúc trọn câu, không bỏ dở giữa ý.
                """
        ));
        requestBody.set("contents", buildUserContents(message));
        requestBody.set("generationConfig", buildGenerationConfig());
        return requestBody;
    }

    private ObjectNode buildAuthenticatedRequestBody(ProfileEntity profile, String message) {
        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.set("systemInstruction", buildSystemInstruction(
                """
                Bạn là trợ lý tài chính cho ứng dụng Money Manager.
                Luôn trả lời bằng tiếng Việt, đúng trọng tâm, rõ ràng, dễ hiểu.
                Trả lời thẳng vào câu hỏi, không viết lời chào hoặc mở bài dài dòng.
                Không dùng markdown. Không dùng dấu *, **, # hoặc bảng.
                Nếu câu hỏi đơn giản, trả lời trong 2 đến 3 câu.
                Nếu câu hỏi cần giải thích, trả lời tối đa 3 ý chính, mỗi ý ngắn gọn.
                Chỉ nêu thêm chi tiết khi người dùng yêu cầu giải thích sâu.
                Nếu liệt kê, mỗi ý một dòng để dễ đọc.
                Luôn kết thúc trọn câu, không bỏ dở giữa ý.
                Khi phù hợp, hãy đưa ra lời khuyên quản lý chi tiêu thực tế.
                Nếu câu hỏi liên quan đến số liệu tài chính, hãy ưu tiên dựa trên dữ liệu thật bên dưới.
                Nếu dữ liệu hiện có chưa đủ để kết luận chắc chắn, hãy nói rõ phần nào còn thiếu.

                Người dùng hiện tại là %s, email %s.

                Dữ liệu tài chính hiện tại:
                %s
                """
                        .formatted(
                                safeValue(profile.getFullName()),
                                safeValue(profile.getEmail()),
                                buildFinancialContext()
                        )
        ));
        requestBody.set("contents", buildUserContents(message));
        requestBody.set("generationConfig", buildGenerationConfig());
        return requestBody;
    }

    private String buildFinancialContext() {
        List<IncomeDTO> currentMonthIncomes = incomeService.getCurrentMonthIncomesForCurrentUser();
        List<ExpenseDTO> currentMonthExpenses = expenseService.getCurrentMonthExpensesForCurrentUser();

        BigDecimal totalIncome = currentMonthIncomes.stream()
                .map(IncomeDTO::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = currentMonthExpenses.stream()
                .map(ExpenseDTO::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal balance = totalIncome.subtract(totalExpense);

        String topExpenseCategory = currentMonthExpenses.stream()
                .filter(expense -> expense.getCategoryName() != null && expense.getAmount() != null)
                .collect(Collectors.groupingBy(
                        ExpenseDTO::getCategoryName,
                        Collectors.reducing(BigDecimal.ZERO, ExpenseDTO::getAmount, BigDecimal::add)
                ))
                .entrySet()
                .stream()
                .max(Map.Entry.comparingByValue())
                .map(entry -> entry.getKey() + ": " + formatCurrency(entry.getValue()))
                .orElse("Chưa có");

        String recentExpenses = currentMonthExpenses.stream()
                .sorted(Comparator.comparing(ExpenseDTO::getDate, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(ExpenseDTO::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(3)
                .map(expense -> String.format(
                        "- %s: %s, danh mục %s, ngày %s",
                        safeValue(expense.getName()),
                        formatCurrency(expense.getAmount()),
                        safeValue(expense.getCategoryName()),
                        expense.getDate() != null ? expense.getDate() : "Không có"
                ))
                .collect(Collectors.joining("\n"));

        String recentIncomes = currentMonthIncomes.stream()
                .sorted(Comparator.comparing(IncomeDTO::getDate, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(IncomeDTO::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(3)
                .map(income -> String.format(
                        "- %s: %s, danh mục %s, ngày %s",
                        safeValue(income.getName()),
                        formatCurrency(income.getAmount()),
                        safeValue(income.getCategoryName()),
                        income.getDate() != null ? income.getDate() : "Không có"
                ))
                .collect(Collectors.joining("\n"));

        return """
                Hôm nay là %s.
                Tổng thu nhập tháng này: %s.
                Tổng chi tiêu tháng này: %s.
                Số dư tháng này: %s.
                Số giao dịch thu nhập tháng này: %d.
                Số giao dịch chi tiêu tháng này: %d.
                Danh mục chi nhiều nhất tháng này: %s.
                3 khoản chi gần nhất:
                %s
                3 khoản thu gần nhất:
                %s
                """.formatted(
                LocalDate.now(),
                formatCurrency(totalIncome),
                formatCurrency(totalExpense),
                formatCurrency(balance),
                currentMonthIncomes.size(),
                currentMonthExpenses.size(),
                topExpenseCategory,
                recentExpenses.isBlank() ? "- Chưa có dữ liệu" : recentExpenses,
                recentIncomes.isBlank() ? "- Chưa có dữ liệu" : recentIncomes
        );
    }

    private String formatCurrency(BigDecimal amount) {
        BigDecimal safeAmount = amount != null ? amount : BigDecimal.ZERO;
        NumberFormat formatter = NumberFormat.getNumberInstance(new Locale("vi", "VN"));
        return formatter.format(safeAmount) + " VND";
    }

    private ObjectNode buildSystemInstruction(String text) {
        ObjectNode instruction = objectMapper.createObjectNode();
        ArrayNode parts = objectMapper.createArrayNode();
        ObjectNode part = objectMapper.createObjectNode();
        part.put("text", text);
        parts.add(part);
        instruction.set("parts", parts);
        return instruction;
    }

    private ArrayNode buildUserContents(String message) {
        ArrayNode contents = objectMapper.createArrayNode();
        ObjectNode userMessage = objectMapper.createObjectNode();
        userMessage.put("role", "user");

        ArrayNode parts = objectMapper.createArrayNode();
        ObjectNode part = objectMapper.createObjectNode();
        part.put("text", message);
        parts.add(part);

        userMessage.set("parts", parts);
        contents.add(userMessage);
        return contents;
    }

    private ObjectNode buildGenerationConfig() {
        ObjectNode generationConfig = objectMapper.createObjectNode();
        generationConfig.put("temperature", 0.35);
        generationConfig.put("maxOutputTokens", 820);
        return generationConfig;
    }

    private String extractOutputText(JsonNode responseBody) {
        if (responseBody == null) {
            return null;
        }

        JsonNode candidates = responseBody.get("candidates");
        if (candidates == null || !candidates.isArray() || candidates.isEmpty()) {
            return null;
        }

        StringBuilder builder = new StringBuilder();
        for (JsonNode candidate : candidates) {
            JsonNode content = candidate.get("content");
            if (content == null) {
                continue;
            }

            JsonNode parts = content.get("parts");
            if (parts == null || !parts.isArray()) {
                continue;
            }

            for (JsonNode part : parts) {
                JsonNode textNode = part.get("text");
                if (textNode != null && !textNode.isNull()) {
                    if (!builder.isEmpty()) {
                        builder.append('\n');
                    }
                    builder.append(textNode.asText());
                }
            }
        }

        return builder.toString().trim();
    }

    private String safeValue(String value) {
        return value == null || value.isBlank() ? "Không có" : value;
    }

    private boolean isSupportedQuestion(String message) {
        String normalizedMessage = normalizeText(message);

        List<String> supportedKeywords = List.of(
                "chi tieu",
                "thu chi",
                "thu nhap",
                "tiet kiem",
                "tai chinh",
                "tai chinh ca nhan",
                "ngan sach",
                "so du",
                "giao dich",
                "hoa don",
                "muc tieu",
                "vi tien",
                "chi phi",
                "kiem soat chi tieu",
                "quan ly chi tieu",
                "quan ly tien",
                "money manager",
                "ung dung",
                "app",
                "he thong",
                "dang ky",
                "dang nhap",
                "kich hoat",
                "quen mat khau",
                "dat lai mat khau",
                "tai khoan",
                "profile",
                "dashboard",
                "danh muc",
                "category",
                "income",
                "expense",
                "bao cao",
                "thanh toan",
                "payos",
                "goi free",
                "goi basic",
                "goi premium",
                "subscription",
                "premium",
                "basic",
                "free",
                "thang nay",
                "hom nay"
        );

        return supportedKeywords.stream().anyMatch(normalizedMessage::contains);
    }

    private String normalizeText(String value) {
        String normalizedValue = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase();
        return normalizedValue.replaceAll("\\s+", " ").trim();
    }
}
