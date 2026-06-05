import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, useAppColors } from "../../../constants/colors";
import AIConfirmationForm from "../AIConfirmationForm";
import { INTENT_ICONS, INTENT_LABELS } from "../../../utils/aiIntent";
import AssistantAvatar from "./AssistantAvatar";
import MarkdownContent from "./MarkdownContent";
import styles from "./styles";

export default function MessageBubble({
  message,
  onConfirm,
  onCancel,
  onUndo,
  onEditMessage,
  onRetry,
  isProcessing
}) {
  const colors = useAppColors();
  const isUser = message.sender === "user";
  const isBot = message.sender === "bot";
  const isSystem = message.isSystem;
  const isError = message.isError;
  const isStopInfo = isSystem && message.text === "⏹️ Đã dừng sinh phản hồi.";

  return (
    <View style={[styles.messageRow, isUser ? styles.userRow : styles.botRow]}>
      {!isUser && <AssistantAvatar />}

      {isUser && onEditMessage ? (
        <Pressable
          style={[styles.editButton, { borderColor: colors.CARD_BORDER }]}
          onPress={() => onEditMessage(message)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Chỉnh sửa tin nhắn"
        >
          <Ionicons name="create-outline" size={14} color={colors.TEXT_MUTED} />
        </Pressable>
      ) : null}

      <View style={[styles.messageColumn, isUser && styles.userColumn]}>
        <View
          style={[
            styles.bubble,
            isUser
              ? [styles.userBubble, { backgroundColor: colors.PRIMARY, borderColor: colors.PRIMARY }]
              : [styles.botBubble, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }],
            isSystem && [styles.systemBubble, { backgroundColor: colors.ROSE_MIST, borderColor: colors.CARD_BORDER }],
            isError && styles.errorBubble
          ]}
        >
          {message.isIntent && !message.isConfirmation ? (
            <AIConfirmationForm
              intent={message.intent}
              extractedFields={message.extractedFields}
              suggestedValues={message.suggestedValues}
              confirmationPrompt={message.confirmationPrompt}
              onConfirm={onConfirm}
              onCancel={onCancel}
              isProcessing={isProcessing}
            />
          ) : null}

          {message.isIntent && message.isConfirmation ? (
            <View style={styles.confirmedStatusWrapper}>
              <Text style={styles.confirmedStatusText}>
                {INTENT_ICONS[message.intent] || "✅"} {INTENT_LABELS[message.intent]} đã được xử lý
              </Text>
            </View>
          ) : null}

          {message.isUndoAction ? (
            <View style={styles.undoContainer}>
              <Text style={[styles.undoText, { color: colors.TEXT }]}>{message.text}</Text>
              <Pressable style={styles.undoBtn} onPress={() => onUndo(message.operationId)}>
                <View style={styles.btnIconRow}>
                  <Ionicons name="arrow-undo-outline" size={14} color="#4cdad9" />
                  <Text style={styles.undoBtnText}> Hoàn tác</Text>
                </View>
              </Pressable>
            </View>
          ) : null}

          {!message.isIntent && !message.isUndoAction ? (
            isUser ? (
              <Text style={[styles.messageText, { color: COLORS.WHITE }]}>{message.text}</Text>
            ) : (
              <MarkdownContent colors={colors} isError={isError} text={message.text} />
            )
          ) : null}

          {isBot && !message.isIntent && !isSystem && !isError && message.modelLabel ? (
            <Text style={[styles.modelFootprint, { color: colors.PRIMARY }]}>Nova Money · {message.modelLabel}</Text>
          ) : null}

          {(isError || isStopInfo) && onRetry ? (
            <Pressable
              style={styles.retryBtn}
              onPress={onRetry}
              accessibilityRole="button"
              accessibilityLabel="Thử lại tin nhắn"
            >
              <Ionicons name="refresh-outline" size={14} color={colors.PRIMARY} />
              <Text style={[styles.retryBtnText, { color: colors.PRIMARY }]}> Thử lại</Text>
            </Pressable>
          ) : null}
        </View>

        <Text style={[styles.timeText, { color: colors.TEXT_MUTED }, isUser && styles.userTime]}>
          {message.time}
        </Text>
      </View>
    </View>
  );
}
