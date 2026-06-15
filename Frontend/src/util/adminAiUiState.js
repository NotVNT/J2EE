export const getAiViolationScoreTone = (score) => {
  if (score >= 3) {
    return "danger";
  }

  if (score >= 1) {
    return "warning";
  }

  return "safe";
};

export const isAiBlockedUser = (user) =>
  Boolean(user?.aiBlockedReason && String(user.aiBlockedReason).trim());

export const buildAiUnblockConfirmMessage = (userName, t) => {
  if (t) {
    return t("admin.unblockAiConfirmPrefix") + (userName || t("admin.defaultUser")) + t("admin.unblockAiConfirmSuffix");
  }
  return `Bạn có chắc muốn mở khóa tính năng AI cho ${userName || "người dùng"} không?`;
};

export const buildAiViolationDisplay = (violation) => ({
  type: violation?.type || violation?.violationType || "UNKNOWN",
  snippet: violation?.snippet || violation?.violationReason || "Không có nội dung mẫu.",
  source: violation?.source || "Không rõ nguồn",
});
