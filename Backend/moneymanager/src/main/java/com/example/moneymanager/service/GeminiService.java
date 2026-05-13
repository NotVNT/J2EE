package com.example.moneymanager.service;

import com.example.moneymanager.config.GeminiProperties;
import com.example.moneymanager.dto.AIChatMessageDTO;
import com.example.moneymanager.dto.AssistantChatResponseDTO;
import com.example.moneymanager.dto.ExpenseDTO;
import com.example.moneymanager.dto.IncomeDTO;
import com.example.moneymanager.dto.SpendingTipsResponseDTO;
import com.example.moneymanager.entity.ProfileEntity;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.util.Arrays;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiService {

    private final RestClient geminiRestClient;
    private final GeminiProperties geminiProperties;
    private final ObjectMapper objectMapper;
    private final ProfileService profileService;
    private final IncomeService incomeService;
    private final ExpenseService expenseService;

    // Helper method Ä‘á»ƒ chia an toÃ n
    private BigDecimal safeDivide(BigDecimal numerator, BigDecimal denominator, int scale) {
        if (denominator == null || denominator.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        if (numerator == null) {
            return BigDecimal.ZERO;
        }
        return numerator.divide(denominator, scale, RoundingMode.HALF_UP);
    }

    public String callGeminiWithPrompt(String systemPrompt, String userMessage, int maxOutputTokens) {
        validateConfiguration();
        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.set("systemInstruction", buildSystemInstruction(systemPrompt));
        requestBody.set("contents", buildUserContents(userMessage));
        ObjectNode genConfig = objectMapper.createObjectNode();
        genConfig.put("temperature", 0.4);
        genConfig.put("maxOutputTokens", maxOutputTokens);
        requestBody.set("generationConfig", genConfig);
        JsonNode responseBody = executeGenerateContentRequest(requestBody);
        return extractOutputText(responseBody);
    }

    public AssistantChatResponseDTO testConnection(String message) {
        String prompt = (message == null || message.isBlank())
                ? "Tráº£ lá»i Ä‘Ãºng 5 tá»«: Gemini Ä‘ang hoáº¡t Ä‘á»™ng tá»‘t."
                : message.trim();

        JsonNode responseBody = executeGenerateContentRequest(buildPublicRequestBody(prompt));
        String outputText = extractOutputText(responseBody);

        if (outputText == null || outputText.isBlank()) {
            throw new RuntimeException("Gemini khÃ´ng tráº£ vá» ná»™i dung há»£p lá»‡.");
        }

        return AssistantChatResponseDTO.builder()
                .reply(outputText.trim())
                .model(geminiProperties.model())
                .build();
    }

    public AssistantChatResponseDTO chat(String message) {
        validateConfiguration();

        if (message == null || message.isBlank()) {
            throw new RuntimeException("Ná»™i dung tin nháº¯n khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng.");
        }

        String trimmedMessage = message.trim();
        if (!isSupportedQuestion(trimmedMessage)) {
            return AssistantChatResponseDTO.builder()
                    .reply("TÃ´i chá»‰ há»— trá»£ cÃ¡c cÃ¢u há»i vá» quáº£n lÃ½ chi tiÃªu, tÃ i chÃ­nh cÃ¡ nhÃ¢n vÃ  cÃ¡ch sá»­ dá»¥ng Money Manager. Báº¡n hÃ£y há»i má»™t ná»™i dung liÃªn quan Ä‘áº¿n cÃ¡c chá»§ Ä‘á» nÃ y nhÃ©.")
                    .model("Trá»£ lÃ½ Money Manager")
                    .build();
        }

        ProfileEntity currentProfile = profileService.getCurrentProfile();
        JsonNode responseBody = executeGenerateContentRequest(
                buildAuthenticatedRequestBody(currentProfile, trimmedMessage)
        );
        String outputText = extractOutputText(responseBody);

        if (outputText == null || outputText.isBlank()) {
            throw new RuntimeException("Gemini khÃ´ng tráº£ vá» ná»™i dung há»£p lá»‡.");
        }

        return AssistantChatResponseDTO.builder()
                .reply(outputText.trim())
                .model(geminiProperties.model())
                .build();
    }

    public SpendingTipsResponseDTO getSpendingTips() {
        List<ExpenseDTO> expenses = expenseService.getCurrentMonthExpensesForCurrentUser();

        if (expenses.isEmpty()) {
            return SpendingTipsResponseDTO.builder()
                    .tips(List.of())
                    .timestamp(LocalDateTime.now())
                    .disclaimer("ChÆ°a cÃ³ Ä‘á»§ dá»¯ liá»‡u chi tiÃªu thÃ¡ng nÃ y Ä‘á»ƒ Ä‘Æ°a ra gá»£i Ã½.")
                    .build();
        }

        Map<String, BigDecimal> categorySpending = expenses.stream()
                .filter(e -> e.getCategoryName() != null && e.getAmount() != null)
                .collect(Collectors.groupingBy(
                        ExpenseDTO::getCategoryName,
                        Collectors.reducing(BigDecimal.ZERO, ExpenseDTO::getAmount, BigDecimal::add)
                ));

        StringBuilder context = new StringBuilder("Chi tiÃªu thÃ¡ng nÃ y theo danh má»¥c:\n");
        categorySpending.entrySet().stream()
                .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
                .forEach(e -> context.append("- ").append(e.getKey()).append(": ")
                        .append(formatCurrency(e.getValue())).append(" VND\n"));

        String systemPrompt = "Báº¡n lÃ  chuyÃªn gia tÃ i chÃ­nh cÃ¡ nhÃ¢n. Dá»±a vÃ o dá»¯ liá»‡u chi tiÃªu, hÃ£y Ä‘Æ°a ra Ä‘Ãºng 5 gá»£i Ã½ thá»±c táº¿ Ä‘á»ƒ tiáº¿t kiá»‡m. Má»—i gá»£i Ã½ báº¯t Ä‘áº§u báº±ng dáº¥u '-' trÃªn má»™t dÃ²ng riÃªng. KhÃ´ng dÃ¹ng markdown, khÃ´ng giáº£i thÃ­ch thÃªm. Tráº£ lá»i báº±ng tiáº¿ng Viá»‡t.";
        String response = callGeminiWithPrompt(systemPrompt, context.toString(), 500);

        List<String> tips = Arrays.stream(response.split("\n"))
                .map(String::trim)
                .filter(line -> line.startsWith("-"))
                .map(line -> line.substring(1).trim())
                .filter(line -> !line.isBlank())
                .collect(Collectors.toList());

        if (tips.isEmpty()) {
            tips = List.of(response.trim());
        }

        return SpendingTipsResponseDTO.builder()
                .tips(tips)
                .timestamp(LocalDateTime.now())
                .disclaimer("Gá»£i Ã½ Ä‘Æ°á»£c táº¡o bá»Ÿi AI, chá»‰ mang tÃ­nh tham kháº£o.")
                .build();
    }

    // Dashboard insight - phiÃªn báº£n ngáº¯n gá»n
    public AssistantChatResponseDTO getDashboardInsight(Map<String, Object> dashboardData, String fullName) {
        validateConfiguration();
        ObjectNode requestBody = objectMapper.createObjectNode();

        String statsInfo = String.format(
                "Thu nháº­p: %s VND. Chi tiÃªu: %s VND. Sá»‘ dÆ°: %s VND. Sá»‘ má»¥c tiÃªu tiáº¿t kiá»‡m Ä‘ang cháº¡y: %s. Tá»•ng tiá»n tiáº¿t kiá»‡m: %s VND.",
                dashboardData.get("totalIncome"),
                dashboardData.get("totalExpense"),
                dashboardData.get("totalBalance"),
                dashboardData.get("savingGoalActiveCount"),
                dashboardData.get("savingGoalTotalSaved")
        );

        requestBody.set("systemInstruction", buildSystemInstruction(
                "Báº¡n lÃ  chuyÃªn gia tÃ i chÃ­nh AI cá»§a Money Manager. Dá»±a vÃ o sá»‘ liá»‡u thÃ¡ng nÃ y cá»§a " + fullName + ":\n" +
                        statsInfo + "\n" +
                        "Nhiá»‡m vá»¥: ÄÆ°a ra Ä‘Ãºng 1 cÃ¢u dá»± Ä‘oÃ¡n rá»§i ro/xu hÆ°á»›ng vÃ  1 cÃ¢u khuyÃªn hÃ nh Ä‘á»™ng thá»±c táº¿.\n" +
                        "Quy táº¯c nghiÃªm ngáº·t: Tráº£ lá»i tá»‘i Ä‘a 40 chá»¯. KhÃ´ng dÃ¹ng markdown, khÃ´ng dÃ¹ng kÃ½ tá»± Ä‘áº·c biá»‡t (*, #). NÃ³i tháº³ng váº¥n Ä‘á»."
        ));

        requestBody.set("contents", buildUserContents("HÃ£y phÃ¢n tÃ­ch nhanh sá»‘ liá»‡u vÃ  cho tÃ´i dá»± Ä‘oÃ¡n."));
        requestBody.set("generationConfig", buildGenerationConfig());

        JsonNode responseBody = executeGenerateContentRequest(requestBody);
        String outputText = extractOutputText(responseBody);

        if (outputText == null || outputText.isBlank()) {
            outputText = "Hiá»‡n táº¡i dá»¯ liá»‡u Ä‘ang Ä‘Æ°á»£c cáº­p nháº­t, AI sáº½ sá»›m cÃ³ dá»± Ä‘oÃ¡n cho báº¡n.";
        }

        return AssistantChatResponseDTO.builder()
                .reply(outputText.trim())
                .model(geminiProperties.model())
                .build();
    }

    // Dashboard insight CHI TIáº¾T - Dá»° ÄOÃN TÆ¯Æ NG LAI
    public Map<String, Object> getDetailedDashboardInsight(Map<String, Object> dashboardData, String fullName) {
        validateConfiguration();

        if (dashboardData == null) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "No dashboard data available");
            return errorResponse;
        }

        if (fullName == null || fullName.isBlank()) {
            fullName = "báº¡n";
        }

        Map<String, Object> detailedInsight = new LinkedHashMap<>();

        try {
            List<MonthlyData> monthlyTrends = getMonthlyTrends(3);
            List<ExpenseDTO> currentMonthExpenses = expenseService.getCurrentMonthExpensesForCurrentUser();
            List<IncomeDTO> currentMonthIncomes = incomeService.getCurrentMonthIncomesForCurrentUser();

            ForecastResult forecast = predictFuture(monthlyTrends, currentMonthExpenses, currentMonthIncomes);
            List<Map<String, Object>> categoryAnalysis = analyzeCategorySpending(currentMonthExpenses, dashboardData);
            TrendAnalysis trendAnalysis = analyzeTimeTrend(monthlyTrends);
            FinancialRatios ratios = calculateFinancialRatios(dashboardData, monthlyTrends);
            String detailedAdvice = generateForecastAdvice(forecast, trendAnalysis, ratios, fullName);

            detailedInsight.put("forecast", forecast);
            detailedInsight.put("categoryAnalysis", categoryAnalysis);
            detailedInsight.put("trendAnalysis", trendAnalysis);
            detailedInsight.put("financialRatios", ratios);
            detailedInsight.put("detailedAdvice", detailedAdvice);
            detailedInsight.put("currentMonth", getCurrentMonthInfo());
            detailedInsight.put("totalIncome", dashboardData.get("totalIncome"));
            detailedInsight.put("totalExpense", dashboardData.get("totalExpense"));
            detailedInsight.put("totalBalance", dashboardData.get("totalBalance"));

        } catch (Exception e) {
            log.error("Error generating detailed insight: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "KhÃ´ng thá»ƒ táº¡o phÃ¢n tÃ­ch chi tiáº¿t");
            return errorResponse;
        }

        return detailedInsight;
    }

    public String generateMultiTurn(String systemPrompt, List<AIChatMessageDTO> messages, int maxOutputTokens) {
        validateConfiguration();
        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.set("systemInstruction", buildSystemInstruction(systemPrompt));
        ArrayNode contents = objectMapper.createArrayNode();
        for (AIChatMessageDTO msg : messages) {
            ObjectNode contentNode = objectMapper.createObjectNode();
            String role = "assistant".equals(msg.getRole()) ? "model" : msg.getRole();
            contentNode.put("role", role);
            ArrayNode parts = objectMapper.createArrayNode();
            ObjectNode part = objectMapper.createObjectNode();
            part.put("text", msg.getContent());
            parts.add(part);
            contentNode.set("parts", parts);
            contents.add(contentNode);
        }
        requestBody.set("contents", contents);
        ObjectNode genConfig = objectMapper.createObjectNode();
        genConfig.put("temperature", 0.4);
        genConfig.put("maxOutputTokens", maxOutputTokens);
        requestBody.set("generationConfig", genConfig);
        JsonNode responseBody = executeGenerateContentRequest(requestBody);
        String outputText = extractOutputText(responseBody);
        if (outputText == null || outputText.isBlank()) {
            throw new RuntimeException("Gemini kh\u00F4ng tr\u1EA3 v\u1EC1 n\u1ED9i dung h\u1EE3p l\u1EC7.");
        }
        return outputText.trim();
    }

    // Láº¥y dá»¯ liá»‡u cÃ¡c thÃ¡ng gáº§n Ä‘Ã¢y
    private List<MonthlyData> getMonthlyTrends(int months) {
        List<MonthlyData> trends = new ArrayList<>();
        LocalDate now = LocalDate.now();

        for (int i = months; i >= 0; i--) {
            LocalDate targetDate = now.minusMonths(i);
            YearMonth yearMonth = YearMonth.from(targetDate);

            List<ExpenseDTO> expenses = expenseService.getExpensesByMonthForCurrentUser(yearMonth.getYear(), yearMonth.getMonthValue());
            List<IncomeDTO> incomes = incomeService.getIncomesByMonthForCurrentUser(yearMonth.getYear(), yearMonth.getMonthValue());

            BigDecimal totalExpense = expenses.stream()
                    .map(ExpenseDTO::getAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalIncome = incomes.stream()
                    .map(IncomeDTO::getAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            MonthlyData data = new MonthlyData();
            data.setYear(yearMonth.getYear());
            data.setMonth(yearMonth.getMonthValue());
            data.setMonthName(yearMonth.getMonth().getDisplayName(java.time.format.TextStyle.FULL, new Locale("vi")));
            data.setTotalExpense(totalExpense);
            data.setTotalIncome(totalIncome);
            data.setNetCashFlow(totalIncome.subtract(totalExpense));
            data.setTransactionCount(expenses.size() + incomes.size());

            trends.add(data);
        }

        return trends;
    }

    // Dá»° ÄOÃN TÆ¯Æ NG LAI - ÄÃƒ Sá»¬A AN TOÃ€N
    private ForecastResult predictFuture(List<MonthlyData> monthlyTrends,
                                         List<ExpenseDTO> currentExpenses,
                                         List<IncomeDTO> currentIncomes) {
        ForecastResult result = new ForecastResult();

        // GiÃ¡ trá»‹ máº·c Ä‘á»‹nh
        result.setPredictedNextMonthExpense(BigDecimal.ZERO);
        result.setPredictedNextMonthIncome(BigDecimal.ZERO);
        result.setPredictedNextMonthNetCashFlow(BigDecimal.ZERO);
        result.setProjectedEndExpense(BigDecimal.ZERO);
        result.setProjectedEndBalance(BigDecimal.ZERO);
        result.setAvgExpenseGrowthRate(BigDecimal.ZERO);
        result.setAvgIncomeGrowthRate(BigDecimal.ZERO);
        result.setDaysLeftInMonth(0);
        result.setAvgDailyExpense(BigDecimal.ZERO);
        result.setRunOutDate(null);
        result.setRiskLevel("THáº¤P");
        result.setRiskMessage("ChÆ°a Ä‘á»§ dá»¯ liá»‡u Ä‘á»ƒ dá»± Ä‘oÃ¡n");

        if (monthlyTrends == null || monthlyTrends.isEmpty()) {
            return result;
        }

        // TÃ­nh tá»· lá»‡ tÄƒng trÆ°á»Ÿng trung bÃ¬nh
        BigDecimal avgExpenseGrowth = BigDecimal.ZERO;
        BigDecimal avgIncomeGrowth = BigDecimal.ZERO;
        int expenseCount = 0;
        int incomeCount = 0;

        for (int i = 1; i < monthlyTrends.size(); i++) {
            MonthlyData prev = monthlyTrends.get(i - 1);
            MonthlyData curr = monthlyTrends.get(i);

            // TÃ­nh tÄƒng trÆ°á»Ÿng chi tiÃªu an toÃ n
            if (prev.getTotalExpense() != null && prev.getTotalExpense().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal expenseGrowth = safeDivide(
                        curr.getTotalExpense().subtract(prev.getTotalExpense()),
                        prev.getTotalExpense(),
                        4
                );
                avgExpenseGrowth = avgExpenseGrowth.add(expenseGrowth);
                expenseCount++;
            }

            // TÃ­nh tÄƒng trÆ°á»Ÿng thu nháº­p an toÃ n
            if (prev.getTotalIncome() != null && prev.getTotalIncome().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal incomeGrowth = safeDivide(
                        curr.getTotalIncome().subtract(prev.getTotalIncome()),
                        prev.getTotalIncome(),
                        4
                );
                avgIncomeGrowth = avgIncomeGrowth.add(incomeGrowth);
                incomeCount++;
            }
        }

        if (expenseCount > 0) {
            avgExpenseGrowth = avgExpenseGrowth.divide(BigDecimal.valueOf(expenseCount), 4, RoundingMode.HALF_UP);
        }
        if (incomeCount > 0) {
            avgIncomeGrowth = avgIncomeGrowth.divide(BigDecimal.valueOf(incomeCount), 4, RoundingMode.HALF_UP);
        }

        // Dá»± Ä‘oÃ¡n cho thÃ¡ng tiáº¿p theo
        MonthlyData lastMonth = monthlyTrends.get(monthlyTrends.size() - 1);
        if (lastMonth.getTotalExpense() != null) {
            result.setPredictedNextMonthExpense(lastMonth.getTotalExpense().multiply(BigDecimal.ONE.add(avgExpenseGrowth)));
        }
        if (lastMonth.getTotalIncome() != null) {
            result.setPredictedNextMonthIncome(lastMonth.getTotalIncome().multiply(BigDecimal.ONE.add(avgIncomeGrowth)));
        }
        result.setPredictedNextMonthNetCashFlow(result.getPredictedNextMonthIncome().subtract(result.getPredictedNextMonthExpense()));

        // Dá»± Ä‘oÃ¡n cuá»‘i thÃ¡ng hiá»‡n táº¡i
        int currentDay = LocalDate.now().getDayOfMonth();
        int daysInMonth = LocalDate.now().lengthOfMonth();
        int daysLeft = daysInMonth - currentDay;
        result.setDaysLeftInMonth(daysLeft);

        BigDecimal currentTotalExpense = BigDecimal.ZERO;
        if (currentExpenses != null) {
            currentTotalExpense = currentExpenses.stream()
                    .map(ExpenseDTO::getAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        BigDecimal avgDailyExpense = BigDecimal.ZERO;
        if (currentDay > 0 && currentTotalExpense.compareTo(BigDecimal.ZERO) > 0) {
            avgDailyExpense = currentTotalExpense.divide(BigDecimal.valueOf(currentDay), 2, RoundingMode.HALF_UP);
        }
        result.setAvgDailyExpense(avgDailyExpense);
        result.setProjectedEndExpense(currentTotalExpense.add(avgDailyExpense.multiply(BigDecimal.valueOf(daysLeft))));

        BigDecimal currentTotalIncome = BigDecimal.ZERO;
        if (currentIncomes != null) {
            currentTotalIncome = currentIncomes.stream()
                    .map(IncomeDTO::getAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        result.setProjectedEndBalance(currentTotalIncome.subtract(result.getProjectedEndExpense()));

        // Dá»± Ä‘oÃ¡n thá»i Ä‘iá»ƒm cáº¡n kiá»‡t tiá»n
        if (result.getProjectedEndExpense().compareTo(currentTotalIncome) > 0 && avgDailyExpense.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal daysToRunOut = safeDivide(currentTotalIncome, avgDailyExpense, 0);
            LocalDate runOutDay = LocalDate.now().plusDays(daysToRunOut.longValue());
            result.setRunOutDate(runOutDay.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        }

        // ÄÃ¡nh giÃ¡ rá»§i ro
        if (currentTotalIncome.compareTo(BigDecimal.ZERO) > 0) {
            if (result.getProjectedEndExpense().compareTo(currentTotalIncome) > 0) {
                result.setRiskLevel("CAO");
                result.setRiskMessage(String.format("Dá»± Ä‘oÃ¡n cuá»‘i thÃ¡ng báº¡n sáº½ chi tiÃªu vÆ°á»£t thu nháº­p %.0f VND",
                        result.getProjectedEndExpense().subtract(currentTotalIncome)));
            } else if (result.getProjectedEndExpense().compareTo(currentTotalIncome.multiply(BigDecimal.valueOf(0.8))) > 0) {
                result.setRiskLevel("TRUNG_BÃŒNH");
                result.setRiskMessage("Chi tiÃªu Ä‘ang á»Ÿ má»©c cao, cáº§n theo dÃµi sÃ¡t sao");
            } else {
                result.setRiskLevel("THáº¤P");
                result.setRiskMessage("TÃ¬nh hÃ¬nh tÃ i chÃ­nh á»•n Ä‘á»‹nh");
            }
        } else {
            result.setRiskLevel("THáº¤P");
            result.setRiskMessage("ChÆ°a cÃ³ dá»¯ liá»‡u thu nháº­p Ä‘á»ƒ Ä‘Ã¡nh giÃ¡");
        }

        result.setAvgExpenseGrowthRate(avgExpenseGrowth.multiply(BigDecimal.valueOf(100)));
        result.setAvgIncomeGrowthRate(avgIncomeGrowth.multiply(BigDecimal.valueOf(100)));

        return result;
    }

    // PhÃ¢n tÃ­ch chi tiÃªu theo danh má»¥c - ÄÃƒ Sá»¬A AN TOÃ€N
    private List<Map<String, Object>> analyzeCategorySpending(List<ExpenseDTO> expenses, Map<String, Object> dashboardData) {
        if (expenses == null || expenses.isEmpty()) {
            return new ArrayList<>();
        }

        Map<String, BigDecimal> categorySpending = expenses.stream()
                .filter(e -> e.getCategoryName() != null && e.getAmount() != null)
                .collect(Collectors.groupingBy(
                        ExpenseDTO::getCategoryName,
                        Collectors.reducing(BigDecimal.ZERO, ExpenseDTO::getAmount, BigDecimal::add)
                ));

        if (categorySpending.isEmpty()) {
            return new ArrayList<>();
        }

        BigDecimal totalExpense = new BigDecimal(dashboardData.get("totalExpense").toString());

        if (totalExpense == null || totalExpense.compareTo(BigDecimal.ZERO) == 0) {
            return new ArrayList<>();
        }

        return categorySpending.entrySet().stream()
                .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
                .limit(5)
                .map(entry -> {
                    Map<String, Object> cat = new LinkedHashMap<>();
                    cat.put("category", entry.getKey());
                    cat.put("amount", entry.getValue());
                    BigDecimal percentage = safeDivide(
                            entry.getValue().multiply(BigDecimal.valueOf(100)),
                            totalExpense,
                            1
                    );
                    cat.put("percentage", percentage.toString() + "%");
                    cat.put("icon", getCategoryIcon(entry.getKey()));
                    cat.put("advice", getCategoryAdvice(entry.getKey(), entry.getValue(), totalExpense));
                    return cat;
                })
                .collect(Collectors.toList());
    }

    // PhÃ¢n tÃ­ch xu hÆ°á»›ng theo thá»i gian - ÄÃƒ Sá»¬A AN TOÃ€N
    private TrendAnalysis analyzeTimeTrend(List<MonthlyData> monthlyTrends) {
        TrendAnalysis analysis = new TrendAnalysis();

        if (monthlyTrends == null || monthlyTrends.size() < 2) {
            analysis.setTrend("CHÆ¯A Äá»¦ Dá»® LIá»†U");
            analysis.setDescription("Cáº§n thÃªm dá»¯ liá»‡u cÃ¡c thÃ¡ng trÆ°á»›c Ä‘á»ƒ phÃ¢n tÃ­ch xu hÆ°á»›ng");
            analysis.setExpenseTrend("CHÆ¯A Äá»¦ Dá»® LIá»†U");
            analysis.setExpenseTrendMessage("ChÆ°a cÃ³ Ä‘á»§ dá»¯ liá»‡u chi tiÃªu");
            analysis.setIncomeTrend("CHÆ¯A Äá»¦ Dá»® LIá»†U");
            analysis.setIncomeTrendMessage("ChÆ°a cÃ³ Ä‘á»§ dá»¯ liá»‡u thu nháº­p");
            return analysis;
        }

        List<BigDecimal> expenseChanges = new ArrayList<>();
        List<BigDecimal> incomeChanges = new ArrayList<>();

        for (int i = 1; i < monthlyTrends.size(); i++) {
            MonthlyData prev = monthlyTrends.get(i - 1);
            MonthlyData curr = monthlyTrends.get(i);

            if (prev.getTotalExpense() != null && prev.getTotalExpense().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal expenseChange = safeDivide(
                        curr.getTotalExpense().subtract(prev.getTotalExpense()),
                        prev.getTotalExpense(),
                        4
                );
                expenseChanges.add(expenseChange);
            }

            if (prev.getTotalIncome() != null && prev.getTotalIncome().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal incomeChange = safeDivide(
                        curr.getTotalIncome().subtract(prev.getTotalIncome()),
                        prev.getTotalIncome(),
                        4
                );
                incomeChanges.add(incomeChange);
            }
        }

        // Xu hÆ°á»›ng chi tiÃªu
        if (!expenseChanges.isEmpty()) {
            BigDecimal avgExpenseChange = expenseChanges.stream()
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(expenseChanges.size()), 4, RoundingMode.HALF_UP);

            if (avgExpenseChange.compareTo(BigDecimal.valueOf(0.05)) > 0) {
                analysis.setExpenseTrend("TÄ‚NG Máº NH");
                analysis.setExpenseTrendMessage(String.format("Chi tiÃªu Ä‘ang tÄƒng %.1f%% má»—i thÃ¡ng",
                        avgExpenseChange.multiply(BigDecimal.valueOf(100))));
            } else if (avgExpenseChange.compareTo(BigDecimal.ZERO) > 0) {
                analysis.setExpenseTrend("TÄ‚NG NHáº¸");
                analysis.setExpenseTrendMessage(String.format("Chi tiÃªu tÄƒng %.1f%% má»—i thÃ¡ng",
                        avgExpenseChange.multiply(BigDecimal.valueOf(100))));
            } else if (avgExpenseChange.compareTo(BigDecimal.valueOf(-0.05)) < 0) {
                analysis.setExpenseTrend("GIáº¢M Máº NH");
                analysis.setExpenseTrendMessage(String.format("Chi tiÃªu giáº£m %.1f%% má»—i thÃ¡ng, ráº¥t tá»‘t!",
                        avgExpenseChange.abs().multiply(BigDecimal.valueOf(100))));
            } else if (avgExpenseChange.compareTo(BigDecimal.ZERO) < 0) {
                analysis.setExpenseTrend("GIáº¢M NHáº¸");
                analysis.setExpenseTrendMessage(String.format("Chi tiÃªu giáº£m %.1f%% má»—i thÃ¡ng",
                        avgExpenseChange.abs().multiply(BigDecimal.valueOf(100))));
            } else {
                analysis.setExpenseTrend("á»”N Äá»ŠNH");
                analysis.setExpenseTrendMessage("Chi tiÃªu á»•n Ä‘á»‹nh qua cÃ¡c thÃ¡ng");
            }
        } else {
            analysis.setExpenseTrend("CHÆ¯A Äá»¦ Dá»® LIá»†U");
            analysis.setExpenseTrendMessage("ChÆ°a cÃ³ Ä‘á»§ dá»¯ liá»‡u chi tiÃªu");
        }

        // Xu hÆ°á»›ng thu nháº­p
        if (!incomeChanges.isEmpty()) {
            BigDecimal avgIncomeChange = incomeChanges.stream()
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(incomeChanges.size()), 4, RoundingMode.HALF_UP);

            if (avgIncomeChange.compareTo(BigDecimal.valueOf(0.05)) > 0) {
                analysis.setIncomeTrend("TÄ‚NG Máº NH");
                analysis.setIncomeTrendMessage(String.format("Thu nháº­p Ä‘ang tÄƒng %.1f%% má»—i thÃ¡ng",
                        avgIncomeChange.multiply(BigDecimal.valueOf(100))));
            } else if (avgIncomeChange.compareTo(BigDecimal.ZERO) > 0) {
                analysis.setIncomeTrend("TÄ‚NG NHáº¸");
                analysis.setIncomeTrendMessage(String.format("Thu nháº­p tÄƒng %.1f%% má»—i thÃ¡ng",
                        avgIncomeChange.multiply(BigDecimal.valueOf(100))));
            } else if (avgIncomeChange.compareTo(BigDecimal.valueOf(-0.05)) < 0) {
                analysis.setIncomeTrend("GIáº¢M Máº NH");
                analysis.setIncomeTrendMessage(String.format("Thu nháº­p Ä‘ang giáº£m %.1f%% má»—i thÃ¡ng, cáº§n lÆ°u Ã½!",
                        avgIncomeChange.abs().multiply(BigDecimal.valueOf(100))));
            } else if (avgIncomeChange.compareTo(BigDecimal.ZERO) < 0) {
                analysis.setIncomeTrend("GIáº¢M NHáº¸");
                analysis.setIncomeTrendMessage(String.format("Thu nháº­p giáº£m %.1f%% má»—i thÃ¡ng",
                        avgIncomeChange.abs().multiply(BigDecimal.valueOf(100))));
            } else {
                analysis.setIncomeTrend("á»”N Äá»ŠNH");
                analysis.setIncomeTrendMessage("Thu nháº­p á»•n Ä‘á»‹nh qua cÃ¡c thÃ¡ng");
            }
        } else {
            analysis.setIncomeTrend("CHÆ¯A Äá»¦ Dá»® LIá»†U");
            analysis.setIncomeTrendMessage("ChÆ°a cÃ³ Ä‘á»§ dá»¯ liá»‡u thu nháº­p");
        }

        analysis.setTrend("á»”N Äá»ŠNH");
        analysis.setDescription("Xu hÆ°á»›ng tÃ i chÃ­nh Ä‘ang Ä‘Æ°á»£c phÃ¢n tÃ­ch");

        return analysis;
    }

    // TÃ­nh cÃ¡c chá»‰ sá»‘ tÃ i chÃ­nh - ÄÃƒ Sá»¬A AN TOÃ€N
    private FinancialRatios calculateFinancialRatios(Map<String, Object> dashboardData, List<MonthlyData> monthlyTrends) {
        FinancialRatios ratios = new FinancialRatios();

        ratios.setSavingsRate(BigDecimal.ZERO);
        ratios.setFixedExpenseRatio(BigDecimal.ZERO);
        ratios.setMonthsOfSurvival(BigDecimal.ZERO);
        ratios.setHealthScore("CHÆ¯A Äá»¦ Dá»® LIá»†U");
        ratios.setHealthMessage("ChÆ°a cÃ³ Ä‘á»§ dá»¯ liá»‡u Ä‘á»ƒ Ä‘Ã¡nh giÃ¡");

        try {
            BigDecimal totalIncome = new BigDecimal(dashboardData.get("totalIncome").toString());
            BigDecimal totalExpense = new BigDecimal(dashboardData.get("totalExpense").toString());
            BigDecimal totalBalance = new BigDecimal(dashboardData.get("totalBalance").toString());

            // Tá»· lá»‡ tiáº¿t kiá»‡m
            if (totalIncome != null && totalIncome.compareTo(BigDecimal.ZERO) > 0) {
                ratios.setSavingsRate(safeDivide(
                        totalIncome.subtract(totalExpense).multiply(BigDecimal.valueOf(100)),
                        totalIncome,
                        1
                ));
            }

            // Sá»‘ thÃ¡ng cÃ³ thá»ƒ sá»‘ng
            if (totalExpense != null && totalExpense.compareTo(BigDecimal.ZERO) > 0) {
                ratios.setMonthsOfSurvival(safeDivide(totalBalance, totalExpense, 1));
            }

            // ÄÃ¡nh giÃ¡ sá»©c khá»e tÃ i chÃ­nh
            if (ratios.getSavingsRate().compareTo(BigDecimal.valueOf(20)) >= 0) {
                ratios.setHealthScore("Tá»T");
                ratios.setHealthMessage("Báº¡n Ä‘ang tiáº¿t kiá»‡m ráº¥t tá»‘t! HÃ£y duy trÃ¬.");
            } else if (ratios.getSavingsRate().compareTo(BigDecimal.valueOf(10)) >= 0) {
                ratios.setHealthScore("KHÃ");
                ratios.setHealthMessage("Tiáº¿t kiá»‡m á»Ÿ má»©c khÃ¡, cÃ³ thá»ƒ cáº£i thiá»‡n thÃªm.");
            } else if (ratios.getSavingsRate().compareTo(BigDecimal.ZERO) >= 0) {
                ratios.setHealthScore("TRUNG BÃŒNH");
                ratios.setHealthMessage("Tiáº¿t kiá»‡m cÃ²n tháº¥p, cáº§n cáº¯t giáº£m chi tiÃªu khÃ´ng cáº§n thiáº¿t.");
            } else if (ratios.getSavingsRate().compareTo(BigDecimal.ZERO) < 0) {
                ratios.setHealthScore("KÃ‰M");
                ratios.setHealthMessage("Báº¡n Ä‘ang chi tiÃªu nhiá»u hÆ¡n thu nháº­p! Cáº§n Ä‘iá»u chá»‰nh ngay.");
            }

        } catch (Exception e) {
            log.error("Error calculating financial ratios: {}", e.getMessage());
        }

        ratios.setFixedExpenseRatio(calculateFixedExpenseRatio());
        return ratios;
    }

    private String generateForecastAdvice(ForecastResult forecast, TrendAnalysis trend,
                                          FinancialRatios ratios, String userName) {
        StringBuilder advice = new StringBuilder();

        advice.append("ðŸ”® Dá»° ÄOÃN TÆ¯Æ NG LAI CHO ").append(userName.toUpperCase()).append(":\n\n");

        advice.append("ðŸ“Š Dá»° BÃO THÃNG Tá»šI:\n");
        advice.append(String.format("â€¢ Chi tiÃªu dá»± kiáº¿n: %s VND\n", formatCurrency(forecast.getPredictedNextMonthExpense())));
        advice.append(String.format("â€¢ Thu nháº­p dá»± kiáº¿n: %s VND\n", formatCurrency(forecast.getPredictedNextMonthIncome())));
        advice.append(String.format("â€¢ DÃ²ng tiá»n rÃ²ng: %s VND\n", formatCurrency(forecast.getPredictedNextMonthNetCashFlow())));

        if (forecast.getPredictedNextMonthNetCashFlow().compareTo(BigDecimal.ZERO) < 0) {
            advice.append("âš ï¸ Cáº¢NH BÃO: Dá»± Ä‘oÃ¡n thÃ¡ng tá»›i sáº½ thÃ¢m há»¥t! HÃ£y chuáº©n bá»‹ káº¿ hoáº¡ch cáº¯t giáº£m chi tiÃªu.\n");
        }

        advice.append("\nðŸ“… Dá»° BÃO CUá»I THÃNG NÃ€Y:\n");
        advice.append(String.format("â€¢ Chi tiÃªu dá»± kiáº¿n: %s VND\n", formatCurrency(forecast.getProjectedEndExpense())));
        advice.append(String.format("â€¢ Sá»‘ dÆ° dá»± kiáº¿n: %s VND\n", formatCurrency(forecast.getProjectedEndBalance())));
        advice.append(String.format("â€¢ Chi tiÃªu trung bÃ¬nh/ngÃ y: %s VND\n", formatCurrency(forecast.getAvgDailyExpense())));

        if (forecast.getRunOutDate() != null) {
            advice.append(String.format("ðŸš¨ Cáº¢NH BÃO NGHIÃŠM TRá»ŒNG: Dá»± Ä‘oÃ¡n báº¡n sáº½ háº¿t tiá»n vÃ o ngÃ y %s!\n", forecast.getRunOutDate()));
            advice.append("â†’ HÃ€NH Äá»˜NG NGAY: Cáº¯t giáº£m chi tiÃªu khÃ´ng thiáº¿t yáº¿u, tÃ¬m thÃªm nguá»“n thu nháº­p.\n");
        }

        advice.append("\nðŸ“ˆ PHÃ‚N TÃCH XU HÆ¯á»šNG:\n");
        advice.append(String.format("â€¢ %s\n", trend.getExpenseTrendMessage()));
        advice.append(String.format("â€¢ %s\n", trend.getIncomeTrendMessage()));

        advice.append("\nðŸ’ª CHá»ˆ Sá» TÃ€I CHÃNH:\n");
        advice.append(String.format("â€¢ Tá»· lá»‡ tiáº¿t kiá»‡m: %.1f%% (%s)\n", ratios.getSavingsRate(), ratios.getHealthMessage()));
        advice.append(String.format("â€¢ Sá»‘ thÃ¡ng cÃ³ thá»ƒ sá»‘ng náº¿u khÃ´ng cÃ³ thu nháº­p: %.1f thÃ¡ng\n", ratios.getMonthsOfSurvival()));

        advice.append("\nðŸŽ¯ KHUYáº¾N NGHá»Š Cá»¤ THá»‚:\n");
        if ("CAO".equals(forecast.getRiskLevel())) {
            advice.append("1. Cáº®T GIáº¢M NGAY: Ä‚n ngoÃ i, mua sáº¯m khÃ´ng cáº§n thiáº¿t, giáº£i trÃ­\n");
            advice.append("2. THEO DÃ•I SÃT: Cáº­p nháº­t giao dá»‹ch hÃ ng ngÃ y\n");
            advice.append("3. TÄ‚NG THU NHáº¬P: LÃ m thÃªm, bÃ¡n Ä‘á»“ khÃ´ng dÃ¹ng\n");
        } else if ("TRUNG_BÃŒNH".equals(forecast.getRiskLevel())) {
            advice.append("1. Äáº¶T NGÃ‚N SÃCH: Giá»›i háº¡n chi tiÃªu cho tá»«ng danh má»¥c\n");
            advice.append("2. TIáº¾T KIá»†M 10%: Tá»± Ä‘á»™ng trÃ­ch 10% thu nháº­p vÃ o tiáº¿t kiá»‡m\n");
            advice.append("3. RÃ€ SOÃT Äá»ŠNH Ká»²: Kiá»ƒm tra chi tiÃªu má»—i tuáº§n\n");
        } else {
            advice.append("1. DUY TRÃŒ Tá»T: Tiáº¿p tá»¥c thÃ³i quen chi tiÃªu hiá»‡n táº¡i\n");
            advice.append("2. Äáº¦U TÆ¯: CÃ¢n nháº¯c Ä‘áº§u tÆ° sá»‘ tiá»n dÆ° Ä‘á»ƒ sinh lá»i\n");
            advice.append("3. Má»¤C TIÃŠU Lá»šN: Äáº·t má»¥c tiÃªu tiáº¿t kiá»‡m dÃ i háº¡n\n");
        }

        advice.append("\nâ­ ").append(getMotivationalMessage(forecast, ratios));
        return advice.toString();
    }

    private String getCategoryIcon(String category) {
        Map<String, String> icons = new HashMap<>();
        icons.put("Ä‚n uá»‘ng", "ðŸœ");
        icons.put("Mua sáº¯m", "ðŸ›ï¸");
        icons.put("Di chuyá»ƒn", "ðŸš—");
        icons.put("XÄƒng xe", "â›½");
        icons.put("HÃ³a Ä‘Æ¡n", "ðŸ“„");
        icons.put("Tiá»n Ä‘iá»‡n", "ðŸ’¡");
        icons.put("Tiá»n nÆ°á»›c", "ðŸ’§");
        icons.put("Giáº£i trÃ­", "ðŸŽ¬");
        icons.put("Sá»©c khá»e", "ðŸ¥");
        icons.put("GiÃ¡o dá»¥c", "ðŸ“š");
        icons.put("Du lá»‹ch", "âœˆï¸");
        return icons.getOrDefault(category, "ðŸ“Œ");
    }

    private String getCategoryAdvice(String category, BigDecimal amount, BigDecimal totalExpense) {
        if (totalExpense == null || totalExpense.compareTo(BigDecimal.ZERO) == 0) {
            return "ChÆ°a cÃ³ dá»¯ liá»‡u chi tiÃªu";
        }

        BigDecimal percentage = safeDivide(amount.multiply(BigDecimal.valueOf(100)), totalExpense, 1);

        if (category.contains("Ä‚n uá»‘ng") && percentage.compareTo(BigDecimal.valueOf(30)) > 0) {
            return "Chiáº¿m " + percentage + "% tá»•ng chi tiÃªu. NÃªn náº¥u Äƒn táº¡i nhÃ  Ä‘á»ƒ tiáº¿t kiá»‡m.";
        } else if (category.contains("Mua sáº¯m") && percentage.compareTo(BigDecimal.valueOf(20)) > 0) {
            return "Chiáº¿m " + percentage + "% tá»•ng chi tiÃªu. Cáº§n lÃªn danh sÃ¡ch trÆ°á»›c khi mua sáº¯m.";
        } else if (category.contains("Giáº£i trÃ­") && percentage.compareTo(BigDecimal.valueOf(15)) > 0) {
            return "Chiáº¿m " + percentage + "% tá»•ng chi tiÃªu. CÃ¢n nháº¯c giáº£m táº§n suáº¥t giáº£i trÃ­.";
        } else if (percentage.compareTo(BigDecimal.valueOf(10)) > 0) {
            return "Chiáº¿m " + percentage + "% tá»•ng chi tiÃªu. Äang á»Ÿ má»©c á»•n.";
        } else {
            return "Chiáº¿m " + percentage + "% tá»•ng chi tiÃªu. Tiáº¿p tá»¥c duy trÃ¬.";
        }
    }

    private BigDecimal calculateFixedExpenseRatio() {
        List<ExpenseDTO> fixedExpenses = expenseService.getCurrentMonthExpensesForCurrentUser().stream()
                .filter(e -> e.getCategoryName() != null &&
                        (e.getCategoryName().contains("HÃ³a Ä‘Æ¡n") ||
                                e.getCategoryName().contains("Tiá»n Ä‘iá»‡n") ||
                                e.getCategoryName().contains("Tiá»n nÆ°á»›c") ||
                                e.getCategoryName().contains("Tiá»n nhÃ ")))
                .collect(Collectors.toList());

        BigDecimal totalFixedExpense = fixedExpenses.stream()
                .map(ExpenseDTO::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = expenseService.getTotalExpenseForCurrentUser();

        if (totalExpense != null && totalExpense.compareTo(BigDecimal.ZERO) > 0) {
            return safeDivide(totalFixedExpense.multiply(BigDecimal.valueOf(100)), totalExpense, 1);
        }

        return BigDecimal.valueOf(30);
    }

    private String getMotivationalMessage(ForecastResult forecast, FinancialRatios ratios) {
        if ("CAO".equals(forecast.getRiskLevel())) {
            return "HÃ£y báº¯t Ä‘áº§u ngay hÃ´m nay! Má»—i Ä‘á»“ng tiáº¿t kiá»‡m Ä‘á»u cÃ³ giÃ¡ trá»‹. Báº¡n cÃ³ thá»ƒ lÃ m Ä‘Æ°á»£c! ðŸ’ª";
        } else if ("TRUNG_BÃŒNH".equals(forecast.getRiskLevel())) {
            return "Báº¡n Ä‘ang Ä‘i Ä‘Ãºng hÆ°á»›ng! HÃ£y kiÃªn trÃ¬ vÃ  cáº£i thiá»‡n má»—i ngÃ y. ThÃ nh cÃ´ng Ä‘ang chá»! ðŸŒŸ";
        } else {
            if (ratios.getSavingsRate().compareTo(BigDecimal.valueOf(20)) >= 0) {
                return "Tuyá»‡t vá»i! Báº¡n Ä‘ang kiá»ƒm soÃ¡t tÃ i chÃ­nh ráº¥t tá»‘t. HÃ£y nghÄ© Ä‘áº¿n cÃ¡c má»¥c tiÃªu lá»›n hÆ¡n! ðŸŽ¯";
            } else {
                return "TÃ¬nh hÃ¬nh tÃ i chÃ­nh kháº£ quan! HÃ£y duy trÃ¬ vÃ  nÃ¢ng cao tá»· lá»‡ tiáº¿t kiá»‡m. Cá»‘ lÃªn! ðŸš€";
            }
        }
    }

    private Map<String, Object> getCurrentMonthInfo() {
        Map<String, Object> info = new LinkedHashMap<>();
        LocalDate now = LocalDate.now();
        info.put("month", now.getMonth().getDisplayName(java.time.format.TextStyle.FULL, new Locale("vi")));
        info.put("year", now.getYear());
        info.put("currentDay", now.getDayOfMonth());
        info.put("daysInMonth", now.lengthOfMonth());
        info.put("daysLeft", now.lengthOfMonth() - now.getDayOfMonth());
        return info;
    }

    private String formatCurrency(BigDecimal amount) {
        BigDecimal safeAmount = amount != null ? amount : BigDecimal.ZERO;
        NumberFormat formatter = NumberFormat.getNumberInstance(new Locale("vi", "VN"));
        return formatter.format(safeAmount);
    }

    private void validateConfiguration() {
        if (geminiProperties.apiKey() == null || geminiProperties.apiKey().isBlank()) {
            throw new RuntimeException("Gemini API key chÆ°a Ä‘Æ°á»£c cáº¥u hÃ¬nh.");
        }
        if (geminiProperties.model() == null || geminiProperties.model().isBlank()) {
            throw new RuntimeException("Gemini model chÆ°a Ä‘Æ°á»£c cáº¥u hÃ¬nh.");
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
                throw new RuntimeException("Gemini khÃ´ng tráº£ vá» dá»¯ liá»‡u.");
            }
            return objectMapper.readTree(responseJson);
        } catch (Exception exception) {
            throw new RuntimeException("KhÃ´ng thá»ƒ gá»i Gemini API: " + exception.getMessage(), exception);
        }
    }

    private ObjectNode buildPublicRequestBody(String message) {
        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.set("systemInstruction", buildSystemInstruction(
                "Báº¡n lÃ  trá»£ lÃ½ AI cho á»©ng dá»¥ng Money Manager. LuÃ´n tráº£ lá»i báº±ng tiáº¿ng Viá»‡t, Ä‘Ãºng trá»ng tÃ¢m, rÃµ rÃ ng, dá»… hiá»ƒu."
        ));
        requestBody.set("contents", buildUserContents(message));
        requestBody.set("generationConfig", buildGenerationConfig());
        return requestBody;
    }

    private ObjectNode buildAuthenticatedRequestBody(ProfileEntity profile, String message) {
        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.set("systemInstruction", buildSystemInstruction(
                "Báº¡n lÃ  trá»£ lÃ½ tÃ i chÃ­nh cho á»©ng dá»¥ng Money Manager.\n" +
                        "NgÆ°á»i dÃ¹ng: " + safeValue(profile.getFullName()) + ", email: " + safeValue(profile.getEmail()) + "\n" +
                        buildFinancialContext()
        ));
        requestBody.set("contents", buildUserContents(message));
        requestBody.set("generationConfig", buildGenerationConfig());
        return requestBody;
    }

    private String buildFinancialContext() {
        // Giá»¯ nguyÃªn method nÃ y
        return "";
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
        if (responseBody == null) return null;
        JsonNode candidates = responseBody.get("candidates");
        if (candidates == null || !candidates.isArray() || candidates.isEmpty()) return null;
        StringBuilder builder = new StringBuilder();
        for (JsonNode candidate : candidates) {
            JsonNode content = candidate.get("content");
            if (content == null) continue;
            JsonNode parts = content.get("parts");
            if (parts == null || !parts.isArray()) continue;
            for (JsonNode part : parts) {
                JsonNode textNode = part.get("text");
                if (textNode != null && !textNode.isNull()) {
                    if (!builder.isEmpty()) builder.append('\n');
                    builder.append(textNode.asText());
                }
            }
        }
        return builder.toString().trim();
    }

    private String safeValue(String value) {
        return value == null || value.isBlank() ? "KhÃ´ng cÃ³" : value;
    }

    private boolean isSupportedQuestion(String message) {
        String normalizedMessage = normalizeText(message);
        List<String> supportedKeywords = List.of(
                "chi tieu", "thu chi", "thu nhap", "tiet kiem", "tai chinh",
                "ngan sach", "so du", "giao dich", "hoa don", "muc tieu"
        );
        return supportedKeywords.stream().anyMatch(normalizedMessage::contains);
    }

    private String normalizeText(String value) {
        String normalizedValue = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase();
        return normalizedValue.replaceAll("\\s+", " ").trim();
    }

    // Inner classes (ÄÃƒ Sá»¬A VÃ€ THÃŠM @DATA LOMBOK)
    @Data
    public static class MonthlyData {
        private int year;
        private int month;
        private String monthName;
        private BigDecimal totalExpense;
        private BigDecimal totalIncome;
        private BigDecimal netCashFlow;
        private int transactionCount;
    }

    @Data
    public static class ForecastResult {
        private BigDecimal predictedNextMonthExpense;
        private BigDecimal predictedNextMonthIncome;
        private BigDecimal predictedNextMonthNetCashFlow;
        private BigDecimal projectedEndExpense;
        private BigDecimal projectedEndBalance;
        private BigDecimal avgExpenseGrowthRate;
        private BigDecimal avgIncomeGrowthRate;
        private int daysLeftInMonth;
        private BigDecimal avgDailyExpense;
        private String runOutDate;
        private String riskLevel;
        private String riskMessage;
    }

    @Data
    public static class TrendAnalysis {
        private String trend;
        private String description;
        private String expenseTrend;
        private String expenseTrendMessage;
        private String incomeTrend;
        private String incomeTrendMessage;
    }

    @Data
    public static class FinancialRatios {
        private BigDecimal savingsRate;
        private BigDecimal fixedExpenseRatio;
        private BigDecimal monthsOfSurvival;
        private String healthScore;
        private String healthMessage;
    }
}
