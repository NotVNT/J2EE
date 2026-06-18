import { useTranslation } from "react-i18next";
import apiClient from "../../services/apiClient";
import { API_ENDPOINTS } from "../../constants/api";

const ACTION_CONFIG = (t) => ({
  EXPORT_EXCEL_INCOME: {
    endpoint: API_ENDPOINTS.INCOME_EXCEL_DOWNLOAD,
    message: t("chatbot.exportIncome")
  },
  EXPORT_EXCEL_EXPENSE: {
    endpoint: API_ENDPOINTS.EXPENSE_EXCEL_DOWNLOAD,
    message: t("chatbot.exportExpense")
  },
  EMAIL_INCOME_REPORT: {
    endpoint: API_ENDPOINTS.EMAIL_INCOME,
    message: t("chatbot.emailIncome")
  },
  EMAIL_EXPENSE_REPORT: {
    endpoint: API_ENDPOINTS.EMAIL_EXPENSE,
    message: t("chatbot.emailExpense")
  }
});

export async function executeExportAction(intent, t) {
  const config = ACTION_CONFIG(t)[intent];
  if (!config) {
    throw new Error(t("chatbot.unknownAction"));
  }

  await apiClient.get(config.endpoint);
  return config.message;
}
