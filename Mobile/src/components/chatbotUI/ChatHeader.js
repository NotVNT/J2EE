import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../../constants/colors";

export default function ChatHeader({ onOpenSettings }) {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <Pressable
        style={styles.headerIconButton}
        onPress={() => navigation.goBack()}
        android_ripple={{ color: COLORS.CHAT_PURPLE_LIGHT, borderless: true, radius: 22 }}
      >
        <Text style={styles.headerIcon}>←</Text>
      </Pressable>

      <Text style={styles.headerTitle}>AI Chat</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 72,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.CHAT_BUBBLE,
    borderWidth: 1,
    borderColor: COLORS.CHAT_BORDER,
  },
  headerIcon: {
    fontSize: 20,
    color: COLORS.CHAT_PURPLE,
    fontWeight: "700",
  },
  headerTitle: {
    flex: 1,
    color: COLORS.CHAT_TEXT,
    fontSize: 20,
    fontWeight: "800",
    marginLeft: 16,
  },
  filterButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.CHAT_BUBBLE,
    borderWidth: 1,
    borderColor: COLORS.CHAT_BORDER,
    shadowColor: COLORS.CHAT_SHADOW,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  filterIcon: {
    fontSize: 20,
    color: COLORS.CHAT_PURPLE,
    fontWeight: "600",
  },
});
