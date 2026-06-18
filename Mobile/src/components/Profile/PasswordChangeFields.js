import React from "react";
import { Pressable, StyleSheet, Text, TextInput } from "react-native";
import { useTranslation } from "react-i18next";
import { COLORS, useAppColors } from "../../constants/colors";

export default function PasswordChangeFields({
  confirmPassword,
  currentPassword,
  newPassword,
  setConfirmPassword,
  setCurrentPassword,
  setNewPassword,
  setShowPasswordFields,
  showPasswordFields
}) {
  const colors = useAppColors();
  const { t } = useTranslation();

  if (!showPasswordFields) {
    return (
      <Pressable style={[styles.secondaryButton, { borderColor: colors.PRIMARY_GLOW, backgroundColor: colors.PRIMARY_GLOW_STRONG ? colors.PRIMARY_GLOW : "rgba(239, 94, 131, 0.04)" }]} onPress={() => setShowPasswordFields(true)}>
        <Text style={[styles.secondaryButtonText, { color: colors.PRIMARY }]}>{t("passwordFields.buttonTitle")}</Text>
      </Pressable>
    );
  }

  return (
    <>
      <Text style={[styles.label, { color: colors.TEXT }]}>{t("passwordFields.currentPassword")}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.BG, borderColor: colors.CARD_BORDER, color: colors.TEXT }]}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
        placeholder={t("passwordFields.currentPasswordPlaceholder")}
        placeholderTextColor={colors.TEXT_MUTED}
      />

      <Text style={[styles.label, { color: colors.TEXT }]}>{t("auth.password.newPassword")}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.BG, borderColor: colors.CARD_BORDER, color: colors.TEXT }]}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        placeholder={t("passwordFields.newPasswordPlaceholder")}
        placeholderTextColor={colors.TEXT_MUTED}
      />

      <Text style={[styles.label, { color: colors.TEXT }]}>{t("passwordFields.confirmPassword")}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.BG, borderColor: colors.CARD_BORDER, color: colors.TEXT }]}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        placeholder={t("passwordFields.confirmPasswordPlaceholder")}
        placeholderTextColor={colors.TEXT_MUTED}
      />
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    color: COLORS.TEXT,
    marginBottom: 8,
    fontWeight: "600",
    fontSize: 14
  },
  input: {
    backgroundColor: COLORS.BG,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER,
    color: COLORS.TEXT,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 14
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 94, 131, 0.25)",
    backgroundColor: "rgba(239, 94, 131, 0.04)",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 16
  },
  secondaryButtonText: {
    color: COLORS.PRIMARY,
    fontWeight: "700",
    fontSize: 14
  }
});
