import test from "node:test";
import assert from "node:assert/strict";
import { MAX_AI_CHAT_INPUT_LENGTH, validateAiChatInput } from "./aiChatInputValidation.js";

test("rejects empty AI chat input without user-facing error", () => {
  assert.deepEqual(validateAiChatInput("   "), {
    valid: false,
    reason: null,
  });
});

test("rejects overly long AI chat input", () => {
  const input = "a".repeat(MAX_AI_CHAT_INPUT_LENGTH + 1);

  assert.deepEqual(validateAiChatInput(input), {
    valid: false,
    reason: `Tin nhắn quá dài. Tối đa ${MAX_AI_CHAT_INPUT_LENGTH} ký tự.`,
  });
});

test("rejects basic script injection patterns", () => {
  assert.deepEqual(validateAiChatInput("<script>alert(1)</script>"), {
    valid: false,
    reason: "Nội dung tin nhắn không hợp lệ.",
  });
});

test("accepts valid trimmed content", () => {
  assert.deepEqual(validateAiChatInput("Phân tích chi tiêu tháng này"), {
    valid: true,
    reason: null,
  });
});
