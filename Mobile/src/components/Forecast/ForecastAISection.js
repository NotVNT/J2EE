import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { COLORS, useAppColors } from "../../constants/colors";
import { formatDate } from "../../utils/format";
import SectionHeader from "../ui/SectionHeader";

export default function ForecastAISection({
  narrative,
  generatedAt,
  hasError,
}) {
  const { t } = useTranslation();
  const colors = useAppColors();

  if (narrative) {
    return (
      <View style={styles.section}>
        <SectionHeader title={t("forecastComponents.aiAnalysis")} />
        <View style={[styles.insightCard, { backgroundColor: colors.CARD, borderColor: colors.PRIMARY_LIGHT }]}> 
          <Text style={[styles.insightText, { color: colors.TEXT }]}>{narrative}</Text>
          {generatedAt ? (
            <Text style={[styles.insightTime, { color: colors.TEXT_MUTED }]}>{formatDate(generatedAt)}</Text>
          ) : null}
        </View>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.section}>
        <View style={[styles.insightFallback, { backgroundColor: colors.WARNING_LIGHT, borderColor: colors.WARNING }]}> 
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.WARNING} />
            <Text style={[styles.insightFallbackText, { color: colors.TEXT }]}> 
              {t("forecastComponents.aiError")}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  insightCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 22,
  },
  insightTime: {
    fontSize: 10,
    marginTop: 10,
    textAlign: "right",
  },
  insightFallback: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  insightFallbackText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
});
