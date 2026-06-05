import test from "node:test";
import assert from "node:assert/strict";
import { maskMoneyText } from "./dashboardPrivacy.js";

test("maskMoneyText keeps visible money unchanged", () => {
  assert.equal(maskMoneyText("1.250.000 VND", true), "1.250.000 VND");
});

test("maskMoneyText hides money values with a stable placeholder", () => {
  assert.equal(maskMoneyText("1.250.000 VND", false), "******");
});
