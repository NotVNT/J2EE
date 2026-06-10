import React from "react";
import { StyleSheet, Text, TextInput } from "react-native";
import { COLORS, useAppColors } from "../../constants/colors";

export default function ProfileInfoFields({ email, fullName, setEmail, setFullName }) {
  const colors = useAppColors();

  return (
    <>
      <Text style={[styles.label, { color: colors.TEXT }]}>Họ và tên</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.BG, borderColor: colors.CARD_BORDER, color: colors.TEXT }]}
        value={fullName}
        onChangeText={setFullName}
        placeholder="Nguyễn Văn A"
        placeholderTextColor={colors.TEXT_MUTED}
      />

      <Text style={[styles.label, { color: colors.TEXT }]}>Email</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.BG, borderColor: colors.CARD_BORDER, color: colors.TEXT }]}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="tenban@example.com"
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
  }
});
