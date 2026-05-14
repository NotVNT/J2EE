package com.example.moneymanager.service;

import com.example.moneymanager.config.DeepSeekKeyRotator;
import com.example.moneymanager.config.DeepSeekProperties;
import com.example.moneymanager.dto.AIChatMessageDTO;
import com.example.moneymanager.util.OpenRouterResponseParser;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeepSeekService {

    private static final String SYSTEM_PROMPT =
            "B\u1EA1n l\u00E0 Nova \u2014 tr\u1EE3 l\u00FD AI \u0111\u1ED3ng h\u00E0nh c\u1EE7a Money Manager.\n" +
            "H\u1ED7 tr\u1EE3: t\u00E0i ch\u00EDnh c\u00E1 nh\u00E2n, t\u00E2m l\u00FD chi ti\u00EAu, h\u1ED7 tr\u1EE3 c\u1EA3m x\u00FAc/stress, l\u1EDDi khuy\u00EAn cu\u1ED9c s\u1ED1ng, h\u01B0\u1EDBng d\u1EABn app.\n" +
            "T\u1EEB ch\u1ED1i l\u1ECBch s\u1EF1: ch\u00EDnh tr\u1ECB, ch\u1EA9n \u0111o\u00E1n y t\u1EBF, t\u01B0 v\u1EA5n ph\u00E1p l\u00FD c\u1EE5 th\u1EC3.\n" +
            "Phong c\u00E1ch: ti\u1EBFng Vi\u1EC7t, th\u00E2n thi\u1EC7n, kh\u00F4ng ph\u00E1n x\u00E9t, kh\u00F4ng d\u00F9ng markdown (**, #, `).\n" +
            "T\u1ED1i \u0111a 200 ch\u1EEF tr\u1EEB khi \u0111\u01B0\u1EE3c y\u00EAu c\u1EA7u gi\u1EA3i th\u00EDch d\u00E0i h\u01A1n.";

    private final RestClient deepSeekRestClient;
    private final DeepSeekProperties deepSeekProperties;
    private final DeepSeekKeyRotator deepSeekKeyRotator;
    private final ObjectMapper objectMapper;

    public String chat(List<AIChatMessageDTO> messages) {
        return chatWithSystemPrompt(SYSTEM_PROMPT, messages, 1024);
    }

    public String chatWithSystemPrompt(String systemPrompt, List<AIChatMessageDTO> messages, int maxTokens) {
        if (!deepSeekKeyRotator.hasKeys()) {
            throw new RuntimeException("DeepSeek API key ch\u01B0a \u0111\u01B0\u1EE3c c\u1EA5u h\u00ECnh.");
        }

        try {
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", deepSeekProperties.model());

            ArrayNode msgArray = objectMapper.createArrayNode();

            ObjectNode systemMsg = objectMapper.createObjectNode();
            systemMsg.put("role", "system");
            systemMsg.put("content", systemPrompt);
            msgArray.add(systemMsg);

            if (messages != null) {
                for (AIChatMessageDTO msg : messages) {
                    ObjectNode msgNode = objectMapper.createObjectNode();
                    msgNode.put("role", msg.getRole());
                    msgNode.put("content", msg.getContent());
                    msgArray.add(msgNode);
                }
            }

            requestBody.set("messages", msgArray);
            requestBody.put("temperature", 0.4);
            requestBody.put("max_tokens", maxTokens > 0 ? maxTokens : 1024);

            String requestJson = objectMapper.writeValueAsString(requestBody);
            log.debug("DeepSeek request body: {}", requestJson);

            // Read raw string first to avoid deserialization issues
            String rawResponse = deepSeekRestClient.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + deepSeekKeyRotator.nextKey())
                    .body(requestJson)
                    .retrieve()
                    .onStatus(status -> !status.is2xxSuccessful(), (req, res) -> {
                        String errorBody = "";
                        try { errorBody = new String(res.getBody().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8); } catch (Exception ignored) {}
                        log.error("DeepSeek HTTP error {}: {}", res.getStatusCode().value(), errorBody);
                        throw new RuntimeException("DeepSeek API HTTP " + res.getStatusCode().value() + ": " + errorBody);
                    })
                    .body(String.class);

            if (rawResponse == null || rawResponse.isBlank()) {
                log.error("DeepSeek returned null/empty response body");
                throw new RuntimeException("DeepSeek API trả về phản hồi rỗng.");
            }
            log.info("DeepSeek raw response (first 500 chars): {}", rawResponse.length() > 500 ? rawResponse.substring(0, 500) : rawResponse);

            JsonNode root;
            try {
                root = objectMapper.readTree(rawResponse);
            } catch (Exception parseEx) {
                log.error("DeepSeek JSON parse failed. Raw response: {}", rawResponse, parseEx);
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
                log.error("DeepSeek API error [code={}]: {}", errorCode, errorMsg);
                throw new RuntimeException("DeepSeek API error: " + errorMsg);
            }

            String reply = OpenRouterResponseParser.extractAssistantText(root);
            if (reply != null && !reply.isBlank()) {
                return reply;
            }

            log.warn("DeepSeek returned empty content. Full response: {}", root.toString());
            return "T\u00F4i \u0111\u00E3 nh\u1EADn c\u00E2u h\u1ECFi nh\u01B0ng ch\u01B0a t\u1EA1o \u0111\u01B0\u1EE3c c\u00E2u tr\u1EA3 l\u1EDDi ph\u00F9 h\u1EE3p.";
        } catch (Exception e) {
            log.error("DeepSeek chat error: {}", e.getMessage(), e);
            throw new RuntimeException("L\u1ED7i khi g\u1ECDi DeepSeek model: " + e.getMessage(), e);
        }
    }
}
