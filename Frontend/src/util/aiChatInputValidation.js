export const MAX_AI_CHAT_INPUT_LENGTH = 800;

export const validateAiChatInput = (text) => {
  if (!text || !text.trim()) {
    return { valid: false, reason: null };
  }

  if (text.length > MAX_AI_CHAT_INPUT_LENGTH) {
    return {
      valid: false,
      reason: `Tin nhắn quá dài. Tối đa ${MAX_AI_CHAT_INPUT_LENGTH} ký tự.`,
    };
  }

  if (/<script|<iframe|javascript:/i.test(text)) {
    return {
      valid: false,
      reason: "Nội dung tin nhắn không hợp lệ.",
    };
  }

  return { valid: true, reason: null };
};
