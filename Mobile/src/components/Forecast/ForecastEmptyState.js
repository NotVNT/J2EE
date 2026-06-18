import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppColors } from "../../constants/colors";
import AppIcon from "../ui/AppIcon";
import { scale } from "../../utils/layoutScale";

export default function ForecastEmptyState({ message }) {
  const { t } = useTranslation();
  const colors = useAppColors();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.INFO_LIGHT || "rgba(107,155,210,0.15)" }]}>
        <AppIcon name="bar-chart-outline" size={28} color={colors.INFO || "#6B9BD2"} />
      </View>
      <Text style={[styles.text, { color: colors.TEXT_SECONDARY }]}>
        {message || t("forecastComponents.noForecastData")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: scale(40),
    paddingHorizontal: scale(24),
  },
  iconContainer: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scale(12),
  },
  text: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 18,
  },
});
