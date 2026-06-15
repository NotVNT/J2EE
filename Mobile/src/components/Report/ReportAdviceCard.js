import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, useAppColors } from "../../constants/colors";

export default function ReportAdviceCard({ strengths, improvements }) {
  const colors = useAppColors();
  const hasStrengths = strengths && strengths.length > 0;
  const hasImprovements = improvements && improvements.length > 0;

  if (!hasStrengths && !hasImprovements) return null;

  return (
    <View style={[styles.card, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}> 
      <View style={styles.cardHeader}>
        <Ionicons name="bulb-outline" size={18} color={colors.PRIMARY} />
        <Text style={[styles.cardTitle, { color: colors.TEXT }]}>Đánh giá & Khuyến nghị</Text>
      </View>

      {hasStrengths && strengths.map((str, idx) => (
        <View key={`str-${idx}`} style={styles.tipRow}>
          <Ionicons name="checkmark-circle" size={16} color={colors.INCOME} style={{ marginTop: 1 }} />
          <Text style={[styles.tipText, { color: colors.TEXT_SECONDARY }]}>{str}</Text>
        </View>
      ))}

      {hasImprovements && improvements.map((imp, idx) => (
        <View key={`imp-${idx}`} style={styles.tipRow}>
          <Ionicons name="warning" size={16} color={colors.EXPENSE} style={{ marginTop: 1 }} />
          <Text style={[styles.tipText, { color: colors.TEXT_SECONDARY }]}>{imp}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginVertical: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
