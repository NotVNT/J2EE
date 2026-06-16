import { COLORS } from "../constants/colors";

export function getBudgetVisual(progressRatio, t) {
  if (progressRatio >= 1) {
    return {
      color: COLORS.EXPENSE,
      bg: COLORS.EXPENSE_LIGHT,
      border: "#fecdca",
      label: t ? t("budgetCard.overBudget") : "Vượt hạn mức"
    };
  }

  if (progressRatio >= 0.8) {
    return {
      color: COLORS.WARNING,
      bg: COLORS.WARNING_LIGHT,
      border: "#fedf89",
      label: t ? t("budgetCard.nearLimit") : "Sắp chạm hạn mức"
    };
  }

  return {
    color: COLORS.INCOME,
    bg: COLORS.INCOME_LIGHT,
    border: "#abefc6",
    label: t ? t("budgetCard.withinLimit") : "Trong giới hạn"
  };
}

export function summarizeBudgets(budgets) {
  const totalLimit = budgets.reduce((sum, item) => sum + Number(item?.amountLimit || 0), 0);
  const totalSpent = budgets.reduce((sum, item) => sum + Number(item?.totalSpent || 0), 0);
  const warningCount = budgets.filter((item) => {
    const limit = Number(item?.amountLimit || 0);
    const spent = Number(item?.totalSpent || 0);
    return limit > 0 && spent / limit >= 0.8;
  }).length;

  return { totalLimit, totalSpent, warningCount };
}
