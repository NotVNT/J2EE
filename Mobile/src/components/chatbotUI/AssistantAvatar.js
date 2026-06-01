import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../constants/colors";

export default function AssistantAvatar() {
  return (
    <View style={styles.assistantAvatar}>
      <Text style={styles.assistantAvatarText}>🤖</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  assistantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: COLORS.ROSE_MIST,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER,
    shadowColor: COLORS.PRIMARY,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  assistantAvatarText: {
    fontSize: 18,
  },
});
