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
    marginHorizontal: 16,
    marginTop: 16,
    height: 52,
    padding: 4,
    flexDirection: "row",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER,
    backgroundColor: COLORS.CARD
  },
  modeTab: {
    flex: 1,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6
  },
  modeTabActive: {
    backgroundColor: COLORS.PRIMARY, // active pill background is beautiful brand pink
    borderWidth: 1,
    borderColor: COLORS.PRIMARY_LIGHT,
    shadowColor: COLORS.PRIMARY,
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3
  },
  modeIcon: {
    fontSize: 15
  },
  modeText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.TEXT_SECONDARY
  },
  modeTextActive: {
    color: COLORS.WHITE // crisp white contrast on active primary pink pill
  }
});
