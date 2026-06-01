import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../../constants/colors";

export default function ChatHeader({ children }) {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Pressable
          style={({ pressed }) => [styles.headerIconButton, pressed && styles.headerIconButtonPressed]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerIcon}>←</Text>
        </Pressable>

        <Text style={styles.headerTitle}>AI Chat</Text>
      </View>

      <View style={styles.headerRight}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.CARD_BORDER,
    backgroundColor: COLORS.BG,
    zIndex: 150,
    elevation: 5
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center"
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER
  },
  headerIconButtonPressed: {
    opacity: 0.82,
    backgroundColor: COLORS.ROSE_MIST
  },
  headerIcon: {
    fontSize: 16,
    color: COLORS.PRIMARY, // active brand pink
    fontWeight: "bold",
    marginTop: -2
  },
  headerTitle: {
    color: COLORS.PRIMARY, // active brand pink (matches mockup!)
    fontSize: 20,
    fontWeight: "800",
    textAlign: "left"
  }
});
