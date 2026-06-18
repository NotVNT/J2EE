import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppColors } from "../../constants/colors";
import { formatJarMoney, getJarActualPercent, getJarProgressWidth } from "../../utils/jar";
import { scale } from "../../utils/layoutScale";

export default function JarCard({ item, totalBalance, onPress }) {
  const colors = useAppColors();
  const { t } = useTranslation();
  const { name, icon, color, targetPercentage, currentBalance } = item;
  const actualPercent = getJarActualPercent(currentBalance, totalBalance);
  const progressWidth = getJarProgressWidth(currentBalance, totalBalance);
  const isNegative = currentBalance < 0;
  const isMet = parseFloat(actualPercent) >= (targetPercentage ?? 0);

  return (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: colors.CARD,
          borderColor: colors.CARD_BORDER,
          shadowColor: colors.SHADOW_COLOR || "#000",
        },
      ]}
      onPress={onPress}
    >
      <View style={[styles.cardAccentBar, { backgroundColor: color || colors.PRIMARY }]} />
      <View style={styles.cardHeader}>
        <View style={styles.cardInfoCol}>
          <View style={[styles.iconContainer, { backgroundColor: (color || colors.PRIMARY) + "18" }]}>
            <Text style={styles.iconText}>{icon || "🏺"}</Text>
          </View>
          <View style={styles.cardTitleWrap}>
            <Text style={[styles.cardName, { color: colors.TEXT }]} numberOfLines={1}>{name}</Text>
            <Text style={[styles.cardTarget, { color: colors.TEXT_SECONDARY }]}>{t("jarCard.target")} {targetPercentage ?? 0}%</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: isMet ? colors.INCOME_LIGHT : colors.WARNING_LIGHT, borderColor: isMet ? colors.INCOME : colors.WARNING }]}>
          <Text style={[styles.statusBadgeText, { color: isMet ? colors.INCOME : colors.WARNING }]}>
            {isMet ? t("jarCard.reachedTarget") : t("jarCard.belowTarget")}
          </Text>
        </View>
      </View>
      <Text style={[styles.cardBalance, { color: colors.TEXT }, isNegative && { color: colors.EXPENSE }]}>{formatJarMoney(currentBalance)}</Text>
      <View style={styles.progressRow}>
        <Text style={[styles.progressLabel, { color: colors.TEXT_MUTED }]}>{t("jarCard.actualRatio")}</Text>
        <Text style={[styles.progressValue, { color: color || colors.PRIMARY }]}>{actualPercent}% / {targetPercentage ?? 0}%</Text>
      </View>
      <View style={[styles.progressBarBg, { backgroundColor: colors.CARD_BORDER }]}>
        <View style={[styles.progressBarFill, { width: `${progressWidth}%`, backgroundColor: isNegative ? colors.EXPENSE : color || colors.PRIMARY }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: scale(14),
    marginBottom: scale(12),
    position: "relative",
    overflow: "hidden",
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.05,
    shadowRadius: scale(8),
    elevation: 2,
  },
  cardAccentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardInfoCol: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(10),
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(10),
  },
  iconText: {
    fontSize: 20,
  },
  cardTitleWrap: {
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontWeight: "800",
  },
  cardTarget: {
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  cardBalance: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: scale(10),
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: scale(8),
  },
  progressLabel: {
    fontSize: 11,
  },
  progressValue: {
    fontSize: 11,
    fontWeight: "700",
  },
  progressBarBg: {
    height: scale(6),
    borderRadius: scale(3),
    overflow: "hidden",
    marginTop: scale(6),
  },
  progressBarFill: {
    height: "100%",
    borderRadius: scale(3),
  }
});
