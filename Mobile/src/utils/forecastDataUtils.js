import i18n from "i18next";

export function getMonthLabel(index) {
  return i18n.t(`forecastComponents.month${index + 1}`);
}

export function getShortMonthLabel(index) {
  return i18n.t(`forecastComponents.shortMonth${index + 1}`);
}

export function getForecastRequestKey(year, month, extra = "") {
  return extra ? `${year}-${month}-${extra}` : `${year}-${month}`;
}

export function buildMonthOptions(currentYear, currentMonth) {
  const options = [];
  for (let offset = 0; offset <= 6; offset += 1) {
    const date = new Date(currentYear, currentMonth - 1 + offset, 1);
    options.push({
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      label: `${getMonthLabel(date.getMonth())} ${date.getFullYear()}`
    });
  }
  return options;
}

export function getMonthPickerState({ currentMonth, currentYear, selectedMonth, selectedYear }) {
  const nextMonthDate = new Date(currentYear, currentMonth, 1);
  const isNextMonthSelected =
    selectedMonth === nextMonthDate.getMonth() + 1 &&
    selectedYear === nextMonthDate.getFullYear();

  return {
    isNextMonthSelected,
    monthPickerLabel: `${getMonthLabel(selectedMonth - 1)} ${selectedYear}`,
    monthPickerHint: isNextMonthSelected
      ? i18n.t("forecastComponents.forecastNextMonth")
      : i18n.t("forecastComponents.forecastForMonth", { month: selectedMonth, year: selectedYear })
  };
}

export function getTopGrowthCategory(categories) {
  if (categories.length === 0) return null;

  return (
    [...categories]
      .filter((category) => category?.trend === "UP")
      .sort(
        (a, b) =>
          Number(b?.predictedAmount || 0) - Number(a?.predictedAmount || 0)
      )[0] || null
  );
}

export function buildForecastBarChartData(categories) {
  if (categories.length === 0) return null;

  const displayCategories = categories.slice(0, Math.min(categories.length, 8));
  return {
    labels: displayCategories.map((category) => {
      const name = category?.categoryName || "";
      return name.length > 6 ? `${name.slice(0, 5)}…` : name;
    }),
    datasets: [
      {
        data: displayCategories.map((category) => Number(category?.predictedAmount || 0)),
        color: (opacity = 1) => `rgba(232, 89, 122, ${opacity})`
      },
      {
        data: displayCategories.map((category) => Number(category?.historicalAverage || 0)),
        color: (opacity = 1) => `rgba(107, 155, 210, ${opacity})`
      }
    ]
  };
}

export function buildTrendLineChartData(categoryTrend) {
  const points = categoryTrend?.dataPoints || [];
  if (points.length === 0) return null;

  return {
    labels: points.map((point) => {
      const parts = (point?.yearMonth || "").split("-");
      const month = parseInt(parts[1] || "0", 10);
      return month >= 1 && month <= 12 ? getShortMonthLabel(month - 1) : "";
    }),
    datasets: [
      {
        data: points.map((point) => Number(point?.actual || 0)),
        color: (opacity = 1) => `rgba(232, 89, 122, ${opacity})`,
        strokeWidth: 2
      }
    ]
  };
}
