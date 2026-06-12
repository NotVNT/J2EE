import { MAX_AI_CHAT_INPUT_LENGTH } from "./aiChatInputValidation.js";

export const AI_CHAT_COUNTER_THRESHOLD = 600;
export const AI_CHAT_COUNTER_DANGER_THRESHOLD = 750;

export const getAiChatCounterState = (length) => {
  if (length <= AI_CHAT_COUNTER_THRESHOLD) {
    return null;
  }

  return {
    text: `${length}/${MAX_AI_CHAT_INPUT_LENGTH}`,
    tone: length > AI_CHAT_COUNTER_DANGER_THRESHOLD ? "danger" : "normal",
  };
};

export const getAssistantMessageVariant = (message) => {
  if (message?.isGuarded) {
    return "guarded";
  }

  if (message?.isError) {
    return "error";
  }

  if (message?.isSystem || message?.isAgentResult) {
    return "system";
  }

  return "default";
};
