import { useState, useCallback } from "react";
import axiosConfig from "../util/axiosConfig.jsx";

const AI_PARSE_INTENT = "/ai/parse-intent";
const AI_CONFIRM_ACTION = "/ai/confirm-action";
const AI_PAGE_CONTEXT = "/ai/page-context";

export const useAIChat = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const parseIntent = useCallback(async (message, pageContext, conversationHistory) => {
    setIsProcessing(true);
    setError(null);
    try {
      const { data } = await axiosConfig.post(AI_PARSE_INTENT, {
        userMessage: message,
        pageContext,
        conversationHistory: (conversationHistory || []).slice(-10)
      });
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Không thể phân tích yêu cầu. Vui lòng thử lại.";
      setError(errorMsg);
      return { intent: "INVALID_REQUEST", extractedFields: {}, validationErrors: [errorMsg] };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const confirmAction = useCallback(async (intent, confirmedData) => {
    setIsProcessing(true);
    setError(null);
    try {
      const { data } = await axiosConfig.post(AI_CONFIRM_ACTION, {
        intent,
        extractedData: confirmedData
      });
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Không thể thực hiện thao tác. Vui lòng thử lại.";
      setError(errorMsg);
      return { status: "ERROR", message: errorMsg };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const getPageContext = useCallback(async (page) => {
    try {
      const { data } = await axiosConfig.get(`${AI_PAGE_CONTEXT}?page=${page}`);
      return data;
    } catch {
      return null;
    }
  }, []);

  return {
    parseIntent,
    confirmAction,
    getPageContext,
    isProcessing,
    error,
    clearError: () => setError(null)
  };
};
