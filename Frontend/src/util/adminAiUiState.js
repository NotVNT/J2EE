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

export const buildAiUnblockConfirmMessage = (userName) =>
  `\u0042\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n m\u1edf kh\u00f3a t\u00ednh n\u0103ng AI cho ${userName || "\u006e\u0067\u01b0\u1eddi d\u00f9ng"} kh\u00f4ng?`;

export const buildAiViolationDisplay = (violation) => ({
  type: violation?.type || violation?.violationType || "UNKNOWN",
  snippet: violation?.snippet || violation?.violationReason || "Không có nội dung mẫu.",
  source: violation?.source || "Không rõ nguồn",
});
