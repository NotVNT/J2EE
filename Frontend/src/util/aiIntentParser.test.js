import test from "node:test";
import assert from "node:assert/strict";
import {
  isActionIntent,
  isExportEmailIntent,
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
