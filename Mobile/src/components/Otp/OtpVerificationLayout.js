import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { COLORS } from "../../constants/colors";
import { scale } from "../../utils/layoutScale";
import { useTranslation } from "react-i18next";

export default function OtpVerificationLayout({
  title,
  subtitle,
  email,
  children,
  error,
  actionLabel,
  actionLoading,
  actionDisabled,
  onAction,
  resendDisabled,
  countdown,
  onResend,
}) {
  const { t } = useTranslation();

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.bgGlowTop} />
      <View style={styles.bgGlowBottom} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.emailText}>{email}</Text>

        <View style={styles.formCard}>
          {children}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            style={[styles.actionButton, actionDisabled && styles.actionButtonDisabled]}
            onPress={onAction}
            disabled={actionDisabled}
          >
            <Text style={styles.actionButtonText}>
              {actionLoading ? t("auth.common.verifying") : actionLabel || t("auth.common.verify")}
            </Text>
          </Pressable>

          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>{t("auth.common.noCode")}</Text>
            <Pressable onPress={onResend} disabled={resendDisabled}>
              <Text style={[styles.resendLink, resendDisabled && styles.resendLinkDisabled]}>
                {resendDisabled ? `${t("auth.common.resend")} (${countdown}s)` : t("auth.common.resend")}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.DARK_BG,
  },
  bgGlowTop: {
    position: "absolute",
    top: -120,
    left: -100,
    width: scale(300),
    height: scale(300),
    borderRadius: scale(150),
    backgroundColor: COLORS.PRIMARY_GLOW,
  },
  bgGlowBottom: {
    position: "absolute",
    right: -140,
    bottom: -120,
    width: scale(320),
    height: scale(320),
    borderRadius: scale(160),
    backgroundColor: COLORS.PRIMARY_GLOW,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: scale(20),
    paddingVertical: scale(40),
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.DARK_TEXT,
    textAlign: "center",
    marginBottom: scale(6),
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.DARK_TEXT_SECONDARY,
    textAlign: "center",
    marginBottom: scale(4),
  },
  emailText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.DARK_TEXT,
    textAlign: "center",
    marginBottom: scale(24),
  },
  formCard: {
    backgroundColor: COLORS.DARK_CARD,
    borderRadius: scale(18),
    borderWidth: 1,
    borderColor: COLORS.DARK_BORDER_LIGHT,
    padding: scale(24),
    gap: scale(16),
  },
  errorText: {
    color: COLORS.EXPENSE_LIGHT,
    fontSize: 13,
    textAlign: "center",
    backgroundColor: "rgba(231, 111, 81, 0.2)",
    borderRadius: scale(10),
    paddingVertical: scale(10),
    paddingHorizontal: scale(14),
    borderWidth: 1,
    borderColor: "rgba(231, 111, 81, 0.3)",
    overflow: "hidden",
  },
  actionButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: scale(12),
    height: scale(50),
    alignItems: "center",
    justifyContent: "center",
    marginTop: scale(4),
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: scale(8),
    elevation: 4,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: COLORS.WHITE || "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: scale(4),
  },
  resendLabel: {
    color: COLORS.DARK_TEXT_SECONDARY,
    fontSize: 13,
  },
  resendLink: {
    color: COLORS.PRIMARY_LIGHT,
    fontSize: 13,
    fontWeight: "700",
  },
  resendLinkDisabled: {
    color: COLORS.EXPENSE_LIGHT,
  },
});
