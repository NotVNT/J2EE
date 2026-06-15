import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppColors } from "../../constants/colors";
import { scale } from "../../utils/layoutScale";

export default function ScreenBackHeader({ title, right = null, style }) {
  const colors = useAppColors();

  return (
    <View style={[styles.header, style]}>
      <View style={styles.sideSlot} />

      <Text style={[styles.title, { color: colors.TEXT }]} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.sideSlot}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: scale(44),
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(14),
  },
  sideSlot: {
    width: scale(40),
    minHeight: scale(40),
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    flex: 1,
    marginHorizontal: scale(12),
    textAlign: "center",
    fontSize: scale(18),
    fontWeight: "800",
  },
});
