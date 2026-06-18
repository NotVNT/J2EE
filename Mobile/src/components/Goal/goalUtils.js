import { COLORS } from "../../constants/colors";

export function getGoalVisual(goal, t) {
  const tFn = t || ((key) => key);
  const progressPercent = Number(goal?.progressPercent || 0);
  const status = String(goal?.status || "ACTIVE").toUpperCase();
  const isBehindSchedule = Boolean(goal?.isBehindSchedule);

  if (status === "COMPLETED") {
    return { color: COLORS.INCOME, bg: COLORS.INCOME_LIGHT, border: "#abefc6", label: tFn("goalUtils.completed") };
  }

  if (status === "CANCELLED") {
    return { color: COLORS.TEXT_SECONDARY, bg: COLORS.BG, border: COLORS.CARD_BORDER, label: tFn("goalUtils.cancelled") };
  }

  if (isBehindSchedule) {
    return { color: COLORS.EXPENSE, bg: COLORS.EXPENSE_LIGHT, border: "#fecdca", label: tFn("goalUtils.behindSchedule") };
  }

  if (progressPercent >= 75) {
    return { color: COLORS.INCOME, bg: COLORS.INCOME_LIGHT, border: "#abefc6", label: tFn("goalUtils.inProgress") };
  }

  if (progressPercent >= 40) {
    return { color: COLORS.WARNING, bg: COLORS.WARNING_LIGHT, border: "#fedf89", label: tFn("goalUtils.inProgress") };
  }

  return { color: COLORS.INFO, bg: COLORS.INFO_LIGHT, border: "#b2ddff", label: tFn("goalUtils.inProgress") };
}
