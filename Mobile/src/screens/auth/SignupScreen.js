import React, { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import apiClient from "../../services/apiClient";
import { API_ENDPOINTS } from "../../constants/api";
import { getApiErrorMessage } from "../../utils/format";
import {
  getActivationEmail,
  isActivationRequiredError,
  openActivationOtp
} from "../../utils/authActivation";
import appLogo from "../../assets/logo&banner/applogo.png";
import { COLORS } from "../../constants/colors";
import { scale, clampScale } from "../../utils/layoutScale";

export default function SignupScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);

  const showActivationOption = (activationEmail) => {
    Alert.alert(
      t("auth.common.activationRequiredTitle"),
      t("auth.signup.activationMessage"),
      [
        { text: t("auth.common.later"), style: "cancel" },
        {
          text: t("auth.common.verifyOtp"),
          onPress: async () => {
            try {
              await openActivationOtp(navigation, activationEmail);
            } catch (error) {
              const message = getApiErrorMessage(error, t("auth.common.resendOtpFailed"));
              Alert.alert(t("auth.common.cannotResendOtp"), message);
            }
          }
        }
      ]
    );
  };

  const onSubmit = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      Alert.alert(t("auth.signup.missingTitle"), t("auth.signup.missingEmail"));
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(API_ENDPOINTS.REGISTER, {
        email: normalizedEmail
      });

      navigation.navigate("VerifyOtp", { email: normalizedEmail });
    } catch (error) {
      if (isActivationRequiredError(error)) {
        showActivationOption(getActivationEmail(error, normalizedEmail));
        return;
      }

      const message = getApiErrorMessage(error, t("auth.signup.failedMessage"));
      Alert.alert(t("auth.signup.failedTitle"), message);
    } finally {
      setLoading(false);
    }
  };

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
        <View style={styles.brandRow}>
          <Image source={appLogo} style={styles.brandLogo} resizeMode="contain" />
        </View>

        <Text style={styles.title}>{t("auth.signup.title")}</Text>
        <Text style={styles.subtitle}>{t("auth.signup.subtitle")}</Text>

        <View style={styles.formCard}>
          <View style={[styles.inputWrap, isFocusedEmail && { borderColor: COLORS.PRIMARY }]}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder={t("auth.common.email")}
              placeholderTextColor="#7f9085"
              onFocus={() => setIsFocusedEmail(true)}
              onBlur={() => setIsFocusedEmail(false)}
            />
          </View>

          <Pressable
            style={[styles.actionButton, loading && styles.actionButtonDisabled]}
            onPress={onSubmit}
            disabled={loading}
          >
            <Text style={styles.actionButtonText}>{loading ? t("auth.common.processing") : t("auth.common.next")}</Text>
          </Pressable>

          <Pressable style={styles.backButton} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.backButtonText}>{t("auth.signup.hasAccount")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.DARK_BG
  },
  bgGlowTop: {
    position: "absolute",
    top: -120,
    left: -100,
    width: scale(300),
    height: scale(300),
    borderRadius: scale(150),
    backgroundColor: COLORS.PRIMARY_GLOW
  },
  bgGlowBottom: {
    position: "absolute",
    right: -140,
    bottom: -120,
    width: scale(320),
    height: scale(320),
    borderRadius: scale(160),
    backgroundColor: COLORS.PRIMARY_GLOW
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: scale(20),
    paddingVertical: scale(40)
  },
  brandRow: {
    alignItems: "center",
    marginBottom: scale(16),
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  brandLogo: {
    width: 100,
    height: 100
  },
  title: {
    fontSize: clampScale(28, 24, 32),
    fontWeight: "800",
    color: COLORS.DARK_TEXT,
    textAlign: "center",
    marginBottom: scale(6)
  },
  subtitle: {
    fontSize: clampScale(14, 12, 16),
    color: COLORS.DARK_TEXT_SECONDARY,
    textAlign: "center",
    marginBottom: scale(24)
  },
  formCard: {
    backgroundColor: COLORS.DARK_CARD_SOLID,
    borderRadius: scale(18),
    borderWidth: 1,
    borderColor: COLORS.DARK_BORDER,
    padding: scale(18),
    gap: scale(12)
  },
  inputWrap: {
    backgroundColor: COLORS.DARK_INPUT_BG,
    borderRadius: scale(12),
    borderWidth: 1.5,
    borderColor: COLORS.DARK_BORDER,
    paddingHorizontal: scale(14),
    height: scale(48),
    justifyContent: "center"
  },
  input: {
    color: COLORS.DARK_TEXT,
    fontSize: clampScale(15, 13, 17)
  },
  actionButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: scale(14),
    height: scale(50),
    alignItems: "center",
    justifyContent: "center",
    marginTop: scale(4),
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonDisabled: {
    opacity: 0.6
  },
  actionButtonText: {
    color: COLORS.WHITE,
    fontSize: clampScale(16, 14, 18),
    fontWeight: "800"
  },
  backButton: {
    alignItems: "center",
    paddingVertical: scale(8)
  },
  backButtonText: {
    color: COLORS.PRIMARY_LIGHT,
    fontSize: clampScale(13, 11, 15),
    fontWeight: "600"
  }
});
