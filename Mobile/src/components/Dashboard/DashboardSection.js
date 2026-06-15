import React from "react";
import { StyleSheet, Text, View } from "react-native";
import ShowMoreButton from "../common/ShowMoreButton";
import { COLORS, useAppColors } from "../../constants/colors";
import { clampScale, scale } from "../../utils/layoutScale";

export function DashboardSectionHeader({ title, children }) {
  const colors = useAppColors();

  return (
    <View style={styles.sectionHeader}>
      <View style={styles.titleRow}>
        <View style={[styles.decorator, { backgroundColor: colors.PRIMARY }]} />
        <Text style={[styles.sectionTitle, { color: colors.TEXT }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export function DashboardSectionCard({ children }) {
  const colors = useAppColors();

  return (
    <View
      style={[
        styles.sectionCard,
        {
          backgroundColor: colors.SURFACE_ELEVATED || colors.CARD,
          borderColor: colors.CARD_BORDER,
          shadowColor: colors.SHADOW_COLOR || "#000",
        },
      ]}
    >
      {children}
    </View>
  );
}

export function ToggleSectionHeader({ title, visible, expanded, onPress }) {
  return (
    <DashboardSectionHeader title={title}>
      <ShowMoreButton visible={visible} expanded={expanded} onPress={onPress} />
    </DashboardSectionHeader>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: scale(10),
    marginBottom: scale(4),
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  decorator: {
    width: scale(4),
    height: scale(15),
    borderRadius: scale(2),
    marginRight: scale(6),
  },
  sectionTitle: {
    color: COLORS.TEXT,
    fontSize: clampScale(17, 15, 19),
    fontWeight: "800"
  },
  sectionCard: {
    borderRadius: scale(16),
    borderWidth: 1,
    padding: scale(16),
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.08,
    shadowRadius: scale(12),
    elevation: scale(3),
    marginBottom: scale(6),
  }
});
