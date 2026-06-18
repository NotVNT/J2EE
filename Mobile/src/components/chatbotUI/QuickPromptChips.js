import React from "react";
import { StyleSheet, Text, View, Pressable, FlatList } from "react-native";
import { useTranslation } from "react-i18next";
import { COLORS, useAppColors } from "../../constants/colors";

const QUICK_ACTIONS = [
  {
    labelKey: "chatbot.promptSavings",
    textKey: "chatbot.promptSavings",
  },
  {
    labelKey: "chatbot.promptSpending",
    textKey: "chatbot.promptSpending",
  },
  {
    labelKey: "chatbot.promptWorry",
    textKey: "chatbot.promptWorry",
  },
  {
    labelKey: "chatbot.promptPlan",
    textKey: "chatbot.promptPlan",
  },
];

export default function QuickPromptChips({ onSelect }) {
  const { t } = useTranslation();
  const colors = useAppColors();
  const actions = QUICK_ACTIONS.map(a => ({ ...a, label: t(a.labelKey), text: t(a.textKey) }));

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.TEXT_MUTED }]}>{t("chatbot.promptTitle")}</Text>
      <FlatList
        data={actions}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.label}
        contentContainerStyle={styles.chipsScroll}
        renderItem={({ item }) => (
          <Pressable 
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: colors.CARD,
                borderColor: colors.CHAT_BORDER,
                shadowColor: colors.PRIMARY,
              },
              pressed && styles.chipPressed
            ]} 
            onPress={() => onSelect(item)}
          >
            <Text style={[styles.chipText, { color: colors.PRIMARY }]}>{item.label}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 12
  },
  title: {
    fontSize: 11,
    fontWeight: "750",
    color: COLORS.TEXT_SECONDARY,
    paddingHorizontal: 16,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1.1
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8
  },
  chip: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER,
    shadowColor: COLORS.PRIMARY,
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 1
  },
  chipPressed: {
    opacity: 0.85,
    backgroundColor: COLORS.ROSE_MIST,
    borderColor: "rgba(232, 89, 126, 0.35)"
  },
  chipText: {
    color: COLORS.PRIMARY,
    fontSize: 13,
    fontWeight: "600"
  }
});
