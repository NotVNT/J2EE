package com.example.moneymanager.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public final class OpenRouterResponseParser {

    private OpenRouterResponseParser() {
    }

    public static boolean isSseFormat(String raw) {
        return raw != null && raw.stripLeading().startsWith("data:");
    }

    /**
     * Parses an SSE streaming response and concatenates only actual content tokens.
     * Skips reasoning_content (thinking tokens) — those are internal model reasoning, not the reply.
     */
    public static String parseSseStream(String raw, ObjectMapper mapper) {
        StringBuilder content = new StringBuilder();
        for (String line : raw.split("\n")) {
            String trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            String json = trimmed.substring(5).trim();
            if ("[DONE]".equals(json)) break;
            try {
                JsonNode chunk = mapper.readTree(json);
                JsonNode choices = chunk.get("choices");
                if (choices == null || !choices.isArray() || choices.isEmpty()) continue;
                JsonNode delta = choices.get(0).get("delta");
                if (delta == null) continue;
                // Only collect delta.content — skip reasoning_content (thinking tokens)
                JsonNode contentNode = delta.get("content");
                if (contentNode != null && !contentNode.isNull() && contentNode.isTextual()) {
                    String text = contentNode.asText();
                    if (!text.isEmpty()) content.append(text);
                }
            } catch (Exception ignored) {}
        }
        return content.toString().trim();
    }

    public static String extractAssistantText(JsonNode root) {
        if (root == null) {
            return null;
        }

        JsonNode choices = root.get("choices");
        if (choices == null || !choices.isArray() || choices.isEmpty()) {
            return null;
        }

        JsonNode firstChoice = choices.get(0);
        if (firstChoice == null || firstChoice.isNull()) {
            return null;
        }

        JsonNode messageNode = firstChoice.get("message");
        if (messageNode != null && !messageNode.isNull()) {
            String content = extractText(messageNode.get("content"));
            if (hasText(content)) {
                return content;
            }

            content = extractText(messageNode.get("text"));
            if (hasText(content)) {
                return content;
            }

            content = extractText(messageNode.get("refusal"));
            if (hasText(content)) {
                return content;
            }
        }

        String content = extractText(firstChoice.get("text"));
        return hasText(content) ? content : null;
    }

    public static String extractText(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isTextual() || node.isNumber() || node.isBoolean()) {
            return node.asText().trim();
        }
        if (node.isArray()) {
            StringBuilder sb = new StringBuilder();
            for (JsonNode item : node) {
                String part = extractTextPart(item);
                if (hasText(part)) {
                    if (!sb.isEmpty()) {
                        sb.append('\n');
                    }
                    sb.append(part);
                }
            }
            return sb.toString().trim();
        }
        if (node.isObject()) {
            String part = extractTextPart(node);
            return hasText(part) ? part : node.asText().trim();
        }
        return node.asText().trim();
    }

    private static String extractTextPart(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isTextual() || node.isNumber() || node.isBoolean()) {
            return node.asText().trim();
        }
        if (node.isObject()) {
            String[] textFields = {"text", "content", "value", "output_text", "refusal"};
            for (String field : textFields) {
                String value = extractText(node.get(field));
                if (hasText(value)) {
                    return value;
                }
            }
        }
        if (node.isArray()) {
            return extractText(node);
        }
        return null;
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
