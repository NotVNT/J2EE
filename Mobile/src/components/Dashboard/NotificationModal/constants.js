import {
  NOTIFICATION_CATEGORY_FILTERS,
  NOTIFICATION_READ_FILTERS
} from "../../../utils/notificationFilters";

export const READ_FILTER_OPTIONS = [
  { id: NOTIFICATION_READ_FILTERS.ALL, label: "Tất cả" },
  { id: NOTIFICATION_READ_FILTERS.UNREAD, label: "Chưa đọc" }
];

export const CATEGORY_FILTER_OPTIONS = [
  { id: NOTIFICATION_CATEGORY_FILTERS.ALL, label: "Tất cả", compactLabel: "Tất cả", icon: "notifications-outline" },
  { id: NOTIFICATION_CATEGORY_FILTERS.FINANCIAL, label: "Biến động số dư", compactLabel: "Số dư", icon: "trending-up-outline" },
  { id: NOTIFICATION_CATEGORY_FILTERS.BUDGET, label: "Ngân sách", compactLabel: "Ngân sách", icon: "shield-checkmark-outline" },
  { id: NOTIFICATION_CATEGORY_FILTERS.SYSTEM, label: "Hệ thống / Gói", compactLabel: "Hệ thống", icon: "sparkles-outline" }
];

export function formatRelativeTime(value) {
  if (!value) return "";

  const date = new Date(value);
  const time = date.getTime();
  if (!Number.isFinite(time)) return "";

  const diffMs = Date.now() - time;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return "Hôm qua";

  return `${diffDays} ngày trước`;
}

export function getTypeMeta(type, colors) {
  switch (type) {
    case "EXPENSE":
    case "BUDGET_EXCEEDED":
    case "SPENDING_ALERT":
      return { icon: "!", color: colors.EXPENSE, bg: colors.EXPENSE_LIGHT };
    case "INCOME":
    case "GOAL_PROGRESS":
      return { icon: "+", color: colors.INCOME, bg: colors.INCOME_LIGHT };
    case "BUDGET_ALERT":
    case "BUDGET_WARNING":
      return { icon: "!", color: colors.WARNING, bg: colors.WARNING_LIGHT };
    case "PAYMENT":
    case "SAVING_STREAK":
      return { icon: "✓", color: colors.PRIMARY, bg: colors.ROSE_MIST };
    case "MONTHLY_REPORT":
    case "ADMIN":
    case "SYSTEM":
    default:
      return { icon: "i", color: colors.INFO, bg: colors.INFO_LIGHT };
  }
}
