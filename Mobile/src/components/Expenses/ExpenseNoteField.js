import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { COLORS, useAppColors } from "../../constants/colors";

export default function ExpenseNoteField({
  value = "",
  onChange,
  onVoiceResult,
  placeholder,
  multiline = true
}) {
  const { t } = useTranslation();
  const colors = useAppColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.TEXT }]}>
        <Text style={styles.labelIcon}>📝</Text> {t("expenseForm.noteSection")}
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER, color: colors.TEXT }, multiline && styles.inputMultiline]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder || t("expenseForm.noteSection")}
          placeholderTextColor={colors.TEXT_MUTED}
          multiline={multiline}
          textAlignVertical="top"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12
  },
  label: {
    color: COLORS.TEXT,
    marginBottom: 6,
    fontWeight: "600"
  },
  labelIcon: {
    fontSize: 14
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: COLORS.TEXT
  },
  inputMultiline: {
    minHeight: 60,
    maxHeight: 120
  }
});
