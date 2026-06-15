import { getMonthFilterValue } from "./dateInput.js";

const MONTH_VALUE_PATTERN = /^(\d{4})-(\d{2})$/;

export const normalizeIncomeMonthValue = (value) => {
  if (!value) return "";

  const normalizedValue = String(value).trim();
  const monthMatch = normalizedValue.match(MONTH_VALUE_PATTERN);
  if (monthMatch) {
    const month = Number(monthMatch[2]);
    return month >= 1 && month <= 12 ? normalizedValue : "";
  }

  return getMonthFilterValue(normalizedValue);
};

export const buildIncomeListUrl = (baseEndpoint, { filterType, selectedMonth } = {}) => {
  if (filterType === "all") return `${baseEndpoint}?all=true`;
  if (filterType !== "specific") return baseEndpoint;

  const monthValue = normalizeIncomeMonthValue(selectedMonth);
  if (!monthValue) return null;

  const [year, month] = monthValue.split("-");
  return `${baseEndpoint}?month=${month}&year=${year}`;
};

export const buildIncomeReportPayload = ({ filterType, selectedMonth, fallbackDate = new Date() } = {}) => {
  if (filterType === "specific") {
    const monthValue = normalizeIncomeMonthValue(selectedMonth);
    if (monthValue) {
      const [year, month] = monthValue.split("-");
      return { month: Number(month), year: Number(year) };
    }
  }

  return {
    month: fallbackDate.getMonth() + 1,
    year: fallbackDate.getFullYear(),
  };
};
