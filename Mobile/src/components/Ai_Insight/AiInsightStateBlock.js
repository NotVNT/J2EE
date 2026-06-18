import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppColors } from "../../constants/colors";
import AppIcon from "../ui/AppIcon";
import { scale } from "../../utils/layoutScale";

export default function AiInsightStateBlock({ error, loading, onRetry }) {
  const colors = useAppColors();
  const { t } = useTranslation();

  if (loading) {
    return (
      <View style={[styles.stateBox, { backgroundColor: colors.BG, borderColor: colors.CARD_BORDER }]}>
        <ActivityIndicator size="large" color={colors.PRIMARY} />
        <Text style={[styles.stateText, { color: colors.TEXT_SECONDARY }]}>{t("aiInsightStateBlock.analyzing")}</Text>
      </View>
    );
  }

  if (!error) {
    return null;
  }

  return (
    <View style={[styles.stateBox, { backgroundColor: colors.BG, borderColor: colors.CARD_BORDER }]}>
      <AppIcon name="warning-outline" size={26} color={colors.EXPENSE_COLOR || colors.EXPENSE} style={{ marginBottom: 4 }} />
      <Text style={[styles.stateText, { color: colors.TEXT_SECONDARY }]}>{error}</Text>
      <Pressable 
        style={({ pressed }) => [
          styles.retryBtn, 
          { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER },
          pressed && { opacity: 0.8 }
        ]} 
        onPress={onRetry}
      >
        <Text style={[styles.retryBtnText, { color: colors.PRIMARY }]}>{t("aiInsightStateBlock.retry")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  stateBox: {
    alignItems: "center",
    paddingVertical: scale(20),
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    width: "100%",
    justifyContent: "center"
  },
  stateText: {
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 12,
    lineHeight: 18
  },
  retryBtn: {
    marginTop: 6,
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1
  },
  retryBtnText: {
    fontSize: 13,
    fontWeight: "800"
  }
});
