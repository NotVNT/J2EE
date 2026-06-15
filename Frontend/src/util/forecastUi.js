const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatYearMonthLabel = (yearMonth) => {
  const [year, month] = String(yearMonth || "").split("-");
  if (!year || !month) return String(yearMonth || "");
  return `${month}/${year}`;
};

export const getForecastSummary = (monthlyForecast, anomalies = []) => {
  const categories = monthlyForecast?.categories || [];
  const totalPredicted = categories.reduce(
    (sum, category) => sum + toNumber(category.predictedAmount),
    0
  );

  const strongestIncrease = categories
    .filter((category) => category.trend === "UP")
    .sort((left, right) => {
      const leftIncrease = toNumber(left.predictedAmount) - toNumber(left.historicalAverage);
      const rightIncrease = toNumber(right.predictedAmount) - toNumber(right.historicalAverage);
      return rightIncrease - leftIncrease;
    })[0] || null;

  return {
    totalPredicted,
    strongestIncrease,
    anomalyCount: anomalies.length,
  };
};

export const buildCategoryChipOptions = (monthlyForecast) => [
  { id: "all", label: "Tất cả" },
  ...(monthlyForecast?.categories || []).map((category) => ({
    id: String(category.categoryId),
    label: category.categoryName,
  })),
];

export const buildCategoryTrendChartData = ({ trend, selectedForecast, targetLabel }) => {
  const dataPoints = trend?.dataPoints || [];
  const chartData = dataPoints.map((point) => ({
    label: formatYearMonthLabel(point.yearMonth),
    actual: toNumber(point.actual),
    predicted: null,
  }));

  if (chartData.length > 0) {
    chartData[chartData.length - 1] = {
      ...chartData[chartData.length - 1],
      predicted: chartData[chartData.length - 1].actual,
    };
  }

  if (selectedForecast && targetLabel) {
    chartData.push({
      label: targetLabel,
      actual: null,
      predicted: toNumber(selectedForecast.predictedAmount),
    });
  }

  return chartData;
};
