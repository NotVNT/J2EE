import test from "node:test";
import assert from "node:assert/strict";
import { API_ENDPOINTS } from "./apiEndpoints.js";

test("exposes admin AI safety endpoints", () => {
  assert.equal(API_ENDPOINTS.ADMIN_USER_AI_VIOLATIONS(7), "/admin/users/7/ai-violations");
  assert.equal(API_ENDPOINTS.ADMIN_USER_AI_UNBLOCK(7), "/admin/users/7/ai-unblock");
});
