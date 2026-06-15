export const INTENT_TYPES = {
  CREATE_CATEGORY: "CREATE_CATEGORY",
  UPDATE_CATEGORY: "UPDATE_CATEGORY",
  DELETE_CATEGORY: "DELETE_CATEGORY",
  CREATE_EXPENSE: "CREATE_EXPENSE",
  UPDATE_EXPENSE: "UPDATE_EXPENSE",
  DELETE_EXPENSE: "DELETE_EXPENSE",
  CREATE_INCOME: "CREATE_INCOME",
  UPDATE_INCOME: "UPDATE_INCOME",
  DELETE_INCOME: "DELETE_INCOME",
  CREATE_BUDGET: "CREATE_BUDGET",
  UPDATE_BUDGET: "UPDATE_BUDGET",
  DELETE_BUDGET: "DELETE_BUDGET",
  CREATE_SAVING_GOAL: "CREATE_SAVING_GOAL",
  UPDATE_SAVING_GOAL: "UPDATE_SAVING_GOAL",
  DELETE_SAVING_GOAL: "DELETE_SAVING_GOAL",
  CREATE_JAR: "CREATE_JAR",
  UPDATE_JAR: "UPDATE_JAR",
  DELETE_JAR: "DELETE_JAR",
  TRANSFER_JAR: "TRANSFER_JAR",
  EXPORT_EXCEL_INCOME: "EXPORT_EXCEL_INCOME",
  EXPORT_EXCEL_EXPENSE: "EXPORT_EXCEL_EXPENSE",
  EMAIL_INCOME_REPORT: "EMAIL_INCOME_REPORT",
  EMAIL_EXPENSE_REPORT: "EMAIL_EXPENSE_REPORT",
  ANSWER_QUESTION: "ANSWER_QUESTION",
  INVALID_REQUEST: "INVALID_REQUEST"
};

export const INTENT_LABELS = {
  CREATE_CATEGORY: "Tạo danh mục",
  UPDATE_CATEGORY: "Sửa danh mục",
  DELETE_CATEGORY: "Xóa danh mục",
  CREATE_EXPENSE: "Tạo chi tiêu",
  UPDATE_EXPENSE: "Sửa chi tiêu",
  DELETE_EXPENSE: "Xóa chi tiêu",
  CREATE_INCOME: "Tạo thu nhập",
  UPDATE_INCOME: "Sửa thu nhập",
  DELETE_INCOME: "Xóa thu nhập",
  CREATE_BUDGET: "Tạo ngân sách",
  UPDATE_BUDGET: "Sửa ngân sách",
  DELETE_BUDGET: "Xóa ngân sách",
  CREATE_SAVING_GOAL: "Tạo mục tiêu",
  UPDATE_SAVING_GOAL: "Sửa mục tiêu",
  DELETE_SAVING_GOAL: "Xóa mục tiêu",
  CREATE_JAR: "Tạo hũ tiền",
  UPDATE_JAR: "Sửa hũ tiền",
  DELETE_JAR: "Xóa hũ tiền",
  TRANSFER_JAR: "Chuyển tiền giữa hũ",
  EXPORT_EXCEL_INCOME: "Xuất Excel thu nhập",
  EXPORT_EXCEL_EXPENSE: "Xuất Excel chi tiêu",
  EMAIL_INCOME_REPORT: "Gửi email báo cáo thu nhập",
  EMAIL_EXPENSE_REPORT: "Gửi email báo cáo chi tiêu",
  ANSWER_QUESTION: "Trả lời câu hỏi",
  INVALID_REQUEST: "Yêu cầu không hợp lệ"
};

export const getIntentLabel = (intentType, t) => {
  const translatedLabel = typeof t === "function" ? t(`ai.intentLabels.${intentType}`) : null;
  return translatedLabel && translatedLabel !== `ai.intentLabels.${intentType}`
    ? translatedLabel
    : INTENT_LABELS[intentType] || intentType;
};

export const INTENT_ICONS = {
  CREATE_CATEGORY: "📁",
  UPDATE_CATEGORY: "✏️",
  DELETE_CATEGORY: "🗑️",
  CREATE_EXPENSE: "💸",
  UPDATE_EXPENSE: "✏️",
  DELETE_EXPENSE: "🗑️",
  CREATE_INCOME: "💰",
  UPDATE_INCOME: "✏️",
  DELETE_INCOME: "🗑️",
  CREATE_BUDGET: "📊",
  UPDATE_BUDGET: "✏️",
  DELETE_BUDGET: "🗑️",
  CREATE_SAVING_GOAL: "🎯",
  UPDATE_SAVING_GOAL: "✏️",
  DELETE_SAVING_GOAL: "🗑️",
  CREATE_JAR: "🏦",
  UPDATE_JAR: "✏️",
  DELETE_JAR: "🗑️",
  TRANSFER_JAR: "↔️",
  EXPORT_EXCEL_INCOME: "📥",
  EXPORT_EXCEL_EXPENSE: "📥",
  EMAIL_INCOME_REPORT: "📧",
  EMAIL_EXPENSE_REPORT: "📧",
  ANSWER_QUESTION: "💬",
  INVALID_REQUEST: "⚠️"
};

export const parseIntentResponse = (response) => {
  if (!response) return { intent: INTENT_TYPES.INVALID_REQUEST, intentType: 'INVALID', extractedFields: {}, missingFields: [], confidence: null };

  const intent = response.intent;
  if (!intent || !INTENT_TYPES[intent]) {
    return { intent: INTENT_TYPES.INVALID_REQUEST, intentType: 'INVALID', extractedFields: {}, missingFields: [], confidence: null };
  }

  // Derive intentType from the response or fall back to intent-name heuristic
  const intentType = response.intentType ||
    (intent === 'ANSWER_QUESTION' ? 'QUESTION' :
     intent === 'INVALID_REQUEST' ? 'INVALID' : 'ACTION');

  return {
    intent,
    intentType,
    extractedFields: response.extractedFields || {},
    suggestedValues: response.suggestedValues || {},
    validationErrors: response.validationErrors || [],
    missingFields: response.missingFields || [],
    confirmationPrompt: response.confirmationPrompt || '',
    answer: response.answer || '',
    confidence: response.confidence ?? null
  };
};

export const isCrudIntent = (intent) => {
  return intent && (
    intent.startsWith('CREATE_') ||
    intent.startsWith('UPDATE_') ||
    intent.startsWith('DELETE_') ||
    intent.startsWith('TRANSFER_')
  );
};

/**
 * Returns true if this is an ACTION-type intent (CRUD, export, email).
 * Prefer using intentType from parseIntentResponse if available.
 */
export const isActionIntent = (intent, intentType) => {
  // Use intentType if provided (new schema)
  if (intentType) return intentType === 'ACTION';
  // Fallback: prefix-based check
  return intent && (
    intent.startsWith('CREATE_') ||
    intent.startsWith('UPDATE_') ||
    intent.startsWith('DELETE_') ||
    intent.startsWith('TRANSFER_') ||
    intent.startsWith('EXPORT_') ||
    intent.startsWith('EMAIL_')
  );
};

/**
 * Returns true only for export/email action intents.
 * These are handled client-side without calling the confirm-action backend.
 */
export const isExportEmailIntent = (intent) => {
  return Boolean(intent && (
    intent.startsWith('EXPORT_') ||
    intent.startsWith('EMAIL_')
  ));
};

const normalizeIntentMessage = (message) => String(message || "")
  .normalize("NFD")
  .replace(/\p{Diacritic}/gu, "")
  .replace(/đ/giu, "d")
  .toLowerCase()
  .replace(/\s+/g, " ")
  .trim();

/**
 * BUG-04 + BUG-05: Normalize "là" between category/keyword and amount.
 * "lương là 5000000" → "lương 5000000"
 * "tháng 6 là 8000000" → "tháng 6 8000000"
 * This prevents "là" from breaking category resolution and month detection.
 */
const normalizeIsParticle = (message) =>
  String(message || "").replace(/\s+là\s+(\d)/gi, " $1");

const ACTION_PHRASES = [
  "cap nhat",
  "ghi nhan",
  "gui qua email",
  "gui qua mail",
  "gui email",
  "gui mail",
  "goi qua email",
  "goi qua mail",
  "goi email",
  "goi mail",
  "gui bao cao",
  "goi bao cao",
];

const ACTION_WORD_PATTERN = /\b(them|tao|ghi|nap|xoa|bo|huy|sua|chinh|doi|update|xuat|tai|download|export|chuyen|transfer|add|delete|remove|gui|goi)\b/i;
const QUESTION_HINT_PATTERN = /\b(bao nhieu|tong|thong ke|liet ke|xem|cho biet|hien|tom tat|phan tich|bao cao|tinh hinh|dong tien|tra cuu|the nao|con bao nhieu|con du|het bao nhieu|kiem duoc)\b/i;
const FINANCIAL_DOMAIN_PATTERN = /\b(thu nhap|luong|income|chi tieu|expense|ngan sach|budget|tiet kiem|saving|muc tieu|goal|hu|jar|so du|tieu|kiem duoc)\b/i;
// BUG-05: Added tháng [1-12] pattern to detect specific months (not just tháng này/trước)
const TIME_RANGE_PATTERN = /\b(hom nay|hom qua|tuan nay|tuan qua|tuan truoc|thang nay|thang qua|thang truoc|thang\s*(?:1[0-2]|[1-9])|quy nay|quy truoc|nam nay|nam truoc|gan day)\b/i;
// BUG-05 fix: bare numbers without a unit must be ≥4 digits (≥1000) to qualify as an amount,
// so that the month number in "tháng 6" (a single digit) is not falsely treated as an amount.
const AMOUNT_PATTERN = /\b\d+(?:[.,]\d+)?\s*(?:k|nghin|ngan|tr|trieu|m|cu|dong)\b|\b\d{4,}(?:[.,]\d+)?\b/i;

// BUG-07: Patterns to distinguish email report types
const EMAIL_INCOME_PATTERN = /\b(thu nhap|luong|income)\b/i;
const EMAIL_EXPENSE_PATTERN = /\b(chi tieu|chi phi|expense)\b/i;

export const hasExplicitActionVerb = (message) => {
  // BUG-04+05: Strip "là" before amount so "lương là 5tr" → "lương 5tr" does not confuse parsing
  const normalizedMessage = normalizeIntentMessage(normalizeIsParticle(message));

  if (!normalizedMessage) {
    return false;
  }

  if (ACTION_WORD_PATTERN.test(normalizedMessage)) {
    return true;
  }

  return ACTION_PHRASES.some((phrase) => normalizedMessage.includes(phrase));
};

export const isLikelyFinancialQuestion = (message) => {
  // BUG-04+05: Strip "là" before amount so month+amount combos are not misread as question context
  const normalizedMessage = normalizeIntentMessage(normalizeIsParticle(message));

  if (!normalizedMessage || !FINANCIAL_DOMAIN_PATTERN.test(normalizedMessage)) {
    return false;
  }

  if (hasExplicitActionVerb(normalizedMessage)) {
    return false;
  }

  if (QUESTION_HINT_PATTERN.test(normalizedMessage)) {
    return true;
  }

  const hasTimeRange = TIME_RANGE_PATTERN.test(normalizedMessage);
  const hasAmount = AMOUNT_PATTERN.test(normalizedMessage);

  // BUG-05: "tháng 6 là 8000000" → after normalization becomes "tháng 6 8000000"
  // hasAmount=true → not a question → returns false (correct: route to agent)
  return hasTimeRange && !hasAmount;
};

/**
 * BUG-07: Discriminate email report intent by checking for income/expense keywords in the message.
 * Returns "EMAIL_INCOME_REPORT", "EMAIL_EXPENSE_REPORT", or null (use default/page-context logic).
 */
export const discriminateEmailReportIntent = (message) => {
  const normalized = normalizeIntentMessage(message);
  const hasIncome = EMAIL_INCOME_PATTERN.test(normalized);
  const hasExpense = EMAIL_EXPENSE_PATTERN.test(normalized);
  // Income keyword wins if both present (rare), otherwise use whichever matches
  if (hasIncome && !hasExpense) return "EMAIL_INCOME_REPORT";
  if (hasExpense && !hasIncome) return "EMAIL_EXPENSE_REPORT";
  return null; // ambiguous — caller falls back to page context / model classification
};

export const shouldPreferQuestionFlow = (intent, intentType, message) => {
  if (isExportEmailIntent(intent)) return false;
  return isActionIntent(intent, intentType) && isLikelyFinancialQuestion(message);
};

export const normalizeAmountInput = (value) => {
  if (value === null || value === undefined || value === "") {
    return value;
  }

  const rawValue = String(value).trim();
  if (!rawValue) {
    return value;
  }

  const normalizedValue = rawValue
    .replace(/đ/giu, "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

  const compactValue = normalizedValue.replace(/\s+/g, "");
  const parseShorthandNumber = (numericPart) => Number.parseFloat(numericPart.replace(",", "."));

  const thousandMatch = compactValue.match(/^(\d+(?:[.,]\d+)?)k$/i);
  if (thousandMatch) {
    return Math.round(parseShorthandNumber(thousandMatch[1]) * 1000);
  }

  const millionMatch = compactValue.match(/^(\d+(?:[.,]\d+)?)(tr|trieu|m)$/i);
  if (millionMatch) {
    return Math.round(parseShorthandNumber(millionMatch[1]) * 1000000);
  }

  const nghinMatch = compactValue.match(/^(\d+(?:[.,]\d+)?)(nghin|ngan)$/i);
  if (nghinMatch) {
    return Math.round(parseShorthandNumber(nghinMatch[1]) * 1000);
  }

  const digitsOnlyValue = normalizedValue.replace(/[.,\s]/g, "");
  if (/^\d+$/.test(digitsOnlyValue)) {
    return Math.round(Number.parseFloat(digitsOnlyValue));
  }

  return value;
};

/**
 * Client-side telemetry stubs for intent parsing quality monitoring.
 * Replace these with actual analytics calls (e.g., Mixpanel, Amplitude, or custom backend).
 */
export const clientTelemetry = {
  /**
   * Log when backend returns ANSWER_QUESTION but the message looks like an agent command.
   * This suggests either the AI or the reclassification heuristic missed the intent.
   */
  logAgentCommandFallback: (userMessage, pageContext) => {
    console.warn('[AI Telemetry] ANSWER_QUESTION fallback for probable agent command', {
      userMessage: userMessage?.substring(0, 80),
      pageContext,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Log when user cancels a confirmation dialog, indicating a possible wrong parse.
   * High cancellation rate for a given intent suggests misclassification.
   */
  logConfirmationCancelled: (intent, extractedFields) => {
    console.warn('[AI Telemetry] User cancelled confirmation — possible wrong parse', {
      intent,
      fieldKeys: Object.keys(extractedFields || {}),
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Log when an ACTION intent has missingFields, indicating incomplete extraction.
   * Frequent occurrences for the same fields point to prompt training gaps.
   */
  logMissingFields: (intent, missingFields, pageContext) => {
    if (missingFields?.length > 0) {
      console.info('[AI Telemetry] Agent intent has missing fields', {
        intent,
        missingFields,
        pageContext,
        timestamp: new Date().toISOString()
      });
    }
  },

  logQuestionFallbackOverride: (intent, userMessage, pageContext) => {
    console.warn('[AI Telemetry] ACTION intent overridden to question flow', {
      intent,
      userMessage: userMessage?.substring(0, 80),
      pageContext,
      timestamp: new Date().toISOString()
    });
  }
};

export const getFieldsForIntent = (intent) => {
  switch (intent) {
    case INTENT_TYPES.CREATE_CATEGORY:
    case INTENT_TYPES.UPDATE_CATEGORY:
      return [
        { key: "name", label: "Tên danh mục", type: "text", required: true },
        { key: "icon", label: "Icon (emoji hoặc tên icon)", type: "text", required: false },
        { key: "type", label: "Loại danh mục", type: "select", options: [{ value: "expense", label: "Chi tiêu" }, { value: "income", label: "Thu nhập" }], required: true }
      ];
    case INTENT_TYPES.CREATE_EXPENSE:
      return [
        { key: "amount", label: "Số tiền", type: "number", required: true },
        { key: "categoryName", label: "Danh mục", type: "category_select", categoryType: "expense", required: true },
        { key: "date", label: "Ngày", type: "date", required: true },
        { key: "description", label: "Mô tả", type: "text", required: false },
        { key: "jarName", label: "Hũ", type: "jar_select", required: false }
      ];
    case INTENT_TYPES.UPDATE_EXPENSE:
      return [
        { key: "amount", label: "Số tiền", type: "number", required: true },
        { key: "categoryName", label: "Danh mục", type: "category_select", categoryType: "expense", required: false },
        { key: "date", label: "Ngày", type: "date", required: false },
        { key: "description", label: "Mô tả", type: "text", required: false }
      ];
    case INTENT_TYPES.CREATE_INCOME:
      return [
        { key: "amount", label: "Số tiền", type: "number", required: true },
        { key: "categoryName", label: "Danh mục", type: "category_select", categoryType: "income", required: true },
        { key: "date", label: "Ngày", type: "date", required: true },
        { key: "description", label: "Mô tả", type: "text", required: false }
      ];
    case INTENT_TYPES.UPDATE_INCOME:
      return [
        { key: "amount", label: "Số tiền", type: "number", required: true },
        { key: "categoryName", label: "Danh mục", type: "category_select", categoryType: "income", required: false },
        { key: "date", label: "Ngày", type: "date", required: false },
        { key: "description", label: "Mô tả", type: "text", required: false }
      ];
    case INTENT_TYPES.CREATE_BUDGET:
      return [
        { key: "amount", label: "Số tiền", type: "number", required: true },
        { key: "categoryName", label: "Danh mục", type: "category_select", categoryType: "expense", required: true },
        { key: "month", label: "Tháng", type: "number", required: true },
        { key: "year", label: "Năm", type: "number", required: true }
      ];
    case INTENT_TYPES.UPDATE_BUDGET:
      return [
        { key: "amount", label: "Số tiền", type: "number", required: true },
        { key: "categoryName", label: "Danh mục", type: "category_select", categoryType: "expense", required: false }
      ];
    case INTENT_TYPES.CREATE_SAVING_GOAL:
    case INTENT_TYPES.UPDATE_SAVING_GOAL:
      return [
        { key: "name", label: "Tên mục tiêu", type: "text", required: true },
        { key: "targetAmount", label: "Số tiền mục tiêu", type: "number", required: true },
        { key: "currentAmount", label: "Số tiền hiện tại", type: "number", required: false }
      ];
    case INTENT_TYPES.CREATE_JAR:
      return [
        { key: "name", label: "Tên hũ", type: "text", required: true },
        { key: "targetPercentage", label: "Tỷ lệ phân bổ (%)", type: "number", required: false },
        { key: "icon", label: "Icon", type: "text", required: false },
        { key: "color", label: "Màu sắc", type: "text", required: false }
      ];
    case INTENT_TYPES.UPDATE_JAR:
      return [
        { key: "jarName", label: "Tên hũ hiện tại", type: "jar_select", required: true },
        { key: "name", label: "Tên mới", type: "text", required: false },
        { key: "targetPercentage", label: "Tỷ lệ phân bổ (%)", type: "number", required: false },
        { key: "icon", label: "Icon", type: "text", required: false },
        { key: "color", label: "Màu sắc", type: "text", required: false }
      ];
    case INTENT_TYPES.DELETE_JAR:
      return [
        { key: "jarName", label: "Tên hũ", type: "jar_select", required: true }
      ];
    case INTENT_TYPES.TRANSFER_JAR:
      return [
        { key: "fromJarName", label: "Hũ nguồn", type: "jar_select", required: true },
        { key: "toJarName", label: "Hũ đích", type: "jar_select", required: true },
        { key: "amount", label: "Số tiền", type: "number", required: true }
      ];
    default:
      return [];
  }
};
