import React, { useState, useRef, useEffect, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Alert
} from "react-native";
import { COLORS } from "../constants/colors";
import { sendAiChat, parseAiIntent, confirmAiAction, undoAiAction } from "../services/aiService";
import { AuthContext } from "../components/AuthContext";
import AIConfirmationForm from "../components/AIConfirmationForm";
import { parseIntentResponse, isCrudIntent, isActionIntent, INTENT_ICONS, INTENT_LABELS } from "../utils/aiIntentParser";
import http from "../services/http";
import { API_ENDPOINTS } from "../constants/api";

const SUGGESTED_PROMPTS = [
  "Tạo chi tiêu 50000đ ăn trưa hôm nay",
  "Xuất báo cáo Excel chi tiêu tháng này",
  "Tạo thu nhập 5000000đ lương tháng này",
  "Làm sao để tiết kiệm 20% thu nhập?"
];

const QUICK_ACTIONS = [
  { label: "💰 Gợi ý tiết kiệm", text: "Gợi ý cách tiết kiệm dựa trên thói quen chi tiêu của tôi" },
  { label: "🧠 Tâm lý chi tiêu", text: "Tại sao tôi hay mua sắm bốc đồng và làm sao để kiểm soát?" },
  { label: "💬 Đang lo về tiền", text: "Tôi đang stress và lo lắng về tài chính, bạn có thể lắng nghe không?" },
  { label: "🎯 Lên kế hoạch", text: "Giúp tôi lên kế hoạch tiết kiệm cho một mục tiêu lớn" }
];

// Helper to format/clean markdown formatting for React Native Text display
const cleanMarkdown = (text) => {
  if (!text) return "";
  // Strip think tags
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  // Strip bold stars
  cleaned = cleaned.replace(/\*\*/g, "");
  // Clean empty tables formatting or blockquotes
  cleaned = cleaned.replace(/>/g, "▎");
  return cleaned;
};

function MessageBubble({ message, onConfirm, onCancel, onUndo, isProcessing }) {
  const isUser = message.sender === "user";
  const isBot = message.sender === "bot";
  const isSystem = message.isSystem;
  const isError = message.isError;

  return (
    <View style={[styles.bubbleWrapper, isUser ? styles.userWrapper : styles.botWrapper]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.botBubble,
          isSystem && styles.systemBubble,
          isError && styles.errorBubble
        ]}
      >
        {/* Dynamic Confirmation Form for AI Agent Intent */}
        {message.isIntent && !message.isConfirmation && (
          <AIConfirmationForm
            intent={message.intent}
            extractedFields={message.extractedFields}
            suggestedValues={message.suggestedValues}
            confirmationPrompt={message.confirmationPrompt}
            onConfirm={onConfirm}
            onCancel={onCancel}
            isProcessing={isProcessing}
          />
        )}

        {/* Confirmed / Cancelled static status indicator */}
        {message.isIntent && message.isConfirmation && (
          <View style={styles.confirmedStatusWrapper}>
            <Text style={styles.confirmedStatusText}>
              {INTENT_ICONS[message.intent] || "✅"} {INTENT_LABELS[message.intent]} đã được xử lý
            </Text>
          </View>
        )}

        {/* Action Undo Button */}
        {message.isUndoAction && (
          <View style={styles.undoContainer}>
            <Text style={styles.undoText}>{message.text}</Text>
            <Pressable style={styles.undoBtn} onPress={() => onUndo(message.operationId)}>
              <Text style={styles.undoBtnText}>↩ Hoàn tác</Text>
            </Pressable>
          </View>
        )}

        {/* Normal text response */}
        {!message.isIntent && !message.isUndoAction && (
          <Text style={[styles.messageText, isUser ? styles.userText : (isError ? styles.errorText : styles.botText)]}>
            {isUser ? message.text : cleanMarkdown(message.text)}
          </Text>
        )}

        {/* Model footprint label */}
        {isBot && !message.isIntent && !isSystem && !isError && message.modelLabel && (
          <Text style={styles.modelFootprint}>
            Nova Money · {message.modelLabel}
          </Text>
        )}
      </View>
      <Text style={[styles.timeText, isUser ? styles.userTime : styles.botTime]}>
        {message.time}
      </Text>
    </View>
  );
}

export default function ChatScreen() {
  const { user } = useContext(AuthContext);
  
  // Subscription status checking
  const isFreePlan = !user?.subscriptionPlan || user?.subscriptionPlan === "FREE";
  const isBasicPlan = user?.subscriptionPlan === "BASIC";
  const isPremiumPlan = user?.subscriptionPlan === "PREMIUM";

  // Mode and Provider state
  const [activeMode, setActiveMode] = useState("chat"); // "chat" | "agent"
  const [chatModel, setChatModel] = useState("ninerouter"); // "ninerouter" | "gptoss"
  const [agentModel, setAgentModel] = useState("ninerouter"); // "ninerouter" | "gemini"

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      text: "Xin chào! Tôi là Nova Money - Trợ lý AI của Money Manager. Tôi có thể trò chuyện, tư vấn tài chính, hoặc tự động thao tác dữ liệu giúp bạn ở chế độ Agent.",
      sender: "bot",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isProcessingCrud, setIsProcessingCrud] = useState(false);
  const [pendingIntent, setPendingIntent] = useState(null);
  const flatListRef = useRef(null);

  // Sync state model defaults when user tier changes
  useEffect(() => {
    if (isPremiumPlan) {
      if (chatModel === "ninerouter" && agentModel === "ninerouter") {
        setChatModel("gptoss");
        setAgentModel("gemini");
      }
    } else {
      setChatModel("ninerouter");
      setAgentModel("ninerouter");
      setActiveMode("chat"); // Free/Basic default to chat
    }
  }, [user?.subscriptionPlan]);

  const getActiveParams = () => {
    const activeProvider = activeMode === "agent"
      ? (agentModel === "ninerouter" ? "ninerouter" : "gemini")
      : (chatModel === "ninerouter" ? "ninerouter" : "gptoss");
      
    const activeModel = activeMode === "agent"
      ? (agentModel === "ninerouter" ? "gemma4-31B" : "gemini-3.1-flash-lite")
      : (chatModel === "ninerouter" ? "project-demo" : "gpt-oss-120b");

    const activeModelLabel = activeMode === "agent"
      ? (agentModel === "ninerouter" ? "Nova Lite" : "Gemini 3.1 Flash Lite")
      : (chatModel === "ninerouter" ? "Nova Lite" : "GPT-OSS 120B");

    return { activeProvider, activeModel, activeModelLabel };
  };

  const buildHistory = (msgs) => {
    return msgs
      .filter((m) => m.id !== "welcome" && !m.isSystem && !m.isIntent && !m.isConfirmation)
      .slice(-20)
      .map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
      }));
  };

  const sendMessage = async (textToSend) => {
    const trimmedText = textToSend.trim();
    if (!trimmedText || loading) return;

    if (pendingIntent) {
      setMessages((prev) => [
        ...prev,
        {
          id: `system-warn-${Date.now()}`,
          text: "⚠️ Vui lòng xác nhận hoặc hủy thao tác hiện tại trước khi gửi lệnh mới.",
          sender: "bot",
          isSystem: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    const { activeProvider, activeModel, activeModelLabel } = getActiveParams();

    const userMessage = {
      id: String(Date.now()),
      text: trimmedText,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText("");
    setLoading(true);

    try {
      const history = buildHistory(updatedMessages);

      if (activeMode === "chat") {
        const response = await sendAiChat(history, activeProvider, activeModel);
        const botMessage = {
          id: String(Date.now() + 1),
          text: response?.reply || "Tôi đã nhận câu hỏi nhưng hiện chưa tạo được câu trả lời phù hợp.",
          sender: "bot",
          modelLabel: activeModelLabel,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        // Agent Mode: Parse intent first
        const intentResponse = await parseAiIntent(
          trimmedText,
          "dashboard", // Context page on mobile
          history,
          activeProvider,
          activeModel
        );

        const parsed = parseIntentResponse(intentResponse);

        if (isCrudIntent(parsed.intent) || isActionIntent(parsed.intent)) {
          setPendingIntent(parsed);
          const intentMessage = {
            id: String(Date.now() + 1),
            sender: "bot",
            isIntent: true,
            intent: parsed.intent,
            extractedFields: parsed.extractedFields,
            suggestedValues: parsed.suggestedValues,
            confirmationPrompt: parsed.confirmationPrompt,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages((prev) => [...prev, intentMessage]);
        } else if (parsed.intent === "ANSWER_QUESTION") {
          const botMessage = {
            id: String(Date.now() + 1),
            text: parsed.answer || intentResponse?.reply || "Tôi đã nhận câu hỏi nhưng chưa tạo được câu trả lời phù hợp.",
            sender: "bot",
            modelLabel: activeModelLabel,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages((prev) => [...prev, botMessage]);
        } else if (parsed.intent === "INVALID_REQUEST") {
          const botMessage = {
            id: String(Date.now() + 1),
            text: parsed.validationErrors?.[0] || "Yêu cầu không hợp lệ hoặc ngoài phạm vi hỗ trợ.",
            sender: "bot",
            isError: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages((prev) => [...prev, botMessage]);
        } else {
          // Fallback to chat API
          const response = await sendAiChat(history, activeProvider, activeModel);
          const botMessage = {
            id: String(Date.now() + 1),
            text: response?.reply || "Tôi đã nhận câu hỏi nhưng hiện chưa tạo được câu trả lời phù hợp.",
            sender: "bot",
            modelLabel: activeModelLabel,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages((prev) => [...prev, botMessage]);
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Không thể xử lý yêu cầu. Vui lòng thử lại sau.";
      const errorMessage = {
        id: String(Date.now() + 1),
        text: errorMsg,
        sender: "bot",
        isError: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const executeExportAction = async (intent) => {
    if (intent === "EXPORT_EXCEL_INCOME" || intent === "EXPORT_EXCEL_EXPENSE") {
      const endpoint = intent === "EXPORT_EXCEL_INCOME"
        ? API_ENDPOINTS.INCOME_EXCEL_DOWNLOAD
        : API_ENDPOINTS.EXPENSE_EXCEL_DOWNLOAD;
      
      // On mobile, trigger get excel report API
      await http.get(endpoint);
      return intent === "EXPORT_EXCEL_INCOME"
        ? "📥 Đã chuẩn bị báo cáo Excel thu nhập tháng này!"
        : "📥 Đã chuẩn bị báo cáo Excel chi tiêu tháng này!";
    }
    if (intent === "EMAIL_INCOME_REPORT" || intent === "EMAIL_EXPENSE_REPORT") {
      const endpoint = intent === "EMAIL_INCOME_REPORT"
        ? API_ENDPOINTS.EMAIL_INCOME
        : API_ENDPOINTS.EMAIL_EXPENSE;
      await http.get(endpoint);
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
        const data = await confirmAiAction(intent, confirmedData);
        const intentIcon = INTENT_ICONS[intent] || "✅";
        resultContent = `${intentIcon} ${data.message || "Thao tác thành công!"}`;
        if (data.undoable && data.operationId) {
          undoData = data;
        }
      }

      setMessages((prev) => prev.map((m) => m.isIntent ? { ...m, isConfirmation: true } : m));
      setMessages((prev) => [
        ...prev,
        {
          id: `result-${Date.now()}`,
          text: resultContent,
          sender: "bot",
          isSystem: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      if (undoData) {
        setMessages((prev) => [
          ...prev,
          {
            id: `undo-${Date.now()}`,
            sender: "bot",
            isUndoAction: true,
            operationId: undoData.operationId,
            text: "Bạn có thể hoàn tác thao tác này trong vòng vài phút.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Không thể thực hiện thao tác.";
      setMessages((prev) => [
        ...prev,
        {
          id: `result-error-${Date.now()}`,
          text: `❌ Lỗi: ${errorMsg}`,
          sender: "bot",
          isError: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsProcessingCrud(false);
      setPendingIntent(null);
    }
  };

  const handleCancelConfirmation = () => {
    setPendingIntent(null);
    setMessages((prev) => prev.map((m) => m.isIntent ? { ...m, isConfirmation: true } : m));
    setMessages((prev) => [
      ...prev,
      {
        id: `cancel-${Date.now()}`,
        text: "Đã hủy thao tác.",
        sender: "bot",
        isSystem: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleUndo = async (operationId) => {
    try {
      await undoAiAction(operationId);
      setMessages((prev) => [
        ...prev,
        {
          id: `undo-result-${Date.now()}`,
          text: "↩️ Đã hoàn tác thao tác thành công.",
          sender: "bot",
          isSystem: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (e) {
      Alert.alert("Lỗi hoàn tác", "Không thể hoàn tác. Có thể đã quá thời gian cho phép.");
    }
  };

  const handleModeSwitch = (mode) => {
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
  };

  const handleModelChange = (model) => {
    if (activeMode === "chat") {
      if (model === chatModel) return;
      if (!isPremiumPlan && model !== "ninerouter") return;

      if (model === "ninerouter" && isPremiumPlan) {
        Alert.alert(
          "Kích hoạt mô hình thử nghiệm",
          "Mô hình Nova Lite (Gemma 4) là phiên bản thử nghiệm có thể phản hồi không ổn định. Bạn có muốn sử dụng?",
          [
            { text: "Hủy", style: "cancel" },
            { text: "Đồng ý", onPress: () => setChatModel(model) }
          ]
        );
        return;
      }
      setChatModel(model);
    } else {
      // Agent mode
      if (model === agentModel) return;
      if (!isPremiumPlan && model !== "ninerouter") return;

      if (model === "ninerouter" && isPremiumPlan) {
        Alert.alert(
          "Kích hoạt mô hình thử nghiệm",
          "Mô hình Nova Lite (Gemma 4) là phiên bản thử nghiệm cho Agent. Bạn có muốn tiếp tục?",
          [
            { text: "Hủy", style: "cancel" },
            { text: "Đồng ý", onPress: () => setAgentModel(model) }
          ]
        );
        return;
      }
      setAgentModel(model);
    }
  };

  useEffect(() => {
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, loading]);

  const getModelLabel = () => {
    const { activeModelLabel } = getActiveParams();
    return activeModelLabel;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Mode switcher tabs */}
      <View style={styles.modeContainer}>
        <Pressable
          style={[styles.modeTab, activeMode === "chat" && styles.modeTabActive]}
          onPress={() => handleModeSwitch("chat")}
        >
          <Text style={[styles.modeText, activeMode === "chat" && styles.modeTextActive]}>
            💬 Chat
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeTab, activeMode === "agent" && styles.modeTabActive]}
          onPress={() => handleModeSwitch("agent")}
        >
          <Text style={[styles.modeText, activeMode === "agent" && styles.modeTextActive]}>
            🤖 Agent {isFreePlan && "🔒"}
          </Text>
        </Pressable>
      </View>

      {/* Model Selector Bar */}
      <View style={styles.selectorContainer}>
        {activeMode === "chat" ? (
          <>
            <Pressable
              style={[styles.selectorButton, chatModel === "ninerouter" && styles.selectorActive]}
              onPress={() => handleModelChange("ninerouter")}
            >
              <Text style={[styles.selectorText, chatModel === "ninerouter" && styles.selectorActiveText]}>
                ✨ Nova Lite
              </Text>
            </Pressable>
            <Pressable
              style={[styles.selectorButton, chatModel === "gptoss" && styles.selectorActive]}
              onPress={() => handleModelChange("gptoss")}
              disabled={!isPremiumPlan}
            >
              <Text
                style={[
                  styles.selectorText,
                  chatModel === "gptoss" && styles.selectorActiveText,
                  !isPremiumPlan && styles.disabledText
                ]}
              >
                {isPremiumPlan ? "🤖 GPT-OSS 120B" : "🔒 GPT-OSS 120B"}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              style={[styles.selectorButton, agentModel === "ninerouter" && styles.selectorActive]}
              onPress={() => handleModelChange("ninerouter")}
            >
              <Text style={[styles.selectorText, agentModel === "ninerouter" && styles.selectorActiveText]}>
                ✨ Nova Lite
              </Text>
            </Pressable>
            <Pressable
              style={[styles.selectorButton, agentModel === "gemini" && styles.selectorActive]}
              onPress={() => handleModelChange("gemini")}
              disabled={!isPremiumPlan}
            >
              <Text
                style={[
                  styles.selectorText,
                  agentModel === "gemini" && styles.selectorActiveText,
                  !isPremiumPlan && styles.disabledText
                ]}
              >
                {isPremiumPlan ? "🤖 Gemini 3.1 Flash" : "🔒 Gemini 3.1 Flash"}
              </Text>
            </Pressable>
          </>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              onConfirm={handleConfirmAction}
              onCancel={handleCancelConfirmation}
              onUndo={handleUndo}
              isProcessing={isProcessingCrud}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={COLORS.PRIMARY} size="small" />
                <Text style={styles.loadingText}>
                  {getModelLabel()} đang suy nghĩ...
                </Text>
              </View>
            ) : null
          }
        />

        {/* Quick action chips above input */}
        {messages.length === 1 && !loading && (
          <View style={styles.quickActionsContainer}>
            <Text style={styles.quickActionsTitle}>Thử gõ nhanh các lệnh sau:</Text>
            <FlatList
              data={QUICK_ACTIONS}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.label}
              contentContainerStyle={styles.chipsScroll}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.quickActionChip}
                  onPress={() => {
                    if (activeMode === "chat") {
                      sendMessage(item.text);
                    } else {
                      sendMessage(item.text);
                    }
                  }}
                >
                  <Text style={styles.quickActionText}>{item.label}</Text>
                </Pressable>
              )}
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={
              activeMode === "agent"
                ? "Tạo/sửa/xóa dữ liệu, xuất excel..."
                : "Trò chuyện, hỏi đáp tài chính..."
            }
            placeholderTextColor={COLORS.TEXT_MUTED}
            value={inputText}
            onChangeText={setInputText}
            editable={!loading}
            multiline
          />
          <Pressable
            style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || loading}
          >
            <Text style={styles.sendButtonText}>Gửi</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG
  },
  modeContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.CARD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.CARD_BORDER,
    padding: 6,
    gap: 4
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: COLORS.BG,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER
  },
  modeTabActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY
  },
  modeText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.TEXT_SECONDARY
  },
  modeTextActive: {
    color: COLORS.WHITE
  },
  selectorContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.CARD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.CARD_BORDER,
    padding: 6,
    gap: 6
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: COLORS.BG,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER
  },
  selectorActive: {
    backgroundColor: COLORS.ROSE_MIST,
    borderColor: COLORS.PRIMARY
  },
  selectorText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.TEXT_SECONDARY
  },
  selectorActiveText: {
    color: COLORS.PRIMARY,
    fontWeight: "700"
  },
  disabledText: {
    color: COLORS.TEXT_MUTED
  },
  keyboardView: {
    flex: 1
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20
  },
  bubbleWrapper: {
    marginBottom: 14,
    width: "100%"
  },
  userWrapper: {
    alignItems: "flex-end"
  },
  botWrapper: {
    alignItems: "flex-start"
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: "85%"
  },
  userBubble: {
    backgroundColor: COLORS.PRIMARY,
    borderBottomRightRadius: 2
  },
  botBubble: {
    backgroundColor: COLORS.CARD,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER
  },
  systemBubble: {
    backgroundColor: COLORS.BG,
    borderWidth: 1,
    borderColor: COLORS.ROSE_MIST,
    borderStyle: "dashed"
  },
  errorBubble: {
    backgroundColor: COLORS.EXPENSE_LIGHT,
    borderColor: COLORS.EXPENSE,
    borderWidth: 1
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18
  },
  userText: {
    color: COLORS.WHITE
  },
  botText: {
    color: COLORS.TEXT
  },
  errorText: {
    color: COLORS.EXPENSE,
    fontWeight: "600"
  },
  modelFootprint: {
    fontSize: 9,
    color: COLORS.TEXT_MUTED,
    marginTop: 4,
    fontStyle: "italic",
    alignSelf: "flex-start"
  },
  timeText: {
    fontSize: 9,
    marginTop: 3,
    color: COLORS.TEXT_MUTED
  },
  userTime: {
    marginRight: 2
  },
  botTime: {
    marginLeft: 2
  },
  confirmedStatusWrapper: {
    paddingVertical: 4
  },
  confirmedStatusText: {
    fontSize: 12,
    color: COLORS.INCOME,
    fontWeight: "700"
  },
  undoContainer: {
    gap: 6
  },
  undoText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY
  },
  undoBtn: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.ROSE_MIST,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  undoBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.PRIMARY
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    marginTop: 6
  },
  loadingText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12
  },
  quickActionsContainer: {
    paddingBottom: 12
  },
  quickActionsTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.TEXT_SECONDARY,
    paddingHorizontal: 16,
    marginBottom: 6
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8
  },
  quickActionChip: {
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  quickActionText: {
    color: COLORS.PRIMARY,
    fontSize: 12,
    fontWeight: "600"
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: COLORS.CARD,
    borderTopWidth: 1,
    borderTopColor: COLORS.CARD_BORDER,
    alignItems: "flex-end",
    gap: 6
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.BG,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    fontSize: 14,
    maxHeight: 80,
    color: COLORS.TEXT
  },
  sendButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.TEXT_MUTED
  },
  sendButtonText: {
    color: COLORS.WHITE,
    fontWeight: "700",
    fontSize: 13
  }
});
