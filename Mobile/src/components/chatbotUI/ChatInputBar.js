import React from "react";
import { StyleSheet, Text, View, TextInput, Pressable, Platform } from "react-native";
import { COLORS } from "../../constants/colors";

export default function ChatInputBar({ value = "", onChangeText, onSend, placeholder, loading }) {
  const isSendDisabled = !value || !value.trim() || loading;

  return (
    <View style={styles.inputShell}>
      <View style={styles.inputInner}>
        <View style={styles.inputSparkle}>
          <Text style={styles.inputSparkleText}>✦</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.TEXT_SECONDARY}
          value={value}
          onChangeText={onChangeText}
          editable={!loading}
          multiline
        />

        <Pressable
          style={({ pressed }) => [
            styles.sendCircle,
            isSendDisabled && styles.sendCircleDisabled,
            pressed && !isSendDisabled && styles.sendCirclePressed,
          ]}
          onPress={onSend}
          disabled={isSendDisabled}
        >
          <Text style={[styles.sendIcon, isSendDisabled && styles.sendIconDisabled]}>➤</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputShell: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24
  },
  inputInner: {
    minHeight: 64,
    padding: 6,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 32,
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER,
    shadowColor: COLORS.PRIMARY,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  inputSparkle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center"
  },
  inputSparkleText: {
    fontSize: 18,
    color: "#ffb2bf", // active brand pink accent sparkles
    fontWeight: "bold"
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.TEXT,
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === "ios" ? 8 : 4,
    maxHeight: 76
  },
  sendCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.PRIMARY // brand primary pink
  },
  sendCirclePressed: {
    backgroundColor: "rgba(232, 89, 126, 0.85)", 
    transform: [{ scale: 0.96 }]
  },
  sendCircleDisabled: {
    backgroundColor: COLORS.CARD_BORDER
  },
  sendIcon: {
    fontSize: 14,
    color: COLORS.WHITE, // active send arrow is white
    fontWeight: "bold",
    marginLeft: 2
  },
  sendIconDisabled: {
    color: COLORS.TEXT_MUTED
  }
});
