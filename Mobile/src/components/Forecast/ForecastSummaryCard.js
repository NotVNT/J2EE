import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, useAppColors } from "../../constants/colors";

/**
 * Compact summary metric card used in the forecast dashboard header row.
 *
 * @param {object}  props
 * @param {string}  props.icon   - Emoji icon or Ionicon name
 * @param {string}  props.label  - Metric label
 * @param {string}  props.value  - Main value display
 * @param {string}  [props.sub]  - Optional subtitle
 * @param {string}  [props.accent] - Accent border/text color
 */
export default function ForecastSummaryCard({ icon, label, value, sub, accent }) {
  const colors = useAppColors();

  const getIoniconName = (iconString) => {
    switch (iconString) {
      case "💰":
        return "wallet-outline";
      case "🔺":
        return "trending-up-outline";
      case "🔻":
        return "trending-down-outline";
      case "➖":
        return "remove-outline";
      case "📊":
        return "bar-chart-outline";
      case "🚨":
        return "alert-circle-outline";
      default:
        return iconString || "bar-chart-outline";
    }
  };

  const ioniconName = getIoniconName(icon);
  const iconColor = accent || colors.PRIMARY;

  return (
    <View style={[
      styles.card, 
      { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }, 
      accent ? { borderColor: accent, borderWidth: 1.5 } : null
    ]}>
      <View style={[styles.iconContainer, { backgroundColor: isDarkTheme(colors) ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)" }]}>
        <Ionicons name={ioniconName} size={20} color={iconColor} />
      </View>
      <Text style={[styles.label, { color: colors.TEXT_SECONDARY }]}>{label}</Text>
      <Text style={[styles.value, accent ? { color: accent } : { color: colors.TEXT }]} numberOfLines={1}>
        {value}
      </Text>
      {sub ? <Text style={[styles.sub, { color: colors.TEXT_MUTED }]}>{sub}</Text> : null}
    </View>
  );
}

function isDarkTheme(colors) {
  return colors.BG === "#0F0D0C";
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  value: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: 4,
    textAlign: "center",
  },
  sub: {
    fontSize: 10,
    marginTop: 2,
  },
});
