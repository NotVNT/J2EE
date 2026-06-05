import { useState, useMemo, useCallback, useContext } from "react";
import { Alert } from "react-native";
import { AuthContext } from "../../contexts/AuthContext";

// ─── Model & provider configuration ─────────────────────

const MODELS = {
  chat: {
    gemini:     { provider: "gemini",     model: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash-Lite" },
    gptoss:     { provider: "gptoss",     model: "gpt-oss-120b", label: "GPT-OSS 120B" }
  },
  agent: {
    gemini:     { provider: "gemini",     model: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash-Lite" }
  }
};

/**
 * useModelConfig — Quản lý mode (chat/agent), model, provider và premium gating.
 *
 * Returns:
 *   activeMode
 *   activeProvider, activeModel, activeModelLabel
 *   modelLabel
 *   inputPlaceholder
 *   handleModeSwitch
 */
export default function useModelConfig() {
  const { user } = useContext(AuthContext);

  const isFreePlan    = !user?.subscriptionPlan || user?.subscriptionPlan === "FREE";
  const isPremiumPlan = user?.subscriptionPlan === "PREMIUM";

  const [activeMode, setActiveMode] = useState("chat");

  // ── Derived ────────────────────────────────────────────

  const activeParams = useMemo(() => {
    if (activeMode === "agent") {
      return MODELS.agent.gemini;
    }
    // Chat mode: PREMIUM dùng GPT-OSS 120B, BASIC/FREE dùng Gemini 3.1 Flash-Lite
    return isPremiumPlan ? MODELS.chat.gptoss : MODELS.chat.gemini;
  }, [activeMode, isPremiumPlan]);

  const inputPlaceholder = activeMode === "agent"
    ? "Tạo/sửa/xóa dữ liệu, xuất excel..."
    : "Trò chuyện, hỏi đáp tài chính...";

  // ── Handlers ───────────────────────────────────────────

  const handleModeSwitch = useCallback((mode) => {
    if (mode === activeMode) return;
    if (mode === "agent" && isFreePlan) {
      Alert.alert(
        "Yêu cầu gói BASIC trở lên",
        "Tính năng Agent của Nova Money (Tạo/sửa/xóa dữ liệu tự động) chỉ khả dụng cho gói BASIC trở lên. Vui lòng nâng cấp gói để sử dụng.",
        [{ text: "Đóng", style: "cancel" }]
      );
      return;
    }
    setActiveMode(mode);
  }, [activeMode, isFreePlan]);

  return {
    // State
    activeMode,
    // Derived
    activeProvider:   activeParams.provider,
    activeModel:      activeParams.model,
    activeModelLabel: activeParams.label,
    modelLabel:       activeParams.label,
    inputPlaceholder,
    // Permissions
    isFreePlan,
    isPremiumPlan,
    // Handlers
    handleModeSwitch,
  };
}
