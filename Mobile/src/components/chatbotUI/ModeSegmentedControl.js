import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { COLORS } from "../../constants/colors";

export default function ModeSegmentedControl({ activeMode, isFreePlan, onChangeMode }) {
  const modes = [
    { value: "chat", label: "Chat", icon: "💬" },
    { value: "agent", label: isFreePlan ? "Agent 🔒" : "Agent", icon: "🤖" },
  ];

  return (
    <View style={styles.modeContainer}>
      {modes.map((mode) => {
        const isActive = activeMode === mode.value;
        return (
          <Pressable
            key={mode.value}
            style={[styles.modeTab, isActive && styles.modeTabActive]}
            onPress={() => onChangeMode(mode.value)}
          >
            <Text style={[styles.modeIcon]}>{mode.icon}</Text>
            <Text style={[styles.modeText, isActive && styles.modeTextActive]}>
              {mode.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  modeContainer: {
    marginHorizontal: 24,
    height: 64,
    padding: 4,
    flexDirection: "row",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: COLORS.CHAT_BORDER,
    backgroundColor: "rgba(255, 255, 255, 0.72)",
  },
  modeTab: {
    flex: 1,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  modeTabActive: {
    backgroundColor: COLORS.CHAT_BUBBLE,
    borderWidth: 1,
    borderColor: "rgba(255, 139, 221, 0.6)",
    shadowColor: COLORS.CHAT_PINK,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  modeIcon: {
    fontSize: 16,
  },
  modeText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.CHAT_MUTED,
  },
  modeTextActive: {
    color: COLORS.CHAT_PURPLE,
  },
});
