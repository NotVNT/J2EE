import { useState, useRef, useCallback, useEffect } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { sendAiChat, parseAiIntent, confirmAiAction, undoAiAction } from "../../services/aiChatService";
import { parseIntentResponse, isCrudIntent, isActionIntent, INTENT_ICONS } from "../../utils/aiIntent";
import apiClient from "../../services/apiClient";
import { API_ENDPOINTS } from "../../constants/api";
import { executeExportAction } from "./chatActionHandlers";
import {
  buildHistory,
  buildPersistedMessages,
  getCurrentTimeLabel,
  getWelcomeMessage,
  hasPendingIntent,
  mapStoredMessages
} from "./chatMessageUtils";

/**
 * useChatMessages — Quản lý toàn bộ state tin nhắn, sessions, sửa tin, dừng & thử lại.
 */
export default function useChatMessages({ activeMode, activeProvider, activeModel, activeModelLabel }) {
  const { t } = useTranslation();
  const welcomeMessage = getWelcomeMessage(t);
  const [messages, setMessages] = useState([welcomeMessage]);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputLocked, setInputLocked] = useState(false);
  const [isProcessingCrud, setIsProcessingCrud] = useState(false);
  const [pendingIntent, setPendingIntent] = useState(null);

  const flatListRef = useRef(null);
  const messagesRef = useRef(messages);
  const isSendingRef = useRef(false);
  const messageIdRef = useRef(0);
  const abortControllerRef = useRef(null);
  const currentRequestIdRef = useRef(0);

  const chatBusy = loading || inputLocked || isProcessingCrud;

  // ── Stop Generating ──────────────────────────────────

  const stopGenerating = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // ── Session Management ────────────────────────────────

  const fetchSessions = useCallback(async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AI_CHAT_SESSIONS);
      setSessions(response.data || []);
    } catch {
      setSessions([]);
    }
  }, []);

  const selectSession = useCallback(async (sessionId) => {
    stopGenerating();
    const requestId = ++currentRequestIdRef.current;
    isSendingRef.current = false;

    setActiveSessionId(sessionId);
    setPendingIntent(null);
    setLoading(true);
    setInputLocked(false);
    try {
      const response = await apiClient.get(API_ENDPOINTS.AI_CHAT_MESSAGES(sessionId));
      if (requestId !== currentRequestIdRef.current) return;

      const nextMsgs = mapStoredMessages(response.data || [], t);
      setMessages(nextMsgs);
      messagesRef.current = nextMsgs;
    } catch {
      if (requestId !== currentRequestIdRef.current) return;
      const fallback = getWelcomeMessage(t);
      setMessages([fallback]);
      messagesRef.current = [fallback];
    } finally {
      if (requestId === currentRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, [stopGenerating]);

  const renameSession = useCallback(async (sessionId, newTitle) => {
    if (!newTitle.trim()) return;
    try {
      await apiClient.put(API_ENDPOINTS.AI_CHAT_RENAME_SESSION(sessionId), { title: newTitle });
      fetchSessions();
    } catch {
      Alert.alert(t("auth.common.error"), t("chatbot.renameFailed"));
    }
  }, [fetchSessions]);

  const startNewChat = useCallback(() => {
    stopGenerating();
    currentRequestIdRef.current += 1;
    isSendingRef.current = false;

    setActiveSessionId(null);
    setPendingIntent(null);
    setLoading(false);
    setInputLocked(false);
    setMessages([welcomeMessage]);
    messagesRef.current = [welcomeMessage];
  }, [stopGenerating, welcomeMessage]);

  const deleteSession = useCallback(async (sessionId) => {
    try {
      await apiClient.delete(API_ENDPOINTS.AI_CHAT_DELETE_SESSION(sessionId));
      if (activeSessionId === sessionId) {
        startNewChat();
      }
      fetchSessions();
    } catch {
      Alert.alert(t("auth.common.error"), t("chatbot.deleteSessionFailed"));
    }
  }, [activeSessionId, fetchSessions, startNewChat]);

  // Tải danh sách phiên chat khi khởi chạy
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // ── Internal helpers ───────────────────────────────────

  const createMessageId = useCallback((prefix = "message") => {
    messageIdRef.current += 1;
    return `${prefix}-${Date.now()}-${messageIdRef.current}`;
  }, []);

  const appendMessage = useCallback((message) => {
    setMessages((prev) => {
      const next = [...prev, message];
      messagesRef.current = next;
      return next;
    });
  }, []);

  // ── Send / Edit / Resend ───────────────────────────────

  const sendMessage = useCallback(async (textToSend, options = {}) => {
    const trimmedText = String(textToSend || "").trim();
    const editMessageId = options?.editMessageId ?? null;
    if (!trimmedText || (chatBusy && !editMessageId) || isSendingRef.current) return;

    const currentMessages = messagesRef.current;
    
    // Nếu có pendingIntent (đang chờ xác nhận CRUD) thì chặn gửi tin nhắn mới
    if (hasPendingIntent(currentMessages) && !editMessageId) {
      appendMessage({
        id: createMessageId("system-warn"),
        text: t("chatbot.pendingIntentWarning"),
        sender: "bot",
        isSystem: true,
        time: getCurrentTimeLabel()
      });
      return;
    }

    isSendingRef.current = true;
    setInputLocked(true);
    setLoading(true);

    // Xử lý Cắt Lịch Sử (Nếu đang chỉnh sửa tin nhắn cũ)
    const editingMessageIndex = editMessageId
      ? currentMessages.findIndex((m) => m.id === editMessageId)
      : -1;
    const isEditingExisting = editingMessageIndex >= 0;
    
    const baseMessages = isEditingExisting
      ? currentMessages.slice(0, editingMessageIndex)
      : currentMessages;

    const userMessage = {
      id: isEditingExisting ? editMessageId : createMessageId("user"),
      text: trimmedText,
      sender: "user",
      time: getCurrentTimeLabel()
    };

    const nextMessages = [...baseMessages, userMessage];
    messagesRef.current = nextMessages;
    setMessages(nextMessages);
    setPendingIntent(null);

    const requestId = ++currentRequestIdRef.current;

    // Khởi tạo AbortController cho phép dừng generate giữa chừng
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const history = buildHistory(nextMessages);

      // Nếu đang chỉnh sửa tin nhắn cũ, gửi PUT đồng bộ lại lịch sử lên server
      if (isEditingExisting && activeSessionId) {
        await apiClient.put(
          API_ENDPOINTS.AI_CHAT_REPLACE_MESSAGES(activeSessionId),
          { messages: buildPersistedMessages(nextMessages) }
        );
        if (requestId !== currentRequestIdRef.current) return;
      }

      if (activeMode === "chat") {
        const response = await sendAiChat(
          history, activeProvider, activeModel,
          activeSessionId, true, signal
        );
        if (requestId !== currentRequestIdRef.current) return;
        
        appendMessage({
          id: createMessageId("bot"),
          text: response?.reply || t("chatbot.noAnswer"),
          sender: "bot",
          modelLabel: activeModelLabel,
          time: getCurrentTimeLabel()
        });

        if (response?.sessionId && !activeSessionId) {
          setActiveSessionId(response.sessionId);
          fetchSessions();
        }
      } else {
        // Agent Mode
        const intentResponse = await parseAiIntent(
          trimmedText, "dashboard", history,
          activeProvider, activeModel, activeSessionId, signal
        );
        if (requestId !== currentRequestIdRef.current) return;
        
        const parsed = parseIntentResponse(intentResponse);

        if (intentResponse?.sessionId && !activeSessionId) {
          setActiveSessionId(intentResponse.sessionId);
          fetchSessions();
        }

        if (isCrudIntent(parsed.intent) || isActionIntent(parsed.intent)) {
          setPendingIntent(parsed);
          appendMessage({
            id: createMessageId("intent"),
            sender: "bot",
            isIntent: true,
            intent: parsed.intent,
            extractedFields: parsed.extractedFields,
            suggestedValues: parsed.suggestedValues,
            confirmationPrompt: parsed.confirmationPrompt,
            time: getCurrentTimeLabel()
          });
        } else if (parsed.intent === "ANSWER_QUESTION") {
          appendMessage({
            id: createMessageId("bot"),
            text: parsed.answer || intentResponse?.reply || t("chatbot.noAnswer"),
            sender: "bot",
            modelLabel: activeModelLabel,
            time: getCurrentTimeLabel()
          });
        } else if (parsed.intent === "INVALID_REQUEST") {
          appendMessage({
            id: createMessageId("bot-error"),
            text: parsed.validationErrors?.[0] || t("chatbot.invalidRequest"),
            sender: "bot",
            isError: true,
            time: getCurrentTimeLabel()
          });
        } else {
          // Fallback to chat
          const response = await sendAiChat(
            history, activeProvider, activeModel,
            activeSessionId || intentResponse?.sessionId, true, signal
          );
          if (requestId !== currentRequestIdRef.current) return;
          
          appendMessage({
            id: createMessageId("bot"),
            text: response?.reply || t("chatbot.noAnswer"),
            sender: "bot",
            modelLabel: activeModelLabel,
            time: getCurrentTimeLabel()
          });
        }
      }
      
      // Đồng bộ lại danh sách phiên chat
      fetchSessions();

    } catch (error) {
      if (requestId !== currentRequestIdRef.current) return;
      if (error.name === "AbortError" || error.message === "canceled" || error.code === "ERR_CANCELED") {
        // Xử lý khi người dùng ấn nút STOP
        appendMessage({
          id: createMessageId("bot-info"),
          text: t("chatbot.stopped"),
          sender: "bot",
          isSystem: true,
          time: getCurrentTimeLabel()
        });
      } else {
        const errorMsg = error.response?.data?.message || t("chatbot.processFailed");
        appendMessage({
          id: createMessageId("bot-error"),
          text: errorMsg,
          sender: "bot",
          isError: true,
          time: getCurrentTimeLabel()
        });
      }
    } finally {
      if (requestId === currentRequestIdRef.current) {
        isSendingRef.current = false;
        setLoading(false);
        setInputLocked(false);
        abortControllerRef.current = null;
      }
    }
  }, [activeMode, activeProvider, activeModel, activeModelLabel, chatBusy, activeSessionId, appendMessage, createMessageId, fetchSessions]);

  // ── Retry ─────────────────────────────────────────────

  const retryLastMessage = useCallback(() => {
    const currentMessages = messagesRef.current;
    const lastUserIdx = [...currentMessages].reverse().findIndex((m) => m.sender === "user");
    if (lastUserIdx < 0) return;

    const actualIdx = currentMessages.length - 1 - lastUserIdx;
    const lastUserMsg = currentMessages[actualIdx];

    // Cắt bỏ mọi tin nhắn lỗi hoặc Bot phản hồi sau tin nhắn User cuối
    const nextMessages = currentMessages.slice(0, actualIdx);
    messagesRef.current = nextMessages;
    setMessages(nextMessages);

    // Gửi lại nội dung tin nhắn đó
    sendMessage(lastUserMsg.text);
  }, [sendMessage]);

  // ── Confirm / Cancel / Undo ────────────────────────────

  const handleConfirmAction = useCallback(async (intent, confirmedData) => {
    setIsProcessingCrud(true);
    try {
      let resultContent;
      let undoData = null;

      if (isActionIntent(intent)) {
        resultContent = await executeExportAction(intent, t);
      } else {
        const data = await confirmAiAction(intent, confirmedData);
        const icon = INTENT_ICONS[intent] || "✅";
        resultContent = `${icon} ${data.message || t("chatbot.operationSuccess")}`;
        if (data.undoable && data.operationId) undoData = data;
      }

      setMessages((prev) => prev.map((m) => m.isIntent ? { ...m, isConfirmation: true } : m));
      appendMessage({
        id: createMessageId("result"),
        text: resultContent,
        sender: "bot",
        isSystem: true,
        time: getCurrentTimeLabel()
      });

      if (undoData) {
        appendMessage({
          id: createMessageId("undo"),
          sender: "bot",
          isUndoAction: true,
          operationId: undoData.operationId,
          text: t("chatbot.undoHint"),
          time: getCurrentTimeLabel()
        });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || t("chatbot.actionFailed");
      appendMessage({
        id: createMessageId("result-error"),
        text: `❌ Lỗi: ${errorMsg}`,
        sender: "bot",
        isError: true,
        time: getCurrentTimeLabel()
      });
    } finally {
      setIsProcessingCrud(false);
      setPendingIntent(null);
    }
  }, [appendMessage, createMessageId]);

  const handleCancelConfirmation = useCallback(() => {
    setPendingIntent(null);
    setMessages((prev) => prev.map((m) => m.isIntent ? { ...m, isConfirmation: true } : m));
    appendMessage({
      id: createMessageId("cancel"),
      text: t("chatbot.actionCancelled"),
      sender: "bot",
      isSystem: true,
      time: getCurrentTimeLabel()
    });
  }, [appendMessage, createMessageId]);

  const handleUndo = useCallback(async (operationId) => {
    try {
      await undoAiAction(operationId);
      appendMessage({
        id: createMessageId("undo-result"),
        text: t("chatbot.undoSuccess"),
        sender: "bot",
        isSystem: true,
        time: getCurrentTimeLabel()
      });
    } catch (e) {
      Alert.alert(t("chatbot.undoFailed"), t("chatbot.undoFailed"));
    }
  }, [appendMessage, createMessageId]);

  // ── Derived ────────────────────────────────────────────

  const hasUserStartedChat = messages.some((m) => m.sender === "user");

  return {
    // State
    messages,
    sessions,
    activeSessionId,
    loading,
    chatBusy,
    pendingIntent,
    isProcessingCrud,
    hasUserStartedChat,
    // Refs
    flatListRef,
    // Actions
    sendMessage,
    retryLastMessage,
    stopGenerating,
    selectSession,
    deleteSession,
    renameSession,
    startNewChat,
    fetchSessions,
    handleConfirmAction,
    handleCancelConfirmation,
    handleUndo
  };
}
