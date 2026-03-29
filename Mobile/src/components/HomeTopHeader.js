import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeTopHeader({ onMenuPress, onBellPress }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 8) }]}>
      <Pressable style={styles.iconButton} onPress={onMenuPress}>
        <Text style={styles.iconText}>☰</Text>
      </Pressable>

      <Text style={styles.title}>Tổng quan tài chính</Text>

      <Pressable style={styles.iconButton} onPress={onBellPress}>
        <Text style={styles.iconText}>🔔</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8
  },
  title: {
    color: "#0f172a",
    fontSize: 23,
    fontWeight: "800",
    flex: 1,
    textAlign: "center"
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe3f2"
  },
  iconText: {
    fontSize: 18
  }
});
