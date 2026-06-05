import test from "node:test";
import assert from "node:assert/strict";
import {
  buildIncomeListUrl,
  buildIncomeReportPayload,
  normalizeIncomeMonthValue,
} from "./incomeFilters.js";

test("buildIncomeListUrl keeps all-income behavior explicit", () => {
  assert.equal(buildIncomeListUrl("/incomes", { filterType: "all" }), "/incomes?all=true");
});

test("buildIncomeListUrl uses backend default for current month", () => {
  assert.equal(buildIncomeListUrl("/incomes", { filterType: "current" }), "/incomes");
});

test("buildIncomeListUrl builds month and year params for a selected month", () => {
  assert.equal(
    buildIncomeListUrl("/incomes", { filterType: "specific", selectedMonth: "2026-05" }),
    "/incomes?month=05&year=2026"
  );
});

test("buildIncomeListUrl returns null when a specific month is missing", () => {
  assert.equal(buildIncomeListUrl("/incomes", { filterType: "specific", selectedMonth: "" }), null);
});

test("normalizeIncomeMonthValue accepts month and date values", () => {
  assert.equal(normalizeIncomeMonthValue("2026-05"), "2026-05");
  assert.equal(normalizeIncomeMonthValue("2026-05-30"), "2026-05");
});

test("buildIncomeReportPayload uses selected month only for specific filter", () => {
  const fallbackDate = new Date(2026, 5, 5);

  assert.deepEqual(
    buildIncomeReportPayload({ filterType: "specific", selectedMonth: "2026-05", fallbackDate }),
    { month: 5, year: 2026 }
  );
  assert.deepEqual(
    buildIncomeReportPayload({ filterType: "all", selectedMonth: "2026-05", fallbackDate }),
    { month: 6, year: 2026 }
  );
});
