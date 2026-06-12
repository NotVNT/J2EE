import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppColors } from "../../constants/colors";
import AppIcon from "../ui/AppIcon";
import { scale } from "../../utils/layoutScale";

export default function AiInsightMonthNavigator({
  canGoNext,
  canGoPrev,
  disabled,
  goToNextMonth,
  goToPrevMonth,
  monthLabel
}) {
  const colors = useAppColors();

  return (
    <View style={[styles.monthRow, { backgroundColor: colors.BG, borderColor: colors.CARD_BORDER }]}>
      <Pressable
        onPress={goToPrevMonth}
        disabled={!canGoPrev || disabled}
        style={({ pressed }) => [
          styles.arrow,
          (!canGoPrev || disabled) && styles.arrowOff,
          pressed && canGoPrev && !disabled && { opacity: 0.6 }
        ]}
      >
        <AppIcon name="chevron-back" size={20} color={canGoPrev && !disabled ? colors.PRIMARY : colors.TEXT_MUTED} />
      </Pressable>

      <Text style={[styles.monthLabel, { color: colors.TEXT }]}>{monthLabel}</Text>

      <Pressable
        onPress={goToNextMonth}
        disabled={!canGoNext || disabled}
        style={({ pressed }) => [
          styles.arrow,
          (!canGoNext || disabled) && styles.arrowOff,
          pressed && canGoNext && !disabled && { opacity: 0.6 }
        ]}
      >
        <AppIcon name="chevron-forward" size={20} color={canGoNext && !disabled ? colors.PRIMARY : colors.TEXT_MUTED} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: "center",
    minWidth: scale(230),
    marginBottom: 2,
  },
  arrow: {
    width: 38,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12
  },
  arrowOff: {
    opacity: 0.25
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
    flex: 1
  }
});
