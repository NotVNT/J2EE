import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";

export default function AuthScaffold({
  badgeText,
  heroTitle,
  heroSubtitle,
  formTitle,
  formSubtitle,
  footer,
  children
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundTopBlob} />
      <View style={styles.backgroundBottomBlob} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboardContainer}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroCircleLarge} />
            <View style={styles.heroCircleSmall} />
            <Text style={styles.heroBadge}>{badgeText}</Text>
            <Text style={styles.heroTitle}>{heroTitle}</Text>
            <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>{formTitle}</Text>
            <Text style={styles.formSubtitle}>{formSubtitle}</Text>
            {children}
          </View>

          {footer ? <View style={styles.footerContainer}>{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export const authStyles = StyleSheet.create({
  inputGroup: {
    marginTop: 16
  },
  inputHeaderRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  inputLabel: {
    color: COLORS.TEXT,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER,
    backgroundColor: COLORS.BG,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: COLORS.TEXT
  },
  inlineLink: {
    color: COLORS.PRIMARY_LIGHT,
    fontSize: 13,
    fontWeight: "600"
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center"
  },
  primaryButtonDisabled: {
    opacity: 0.65
  },
  primaryButtonText: {
    color: COLORS.WHITE,
    fontSize: 15,
    fontWeight: "700"
  },
  helperText: {
    color: COLORS.TEXT_SECONDARY,
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18
  },
  statusPill: {
    marginTop: 14,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "600"
  },
  statusPending: {
    backgroundColor: COLORS.WARNING_LIGHT,
    color: COLORS.WARNING
  },
  statusSuccess: {
    backgroundColor: COLORS.INCOME_LIGHT,
    color: COLORS.INCOME
  },
  statusError: {
    backgroundColor: COLORS.EXPENSE_LIGHT,
    color: COLORS.EXPENSE
  },
  apiHint: {
    marginTop: 8,
    color: COLORS.TEXT_MUTED,
    fontSize: 11
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  footerText: {
    color: COLORS.TEXT_SECONDARY,
    marginRight: 6
  },
  footerLink: {
    color: "#1d6d52",
    fontWeight: "700"
  }
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f7ee"
  },
  keyboardContainer: {
    flex: 1
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: "center"
  },
  backgroundTopBlob: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    top: -170,
    right: -120,
    backgroundColor: "#c4e5cb"
  },
  backgroundBottomBlob: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    bottom: -170,
    left: -120,
    backgroundColor: "#f8d8a8"
  },
  heroCard: {
    borderRadius: 26,
    padding: 22,
    backgroundColor: "#114849",
    overflow: "hidden",
    shadowColor: "#0b3430",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 8
  },
  heroCircleLarge: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -90,
    right: -60,
    backgroundColor: "rgba(255, 255, 255, 0.14)"
  },
  heroCircleSmall: {
    position: "absolute",
    width: 82,
    height: 82,
    borderRadius: 41,
    bottom: -20,
    right: 20,
    backgroundColor: "rgba(248, 216, 168, 0.32)"
  },
  heroBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    color: "#f9fcf8",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 12
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800"
  },
  heroSubtitle: {
    color: "#d5ece7",
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21
  },
  formCard: {
    marginTop: 18,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    padding: 22,
    shadowColor: "#19322f",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 5
  },
  formTitle: {
    color: "#18332d",
    fontSize: 24,
    fontWeight: "700"
  },
  formSubtitle: {
    color: "#5d736c",
    marginTop: 6,
    lineHeight: 20
  },
  footerContainer: {
    marginTop: 18,
    paddingBottom: 8
  }
});