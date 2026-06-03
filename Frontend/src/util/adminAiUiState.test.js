import test from "node:test";
import assert from "node:assert/strict";
import {
  buildAiViolationDisplay,
  buildAiUnblockConfirmMessage,
  getAiViolationScoreTone,
  isAiBlockedUser,
} from "./adminAiUiState.js";

test("maps AI violation scores to the expected tone", () => {
  assert.equal(getAiViolationScoreTone(0), "safe");
  assert.equal(getAiViolationScoreTone(1), "warning");
  assert.equal(getAiViolationScoreTone(3), "danger");
});

test("detects when a user is AI-blocked", () => {
  assert.equal(isAiBlockedUser({ aiBlockedReason: "Locked" }), true);
  assert.equal(isAiBlockedUser({ aiBlockedReason: "" }), false);
  assert.equal(isAiBlockedUser(null), false);
});

test("builds the unblock confirmation copy", () => {
  assert.equal(
    buildAiUnblockConfirmMessage("Lan"),
    "Bạn có chắc muốn mở khóa tính năng AI cho Lan không?",
  );
});

test("maps backend AI violation DTO fields for display", () => {
  assert.deepEqual(
    buildAiViolationDisplay({
      type: "POLITICAL",
      snippet: "chủ tịch nước việt nam là ai?",
      source: "CHAT_MODE",
    }),
    {
      type: "POLITICAL",
      snippet: "chủ tịch nước việt nam là ai?",
      source: "CHAT_MODE",
    },
  );
});
