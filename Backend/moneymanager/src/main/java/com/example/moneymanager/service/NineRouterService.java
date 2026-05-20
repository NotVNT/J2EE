package com.example.moneymanager.service;

import com.example.moneymanager.config.NineRouterKeyRotator;
import com.example.moneymanager.config.NineRouterProperties;
import com.example.moneymanager.dto.AssistantChatResponseDTO;
import com.example.moneymanager.util.OpenRouterResponseParser;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Slf4j
@Service
@RequiredArgsConstructor
public class NineRouterService {

    private final RestClient nineRouterRestClient;
    private final NineRouterProperties nineRouterProperties;
    private final NineRouterKeyRotator nineRouterKeyRotator;
    private final ObjectMapper objectMapper;

    public String callWithPrompt(String systemPrompt, String userMessage, int maxTokens) {
        if (!nineRouterKeyRotator.hasKeys()) {
            throw new RuntimeException("9Router chưa được cấu hình API key.");
        }

        try {
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", nineRouterProperties.model());

            ArrayNode msgArray = objectMapper.createArrayNode();
            ObjectNode sysMsg = objectMapper.createObjectNode();
            sysMsg.put("role", "system");
            sysMsg.put("content", systemPrompt);
            msgArray.add(sysMsg);

            ObjectNode userMsg = objectMapper.createObjectNode();
            userMsg.put("role", "user");
            userMsg.put("content", userMessage);
            msgArray.add(userMsg);

            requestBody.set("messages", msgArray);
            requestBody.put("temperature", 0.4);
            if (maxTokens > 0) {
                requestBody.put("max_tokens", maxTokens);
            }

            String requestJson = objectMapper.writeValueAsString(requestBody);
            log.debug("9Router callWithPrompt request (first 200 chars): {}", requestJson.length() > 200 ? requestJson.substring(0, 200) : requestJson);

            String rawResponse = nineRouterRestClient.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + nineRouterKeyRotator.nextKey())
                    .body(requestJson)
                    .retrieve()
                    .onStatus(status -> !status.is2xxSuccessful(), (req, res) -> {
                        String errorBody = "";
                        try { errorBody = new String(res.getBody().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8); } catch (Exception ignored) {}
                        log.error("9Router HTTP error {}: {}", res.getStatusCode().value(), errorBody);
                        throw new RuntimeException("9Router API HTTP " + res.getStatusCode().value() + ": " + errorBody);
                    })
                    .body(String.class);

            if (rawResponse == null || rawResponse.isBlank()) {
                log.error("9Router callWithPrompt returned null/empty");
                throw new RuntimeException("9Router API trả về phản hồi rỗng.");
            }

            log.info("9Router callWithPrompt response (first 500 chars): {}", rawResponse.length() > 500 ? rawResponse.substring(0, 500) : rawResponse);

            // NineRouter may return SSE streaming format even when stream=false is requested
            if (OpenRouterResponseParser.isSseFormat(rawResponse)) {
                String reply = OpenRouterResponseParser.parseSseStream(rawResponse, objectMapper);
                if (reply != null && !reply.isBlank()) {
                    return reply;
                }
                log.warn("9Router SSE stream returned no content. Raw: {}", rawResponse.substring(0, Math.min(500, rawResponse.length())));
                throw new RuntimeException("9Router SSE stream không trả về nội dung hợp lệ.");
            }

            JsonNode root;
            try {
                root = objectMapper.readTree(rawResponse);
            } catch (Exception parseEx) {
                log.error("9Router JSON parse failed. Raw response: {}", rawResponse, parseEx);
                String cleaned = rawResponse.trim();
                if (!cleaned.startsWith("{") && !cleaned.startsWith("[")) {
                    return cleaned;
                }
                throw parseEx;
            }

            JsonNode errorNode = root.get("error");
            if (errorNode != null && !errorNode.isNull()) {
                String errorMsg = errorNode.has("message") ? errorNode.get("message").asText() : errorNode.asText();
                String errorCode = errorNode.has("code") ? errorNode.get("code").asText() : "unknown";
                log.error("9Router API error [code={}]: {}", errorCode, errorMsg);
                throw new RuntimeException("9Router API lỗi: " + errorMsg);
            }

            String reply = OpenRouterResponseParser.extractAssistantText(root);
            if (reply != null && !reply.isBlank()) {
                return reply;
            }

            log.warn("9Router returned empty content. Full response: {}", root.toString());
            throw new RuntimeException("9Router không trả về nội dung hợp lệ.");
        } catch (Exception e) {
            log.error("9Router call error: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể gọi 9Router API: " + e.getMessage(), e);
        }
    }

    public AssistantChatResponseDTO chat(String message) {
        try {
            String reply = callWithPrompt(
                    "Bạn là chuyên gia tài chính AI của Money Manager. Trả lời bằng tiếng Việt, ngắn gọn, rõ ràng, không dùng markdown.",
                    message,
                    800
            );
            return AssistantChatResponseDTO.builder()
                    .reply(reply)
                    .model(nineRouterProperties.model())
                    .build();
        } catch (Exception e) {
            log.error("9Router chat error: {}", e.getMessage(), e);
            return AssistantChatResponseDTO.builder()
                    .reply("Xin lỗi, AI đang bận. Bạn thử lại sau nhé.")
                    .model(nineRouterProperties.model())
                    .build();
        }
    }

    public AssistantChatResponseDTO getDashboardInsight(java.util.Map<String, Object> dashboardData, String fullName) {
        String statsInfo = String.format(
                "Thu nhập: %s VND. Chi tiêu: %s VND. Số dư: %s VND. Số mục tiêu tiết kiệm đang chạy: %s. Tổng tiền tiết kiệm: %s VND.",
                dashboardData.get("totalIncome"),
                dashboardData.get("totalExpense"),
                dashboardData.get("totalBalance"),
                dashboardData.get("savingGoalActiveCount"),
                dashboardData.get("savingGoalTotalSaved")
        );

        String systemPrompt = "Bạn là chuyên gia tài chính AI của Money Manager. Dựa vào số liệu tháng này của " + fullName + ":\n" +
                statsInfo + "\n" +
                "Nhiệm vụ: Đưa ra đúng 1 câu dự đoán rủi ro/xu hướng và 1 câu khuyên hành động thực tế.\n" +
                "Quy tắc: Trả lời tối đa 40 chữ. Không dùng markdown, không dùng ký tự đặc biệt. Nói thẳng vấn đề.";

        try {
            String reply = callWithPrompt(systemPrompt, "Hãy phân tích nhanh số liệu và cho tôi dự đoán.", 256);
            return AssistantChatResponseDTO.builder()
                    .reply(reply)
                    .model(nineRouterProperties.model())
                    .build();
        } catch (Exception e) {
            log.error("9Router dashboard insight error: {}", e.getMessage(), e);
            return AssistantChatResponseDTO.builder()
                    .reply("AI đang cập nhật, vui lòng thử lại sau.")
                    .model(nineRouterProperties.model())
                    .build();
        }
    }
}
