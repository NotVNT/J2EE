import React from "react";
import { StyleSheet, Text, View, TextInput, Pressable, Platform } from "react-native";
import { COLORS } from "../../constants/colors";

export default function ChatInputBar({ value, onChangeText, onSend, placeholder, loading }) {
  return (
    <View style={styles.inputShell}>
      <View style={styles.inputInner}>
        <View style={styles.inputSparkle}>
          <Text style={styles.inputSparkleText}>✦</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.CHAT_MUTED}
          value={value}
          onChangeText={onChangeText}
          editable={!loading}
          multiline
        />

        <Pressable
          style={[
            styles.sendCircle,
            (!value.trim() || loading) && styles.sendCircleDisabled,
          ]}
          onPress={onSend}
          disabled={!value.trim() || loading}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputShell: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
  },
  inputInner: {
    minHeight: 76,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 38,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderWidth: 1,
    borderColor: COLORS.CHAT_BORDER,
    shadowColor: COLORS.CHAT_PURPLE,
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  inputSparkle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  inputSparkleText: {
    fontSize: 18,
    color: COLORS.CHAT_PURPLE,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.CHAT_TEXT,
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    maxHeight: 80,
  },
  sendCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.CHAT_PURPLE,
  },
  sendCircleDisabled: {
    backgroundColor: COLORS.CHAT_MUTED,
  },
  sendIcon: {
    fontSize: 18,
    color: COLORS.WHITE,
    fontWeight: "700",
  },
});
