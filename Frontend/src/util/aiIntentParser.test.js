import test from "node:test";
import assert from "node:assert/strict";
import {
  hasExplicitActionVerb,
  isLikelyFinancialQuestion,
  isActionIntent,
  isExportEmailIntent,
  normalizeAmountInput,
  shouldPreferQuestionFlow,
} from "./aiIntentParser.js";

test("identifies only export and email intents for client-side execution", () => {
  assert.equal(isExportEmailIntent("EXPORT_EXCEL_EXPENSE"), true);
  assert.equal(isExportEmailIntent("EXPORT_EXCEL_INCOME"), true);
  assert.equal(isExportEmailIntent("EMAIL_EXPENSE_REPORT"), true);
  assert.equal(isExportEmailIntent("EMAIL_INCOME_REPORT"), true);

  assert.equal(isExportEmailIntent("CREATE_EXPENSE"), false);
  assert.equal(isExportEmailIntent("CREATE_INCOME"), false);
  assert.equal(isExportEmailIntent("CREATE_JAR"), false);
  assert.equal(isExportEmailIntent("TRANSFER_JAR"), false);
  assert.equal(isExportEmailIntent(null), false);
});

test("keeps broad ACTION intent classification separate from export/email handling", () => {
  assert.equal(isActionIntent("CREATE_EXPENSE", "ACTION"), true);
  assert.equal(isExportEmailIntent("CREATE_EXPENSE"), false);
});

test("normalizes shorthand amount inputs before sending to the backend", () => {
  assert.equal(normalizeAmountInput("80k"), 80000);
  assert.equal(normalizeAmountInput("1.5tr"), 1500000);
  assert.equal(normalizeAmountInput("2M"), 2000000);
  assert.equal(normalizeAmountInput("150 nghìn"), 150000);
  assert.equal(normalizeAmountInput("50000"), 50000);
  assert.equal(normalizeAmountInput(""), "");
});

test("detects explicit action verbs separately from short lookup prompts", () => {
  assert.equal(hasExplicitActionVerb("thêm thu nhập lương tháng này 15 triệu hôm nay"), true);
  assert.equal(hasExplicitActionVerb("thu nhập tháng này"), false);
});

test("treats short finance lookups with time ranges as questions", () => {
  assert.equal(isLikelyFinancialQuestion("thu nhập tháng này"), true);
  assert.equal(isLikelyFinancialQuestion("tổng thu nhập tháng này là bao nhiêu"), true);
  assert.equal(isLikelyFinancialQuestion("Chi tiêu hôm nay là bao nhiêu?"), true);
  assert.equal(isLikelyFinancialQuestion("Lương tháng trước của tôi thế nào?"), true);
  assert.equal(isLikelyFinancialQuestion("Ngân sách tuần này còn bao nhiêu?"), true);
  assert.equal(isLikelyFinancialQuestion("Tháng này tôi kiếm được bao nhiêu?"), true);
  assert.equal(isLikelyFinancialQuestion("Hôm nay tiêu hết bao nhiêu rồi?"), true);
  assert.equal(isLikelyFinancialQuestion("Còn dư ngân sách không?"), true);
  assert.equal(isLikelyFinancialQuestion("thêm thu nhập tháng này 15 triệu hôm nay"), false);
});

test("prefers the question flow when an action intent conflicts with a lookup prompt", () => {
  assert.equal(shouldPreferQuestionFlow("CREATE_INCOME", "ACTION", "thu nhập tháng này"), true);
  assert.equal(
    shouldPreferQuestionFlow("CREATE_INCOME", "ACTION", "thêm thu nhập lương tháng này 15 triệu hôm nay"),
    false
  );
  assert.equal(shouldPreferQuestionFlow("ANSWER_QUESTION", "QUESTION", "thu nhập tháng này"), false);
});
