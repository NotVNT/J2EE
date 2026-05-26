import { useContext, useState, useEffect, useRef, useCallback } from "react";
import { AppContext } from "../context/AppContext.jsx";
import { useRouteContext } from "../context/RouteContext.jsx";
import ChatSidebar from "../components/ChatSidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import { useUser } from "../hooks/useUser.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import ExperimentalWarningModal from "../components/ExperimentalWarningModal.jsx";
import { parseIntentResponse, isCrudIntent, isActionIntent } from "../util/aiIntentParser.js";

const AGENT_MODEL_OPTIONS = [
  { value: "gemini", label: "Gemini Flash", description: "Phản hồi nhanh, tiết kiệm", icon: "🤖" },
];

const buildHistory = (msgs) =>
  msgs
    .filter((m) => !m.isSystem && !m.isIntent && !m.isConfirmation)
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.content }))
    .slice(-20);

const AIChat = () => {
  useUser();
  const { user } = useContext(AppContext);
  const { currentPage } = useRouteContext();

  // Plan-based flags
  const isFreePlan  = !user?.subscriptionPlan || user?.subscriptionPlan === "FREE";
  const isPremiumPlan = user?.subscriptionPlan === "PREMIUM";

  // Sessions
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const messagesEndRef = useRef(null);
  const fetchSessionsTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Model / provider state
  const [selectedProvider, setProvider] = useState("gptoss");
  const [agentModel, setAgentModel] = useState("gemini");
  const [showExperimentalWarning, setShowExperimentalWarning] = useState(false);
  const [pendingAgentModel, setPendingAgentModel] = useState(null);

  // Intent handling state
  const [isProcessingCrud, setIsProcessingCrud] = useState(false);
  const [pendingIntent, setPendingIntent] = useState(null);

  // Sync model defaults when plan changes
  useEffect(() => {
    if (isPremiumPlan) {
      setAgentModel("gemini");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.subscriptionPlan]);

  // Sessions fetching
  const fetchSessions = useCallback(async () => {
    try {
      const { data } = await axiosConfig.get(API_ENDPOINTS.AI_CHAT_SESSIONS);
      setSessions(data);
    } catch {
      setSessions([]);
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  const debouncedFetchSessions = useCallback(() => {
    if (fetchSessionsTimerRef.current) clearTimeout(fetchSessionsTimerRef.current);
    fetchSessionsTimerRef.current = setTimeout(() => fetchSessions(), 2000);
  }, [fetchSessions]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);



  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Resolve active provider / model / label
  const resolveModel = () => {
    if (selectedProvider === "gemini") {
      // Agent mode — luôn dùng Gemini
      return {
        activeProvider: "gemini",
        activeModel: "gemini-3.1-flash-lite",
        activeModelLabel: "Gemini 3.1 Flash Lite",
      };
    }
    // Chat mode — luôn dùng GPT-OSS
    return {
      activeProvider: "gptoss",
      activeModel: "gpt-oss-120b",
      activeModelLabel: "GPT-OSS 120B",
    };
  };

  const handleSendMessage = async (text) => {
    const trimmedMessage = text.trim();
    if (!trimmedMessage || isSending) return;

    if (pendingIntent) {
      setMessages((prev) => [
        ...prev,
        {
          id: `system-warn-${Date.now()}`,
          role: "assistant",
          content: "⚠️ Vui lòng xác nhận hoặc hủy thao tác hiện tại trước khi gửi lệnh mới.",
          isSystem: true
        }
      ]);
      return;
    }

    setIsSending(true);

    const { activeProvider, activeModel, activeModelLabel } = resolveModel();

    const userMsg = { 
      id: `user-${Date.now()}`, 
      role: "user", 
      content: trimmedMessage,
      provider: activeProvider,
      model: activeModel,
      modelLabel: activeModelLabel,
      timestamp: new Date().toISOString() 
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    try {
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      const conversationHistory = buildHistory(updatedMessages);

      if (selectedProvider === "gptoss") {
        const { data } = await axiosConfig.post(API_ENDPOINTS.AI_CHAT, {
          provider: activeProvider,
          model: activeModel,
          sessionId: activeSessionId,
          saveHistory: true,
          messages: conversationHistory,
        }, { signal });

        setMessages(prev => [...prev, {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.reply || "Tôi đã nhận câu hỏi nhưng hiện chưa tạo được câu trả lời phù hợp.",
          provider: data.provider || activeProvider,
          modelUsed: data.modelUsed,
          modelLabel: activeModelLabel,
          timestamp: new Date().toISOString(),
        }]);

        if (data.sessionId && !activeSessionId) {
          setActiveSessionId(data.sessionId);
        }
        debouncedFetchSessions();
        setIsSending(false);
        return;
      }

      // Intent Parsing logic for Agent mode
      const intentResponse = await axiosConfig.post(API_ENDPOINTS.AI_PARSE_INTENT, {
        provider: activeProvider,
        model: activeModel,
        sessionId: activeSessionId,
        userMessage: trimmedMessage,
        pageContext: currentPage || "dashboard",
        conversationHistory
      }, { signal });

      const parsed = parseIntentResponse(intentResponse.data);

      if (intentResponse.data?.sessionId && !activeSessionId) {
        setActiveSessionId(intentResponse.data.sessionId);
      }

      if (isCrudIntent(parsed.intent) || isActionIntent(parsed.intent)) {
        setPendingIntent(parsed);
        setMessages((prev) => [
          ...prev,
          {
            id: `intent-${Date.now()}`,
            role: "assistant",
            isIntent: true,
            intent: parsed.intent,
            extractedFields: parsed.extractedFields,
            suggestedValues: parsed.suggestedValues,
            confirmationPrompt: parsed.confirmationPrompt
          }
        ]);
      } else if (parsed.intent === "ANSWER_QUESTION") {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: parsed.answer || intentResponse.data?.reply || "Tôi đã nhận câu hỏi nhưng chưa tạo được câu trả lời phù hợp.",
            provider: activeProvider,
            modelUsed: intentResponse.data?.modelUsed,
            modelLabel: activeModelLabel
          }
        ]);
      } else if (parsed.intent === "INVALID_REQUEST") {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-error-${Date.now()}`,
            role: "assistant",
            content: parsed.validationErrors?.[0] || "Yêu cầu không hợp lệ hoặc ngoài phạm vi hỗ trợ.",
            isError: true,
            provider: activeProvider
          }
        ]);
      } else {
        const { data } = await axiosConfig.post(API_ENDPOINTS.AI_CHAT, {
          provider: activeProvider,
          model: activeModel,
          sessionId: activeSessionId,
          saveHistory: true,
          messages: conversationHistory,
        }, { signal });
        
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: data.reply || "Tôi đã nhận câu hỏi nhưng hiện chưa tạo được câu trả lời phù hợp.",
            provider: data.provider || activeProvider,
            modelUsed: data.modelUsed,
            modelLabel: activeModelLabel
          }
        ]);
        
        if (data.sessionId && !activeSessionId) {
          setActiveSessionId(data.sessionId);
        }
      }
      
      debouncedFetchSessions();
    } catch (error) {
      if (error.name === "CanceledError" || error.message === "canceled") {
        setMessages(prev => [...prev, {
          id: `assistant-canceled-${Date.now()}`,
          role: "assistant",
          content: "[Đã dừng phản hồi]",
          timestamp: new Date().toISOString(),
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content: error.response?.data?.message || "Hiện tại tôi chưa phản hồi được. Bạn thử lại sau giúp mình nhé.",
          timestamp: new Date().toISOString(),
          isError: true,
        }]);
      }
    } finally {
      setIsSending(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const executeExportAction = async (intent) => {
    if (intent === "EXPORT_EXCEL_INCOME" || intent === "EXPORT_EXCEL_EXPENSE") {
      const endpoint = intent === "EXPORT_EXCEL_INCOME"
        ? API_ENDPOINTS.INCOME_EXCEL_DOWNLOAD
        : API_ENDPOINTS.EXPENSE_EXCEL_DOWNLOAD;
      const filename = intent === "EXPORT_EXCEL_INCOME" ? "income_details.xlsx" : "expense_details.xlsx";
      const response = await axiosConfig.get(endpoint, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      return intent === "EXPORT_EXCEL_INCOME"
        ? "📥 Đã tải xuống báo cáo Excel thu nhập tháng này!"
        : "📥 Đã tải xuống báo cáo Excel chi tiêu tháng này!";
    }
    if (intent === "EMAIL_INCOME_REPORT" || intent === "EMAIL_EXPENSE_REPORT") {
      const endpoint = intent === "EMAIL_INCOME_REPORT"
        ? API_ENDPOINTS.EMAIL_INCOME
        : API_ENDPOINTS.EMAIL_EXPENSE;
      await axiosConfig.get(endpoint);
      return intent === "EMAIL_INCOME_REPORT"
        ? "📧 Đã gửi báo cáo thu nhập tháng này đến email của bạn!"
        : "📧 Đã gửi báo cáo chi tiêu tháng này đến email của bạn!";
    }
    throw new Error("Không xác định được hành động.");
  };

  const handleConfirmAction = async (intent, confirmedData) => {
    setIsProcessingCrud(true);
    try {
      let resultContent;
      let undoData = null;

      if (isActionIntent(intent)) {
        resultContent = await executeExportAction(intent);
      } else {
        const { data } = await axiosConfig.post(API_ENDPOINTS.AI_CONFIRM_ACTION, {
          intent,
          sessionId: activeSessionId,
          extractedData: confirmedData
        });
        resultContent = `✅ ${data.message || "Thao tác thành công!"}`;
        if (data.undoable && data.operationId) undoData = data;
      }

      setMessages((prev) => prev.map((m) => m.isIntent ? { ...m, isConfirmation: true } : m));
      setMessages((prev) => [
        ...prev,
        { id: `result-${Date.now()}`, role: "assistant", content: resultContent, isSystem: true }
      ]);
      if (undoData) {
        setMessages((prev) => [
          ...prev,
          {
            id: `undo-${Date.now()}`,
            role: "assistant",
            isUndoAction: true,
            operationId: undoData.operationId,
            content: "Bạn có thể hoàn tác thao tác này trong vài phút."
          }
        ]);
      }
    } catch (error) {
      let errorMsg = "Không thể thực hiện thao tác. Vui lòng thử lại.";
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          errorMsg = JSON.parse(text).message || errorMsg;
        } catch { /* keep default */ }
      } else {
        errorMsg = error.response?.data?.message || error.message || errorMsg;
      }
      setMessages((prev) => [
        ...prev,
        { id: `result-error-${Date.now()}`, role: "assistant", content: `❌ ${errorMsg}`, isError: true }
      ]);
      debouncedFetchSessions();
    } finally {
      setIsProcessingCrud(false);
      setPendingIntent(null);
    }
  };

  const handleCancelConfirmation = () => {
    setPendingIntent(null);
    setMessages((prev) => prev.map((m) => {
      if (m.isIntent) return { ...m, isConfirmation: true };
      return m;
    }));
    setMessages((prev) => [
      ...prev,
      {
        id: `cancel-${Date.now()}`,
        role: "assistant",
        content: "Đã hủy thao tác.",
        isSystem: true
      }
    ]);
  };

  const handleUndo = async (operationId) => {
    try {
      await axiosConfig.post(API_ENDPOINTS.AI_UNDO(operationId));
      setMessages((prev) => [
        ...prev,
        {
          id: `undo-result-${Date.now()}`,
          role: "assistant",
          content: "↩️ Đã hoàn tác thao tác thành công.",
          isSystem: true
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `undo-error-${Date.now()}`,
          role: "assistant",
          content: "❌ Không thể hoàn tác. Có thể đã quá thời gian cho phép.",
          isError: true
        }
      ]);
    }
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setPendingIntent(null);
  };

  const handleSelectSession = (sessionId) => {
    setActiveSessionId(sessionId);
    setShowMobileSidebar(false);
    setPendingIntent(null);
    axiosConfig.get(API_ENDPOINTS.AI_CHAT_MESSAGES(sessionId))
      .then(({ data }) => setMessages(data))
      .catch(() => setMessages([]));
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await axiosConfig.delete(API_ENDPOINTS.AI_CHAT_DELETE_SESSION(sessionId));
      if (activeSessionId === sessionId) handleNewChat();
      fetchSessions();
    } catch {}
  };

  const handleRenameSession = async (sessionId, newTitle) => {
    try {
      await axiosConfig.put(API_ENDPOINTS.AI_CHAT_RENAME_SESSION(sessionId), { title: newTitle });
      fetchSessions();
    } catch {}
  };

  // Model change handlers
  const handleProviderSwitch = (provider) => {
    if (provider === selectedProvider) return;
    if (provider === "gemini" && isFreePlan) {
      // silently block; user sees a locked Agent tab
      return;
    }
    setProvider(provider);
  };

  const handleAgentModelChange = (newModel) => {
    if (newModel === agentModel) return;
    if (!isPremiumPlan) return;
    setAgentModel(newModel);
  };

  const confirmExperimentalModel = () => {
    if (pendingAgentModel) { setAgentModel(pendingAgentModel); setPendingAgentModel(null); }
    setShowExperimentalWarning(false);
  };

  const cancelExperimentalModel = () => {
    setShowExperimentalWarning(false);
    setPendingAgentModel(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#131314] text-slate-800 dark:text-slate-200 transition-colors duration-300 relative">
      <div className="pointer-events-none absolute inset-0 dark:block hidden">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-[0.15]"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 70% 70%, #a855f7 0%, transparent 55%), radial-gradient(circle at 50% 50%, #6366f1 0%, transparent 60%)",
          }}
        />
      </div>

      {showMobileSidebar && (
        <div
          className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        isLoading={isLoadingSessions}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        showMobile={showMobileSidebar}
        onCloseMobile={() => setShowMobileSidebar(false)}
      />

      <ChatWindow
        messages={messages}
        isSending={isSending}
        onSendMessage={handleSendMessage}
        userName={user?.fullName}
        messagesEndRef={messagesEndRef}
        onToggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
        onStopGenerating={handleStopGenerating}
        /* Model selector props */
        selectedProvider={selectedProvider}
        agentModel={agentModel}
        agentModelOptions={AGENT_MODEL_OPTIONS}
        plan={user?.subscriptionPlan || "FREE"}
        isFreePlan={isFreePlan}
        onProviderSwitch={handleProviderSwitch}
        onAgentModelChange={handleAgentModelChange}
        /* Intent handling props */
        onConfirmAction={handleConfirmAction}
        onCancelConfirmation={handleCancelConfirmation}
        onUndo={handleUndo}
        isProcessingCrud={isProcessingCrud}
      />

      <ExperimentalWarningModal
        isOpen={showExperimentalWarning}
        onConfirm={confirmExperimentalModel}
        onCancel={cancelExperimentalModel}
      />
    </div>
  );
};

export default AIChat;
