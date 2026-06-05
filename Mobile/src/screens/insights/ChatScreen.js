import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Pressable,
  Animated
} from "react-native";
import { COLORS, useAppColors } from "../../constants/colors";
import ChatAssistantHeader from "../../components/chatbotUI/ChatAssistantHeader";
import MessageBubble from "../../components/chatbotUI/MessageBubble";
import QuickPromptChips from "../../components/chatbotUI/QuickPromptChips";
import ChatInputBar from "../../components/chatbotUI/ChatInputBar";
import SessionsModal from "../../components/chatbotUI/SessionsModal";
import EditMessageModal from "../../components/chatbotUI/EditMessageModal";
import useChatMessages from "../../components/chatbotUI/useChatMessages";
import useModelConfig from "../../components/chatbotUI/useModelConfig";
import useVoiceInput from "../../components/chatbotUI/useVoiceInput";
import AppIcon from "../../components/ui/AppIcon";

function WaveformBar({ color }) {
  const anim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 2.5,
          duration: 300 + Math.random() * 200,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 1,
          duration: 300 + Math.random() * 200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [anim]);

  return (
    <Animated.View
      style={{
        width: 4,
        height: 18,
        backgroundColor: color,
        borderRadius: 2,
        marginHorizontal: 3,
        transform: [{ scaleY: anim }],
      }}
    />
  );
}

export default function ChatScreen() {
  const colors = useAppColors();
  const [inputText, setInputText] = useState("");
  const [isSessionsVisible, setIsSessionsVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);

  const {
    activeMode,
    activeProvider,
    activeModel,
    activeModelLabel,
    modelOptions,
    modelValue,
    modelLabel,
    inputPlaceholder,
    isFreePlan,
    handleModeSwitch,
    handleModelChange
  } = useModelConfig();

  const {
    messages,
    sessions,
    activeSessionId,
    loading,
    chatBusy,
    hasUserStartedChat,
    isProcessingCrud,
    flatListRef,
    sendMessage,
    retryLastMessage,
    stopGenerating,
    selectSession,
    deleteSession,
    renameSession,
    startNewChat,
    handleConfirmAction,
    handleCancelConfirmation,
    handleUndo
  } = useChatMessages({ activeMode, activeProvider, activeModel, activeModelLabel });

  const handleVoiceResult = useCallback((transcript) => {
    setInputText((prev) => {
      const trimmed = transcript.trim();
      return prev ? `${prev} ${trimmed}` : trimmed;
    });
  }, []);

  const { isRecording, handleMicPress } = useVoiceInput({
    language: "vi-VN",
    onResult: handleVoiceResult
  });

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, chatBusy, flatListRef]);

  const handleInputChange = useCallback((text) => {
    if (chatBusy) return;
    setInputText(text);
  }, [chatBusy]);

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText("");
  }, [inputText, sendMessage]);

  const handleQuickPrompt = useCallback((prompt) => {
    sendMessage(prompt.text);
  }, [sendMessage]);

  const handleEditMessage = useCallback((message) => {
    setEditingMessage(message);
    setIsEditModalVisible(true);
  }, []);

  const handleSaveEditedMessage = useCallback((newText, messageId) => {
    sendMessage(newText, { editMessageId: messageId });
  }, [sendMessage]);

  const renderMessage = useCallback(({ item }) => (
    <MessageBubble
      message={item}
      onConfirm={handleConfirmAction}
      onCancel={handleCancelConfirmation}
      onUndo={handleUndo}
      onEditMessage={handleEditMessage}
      onRetry={retryLastMessage}
      isProcessing={isProcessingCrud}
    />
  ), [handleConfirmAction, handleCancelConfirmation, handleUndo, handleEditMessage, retryLastMessage, isProcessingCrud]);

  return (
    <View style={[styles.container, { backgroundColor: colors.CHAT_BG }]}> 
      <ChatAssistantHeader
        activeMode={activeMode}
        isFreePlan={isFreePlan}
        modelOptions={modelOptions}
        modelValue={modelValue}
        modelLabel={modelLabel}
        onChangeMode={handleModeSwitch}
        onModelChange={handleModelChange}
        onOpenSessions={() => setIsSessionsVisible(true)}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={
            loading ? (
              <View style={[styles.loadingContainer, { backgroundColor: colors.CHAT_BUBBLE, borderColor: colors.CHAT_BORDER }]}> 
                <ActivityIndicator color={colors.PRIMARY} size="small" />
                <Text style={[styles.loadingText, { color: colors.CHAT_MUTED }]}> 
                  Trợ lý AI đang suy nghĩ...
                </Text>
              </View>
            ) : null
          }
        />

        {!hasUserStartedChat && !chatBusy && (
          <QuickPromptChips onSelect={handleQuickPrompt} />
        )}

        <ChatInputBar
          value={inputText}
          onChangeText={handleInputChange}
          onSend={handleSend}
          onStop={stopGenerating}
          placeholder={inputPlaceholder}
          loading={loading}
          disabled={chatBusy}
          onMicPress={handleMicPress}
          isRecording={isRecording}
        />
      </KeyboardAvoidingView>

      <SessionsModal
        visible={isSessionsVisible}
        onClose={() => setIsSessionsVisible(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={selectSession}
        onDeleteSession={deleteSession}
        onRenameSession={renameSession}
        onNewChat={startNewChat}
      />

      <EditMessageModal
        visible={isEditModalVisible}
        onClose={() => {
          setIsEditModalVisible(false);
          setEditingMessage(null);
        }}
        message={editingMessage}
        onSave={handleSaveEditedMessage}
      />

      <Modal visible={isRecording} transparent animationType="slide">
        <View style={[styles.voiceModalContainer, { backgroundColor: colors.SURFACE }]}>
          <View style={styles.voiceHeader}>
            <Text style={[styles.voiceTitle, { color: colors.TEXT }]}>Ghi âm giọng nói</Text>
            <Pressable style={styles.voiceCloseBtn} onPress={handleMicPress}>
              <AppIcon name="close" size={24} color={colors.TEXT} />
            </Pressable>
          </View>

          <View style={styles.voiceBody}>
            <View style={styles.waveformContainer}>
              <WaveformBar color={colors.ACTION_VOICE || "#A855F7"} />
              <WaveformBar color={colors.ACTION_VOICE || "#A855F7"} />
              <WaveformBar color={colors.ACTION_VOICE || "#A855F7"} />
              <WaveformBar color={colors.ACTION_VOICE || "#A855F7"} />
              <WaveformBar color={colors.ACTION_VOICE || "#A855F7"} />
              <WaveformBar color={colors.ACTION_VOICE || "#A855F7"} />
              <WaveformBar color={colors.ACTION_VOICE || "#A855F7"} />
              <WaveformBar color={colors.ACTION_VOICE || "#A855F7"} />
            </View>

            <Text style={[styles.voiceDisclaimerText, { color: colors.TEXT_SECONDARY }]}>
              "Ghi âm được chuyển đổi sang văn bản ngay trên thiết bị này. Bằng cách nhấn ghi âm, bạn đồng ý chia sẻ văn bản đã chuyển đổi với SpendBee và Google Gemini."
            </Text>
          </View>

          <View style={styles.voiceFooter}>
            <Text style={[styles.voiceHintText, { color: colors.TEXT_SECONDARY }]}>Nhấn để dừng ghi âm</Text>
            <Pressable
              style={[styles.voiceMicButton, { backgroundColor: colors.ACTION_VOICE || "#A855F7" }]}
              onPress={handleMicPress}
            >
              <AppIcon name="mic" size={28} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.CHAT_BG
  },
  keyboardView: {
    flex: 1
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: COLORS.CHAT_BUBBLE,
    borderWidth: 1,
    borderColor: COLORS.CHAT_BORDER,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    marginTop: 6
  },
  loadingText: {
    color: COLORS.CHAT_MUTED,
    fontSize: 12
  },
  voiceModalContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  voiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 40 : 20,
  },
  voiceTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  voiceCloseBtn: {
    padding: 8,
  },
  voiceBody: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 80,
    marginBottom: 40,
  },
  voiceDisclaimerText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    fontStyle: "italic",
  },
  voiceFooter: {
    alignItems: "center",
    marginBottom: Platform.OS === "ios" ? 40 : 20,
  },
  voiceHintText: {
    fontSize: 14,
    marginBottom: 16,
    fontWeight: "500",
  },
  voiceMicButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
