import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { COLORS } from "../../constants/colors";
import AIConfirmationForm from "../AIConfirmationForm";
import AssistantAvatar from "./AssistantAvatar";
import { INTENT_ICONS, INTENT_LABELS } from "../../utils/aiIntentParser";

// Helper to format/clean markdown formatting for React Native Text display
const cleanMarkdown = (text) => {
  if (!text) return "";
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  cleaned = cleaned.replace(/\*\*/g, "");
  cleaned = cleaned.replace(/>/g, "▎");
  return cleaned;
};

export default function MessageBubble({ message, onConfirm, onCancel, onUndo, isProcessing }) {
  const isUser = message.sender === "user";
  const isBot = message.sender === "bot";
  const isSystem = message.isSystem;
  const isError = message.isError;

  return (
    <View style={[styles.messageRow, isUser ? styles.userRow : styles.botRow]}>
      {!isUser && <AssistantAvatar />}
      <View style={[styles.messageColumn, isUser && styles.userColumn]}>
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.botBubble,
            isSystem && styles.systemBubble,
            isError && styles.errorBubble,
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
            <Text
              style={[
                styles.messageText,
                isUser ? styles.userText : isError ? styles.errorText : styles.botText,
              ]}
            >
              {isUser ? message.text : cleanMarkdown(message.text)}
            </Text>
          )}

          {/* Model footprint label */}
          {isBot && !message.isIntent && !isSystem && !isError && message.modelLabel && (
            <Text style={styles.modelFootprint}>Nova Money · {message.modelLabel}</Text>
          )}
        </View>
        <Text style={[styles.timeText, isUser && styles.userTime]}>
          {message.time}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageRow: {
    width: "100%",
    flexDirection: "row",
    marginBottom: 18,
  },
  botRow: {
    alignItems: "flex-start",
  },
  userRow: {
    justifyContent: "flex-end",
  },
  messageColumn: {
    flexShrink: 1,
  },
  userColumn: {
    alignItems: "flex-end",
  },
  bubble: {
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 14,
    maxWidth: "86%",
  },
  userBubble: {
    maxWidth: "82%",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 22,
    backgroundColor: COLORS.CHAT_PURPLE,
  },
  botBubble: {
    maxWidth: "86%",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 22,
    backgroundColor: COLORS.CHAT_BUBBLE,
    borderWidth: 1,
    borderColor: "rgba(20, 7, 31, 0.06)",
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  systemBubble: {
    backgroundColor: COLORS.CHAT_PURPLE_SOFT,
    borderWidth: 1,
    borderColor: COLORS.CHAT_BORDER,
    borderStyle: "dashed",
  },
  errorBubble: {
    backgroundColor: COLORS.EXPENSE_LIGHT,
    borderColor: COLORS.EXPENSE,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  userText: {
    color: COLORS.WHITE,
  },
  botText: {
    color: COLORS.CHAT_TEXT,
  },
  errorText: {
    color: COLORS.EXPENSE,
    fontWeight: "600",
  },
  modelFootprint: {
    fontSize: 9,
    color: COLORS.CHAT_MUTED,
    marginTop: 4,
    fontStyle: "italic",
    alignSelf: "flex-start",
  },
  timeText: {
    fontSize: 9,
    marginTop: 3,
    color: COLORS.CHAT_MUTED,
    marginLeft: 2,
  },
  userTime: {
    marginLeft: 0,
    marginRight: 2,
  },
  confirmedStatusWrapper: {
    paddingVertical: 4,
  },
  confirmedStatusText: {
    fontSize: 12,
    color: COLORS.INCOME,
    fontWeight: "700",
  },
  undoContainer: {
    gap: 6,
  },
  undoText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  undoBtn: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.CHAT_PURPLE_SOFT,
    borderWidth: 1,
    borderColor: COLORS.CHAT_PURPLE,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  undoBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.CHAT_PURPLE,
  },
});
