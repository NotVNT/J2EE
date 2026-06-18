import { COLORS } from "../../constants/colors";
import i18n from "i18next";

export function formatInsightMoney(value) {
  try {
    return new Intl.NumberFormat(i18n.language || "vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  } catch {
    return `${value || 0} VND`;
  }
}

export function getTrendText(trend) {
  if (trend === "UP") return i18n.t("aiInsight.trendUp");
  if (trend === "DOWN") return i18n.t("aiInsight.trendDown");
  return i18n.t("aiInsight.trendStable");
}

export function getTrendColor(trend) {
  if (trend === "UP") return COLORS.EXPENSE;
  if (trend === "DOWN") return COLORS.INCOME;
  return COLORS.INFO;
}
