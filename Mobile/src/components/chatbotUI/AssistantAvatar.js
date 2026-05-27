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
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: COLORS.CHAT_PURPLE_SOFT,
    borderWidth: 1,
    borderColor: "rgba(255, 139, 221, 0.45)",
  },
  assistantAvatarText: {
    fontSize: 22,
  },
});
