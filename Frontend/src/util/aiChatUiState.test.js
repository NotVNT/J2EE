import test from "node:test";
import assert from "node:assert/strict";
import {
  AI_CHAT_COUNTER_DANGER_THRESHOLD,
  AI_CHAT_COUNTER_THRESHOLD,
  getAiChatCounterState,
  getAssistantMessageVariant,
} from "./aiChatUiState.js";

test("shows no counter before the warning threshold", () => {
  assert.equal(getAiChatCounterState(AI_CHAT_COUNTER_THRESHOLD), null);
});

test("shows the counter after the warning threshold", () => {
  assert.deepEqual(getAiChatCounterState(AI_CHAT_COUNTER_THRESHOLD + 1), {
    text: "601/800",
    tone: "normal",
  });
});

test("turns the counter red after the danger threshold", () => {
  assert.deepEqual(getAiChatCounterState(AI_CHAT_COUNTER_DANGER_THRESHOLD + 1), {
    text: "751/800",
    tone: "danger",
  });
});

test("marks assistant bubble variants consistently", () => {
  assert.equal(getAssistantMessageVariant({ isGuarded: true }), "guarded");
  assert.equal(getAssistantMessageVariant({ isError: true }), "error");
  assert.equal(getAssistantMessageVariant({ isSystem: true }), "system");
  assert.equal(getAssistantMessageVariant({}), "default");
});
