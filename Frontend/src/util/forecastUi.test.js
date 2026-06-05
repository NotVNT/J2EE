import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCategoryChipOptions,
  buildCategoryTrendChartData,
  getForecastSummary,
} from "./forecastUi.js";

const monthlyForecast = {
  year: 2026,
  month: 7,
  categories: [
    { categoryId: 1, categoryName: "Food", predictedAmount: 1200000, historicalAverage: 900000, trend: "UP" },
    { categoryId: 2, categoryName: "Transport", predictedAmount: 500000, historicalAverage: 550000, trend: "DOWN" },
  ],
};

test("getForecastSummary totals predicted expense and finds the strongest increase", () => {
  const summary = getForecastSummary(monthlyForecast, [{ id: 1 }, { id: 2 }]);

  assert.equal(summary.totalPredicted, 1700000);
  assert.equal(summary.anomalyCount, 2);
  assert.deepEqual(summary.strongestIncrease, monthlyForecast.categories[0]);
});

test("buildCategoryChipOptions includes the all chip and forecast categories", () => {
  assert.deepEqual(buildCategoryChipOptions(monthlyForecast), [
    { id: "all", label: "Tất cả" },
    { id: "1", label: "Food" },
    { id: "2", label: "Transport" },
  ]);
});

test("buildCategoryTrendChartData connects last actual point to forecast point", () => {
  const chartData = buildCategoryTrendChartData({
    trend: {
      dataPoints: [
        { yearMonth: "2026-05", actual: 300000 },
        { yearMonth: "2026-06", actual: 450000 },
      ],
    },
    selectedForecast: monthlyForecast.categories[0],
    targetLabel: "07/2026",
  });

  assert.deepEqual(chartData, [
    { label: "05/2026", actual: 300000, predicted: null },
    { label: "06/2026", actual: 450000, predicted: 450000 },
    { label: "07/2026", actual: null, predicted: 1200000 },
  ]);
});
