import React, { useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
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

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);

  const showActivationOption = (activationEmail) => {
    Alert.alert(
      t("auth.common.activationRequiredTitle"),
      t("auth.forgotPassword.activationMessage"),
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

  const onSend = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      Alert.alert(t("auth.forgotPassword.missingTitle"), t("auth.forgotPassword.missingEmail"));
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(API_ENDPOINTS.FORGOT_PASSWORD, { email: normalizedEmail });
      navigation.navigate("ForgotPasswordOtp", { email: normalizedEmail });
    } catch (error) {
      if (isActivationRequiredError(error)) {
        showActivationOption(getActivationEmail(error, normalizedEmail));
        return;
      }

      const message = getApiErrorMessage(error, t("auth.forgotPassword.failedMessage"));
      Alert.alert(t("auth.forgotPassword.failedTitle"), message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
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

        <Text style={styles.title}>{t("auth.forgotPassword.title")}</Text>
        <Text style={styles.subtitle}>{t("auth.forgotPassword.subtitle")}</Text>

        <View style={styles.formCard}>
          <View style={[styles.inputWrap, isFocusedEmail && { borderColor: COLORS.PRIMARY }]}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder={t("auth.common.enterEmail")}
              placeholderTextColor="#7f9085"
              onFocus={() => setIsFocusedEmail(true)}
              onBlur={() => setIsFocusedEmail(false)}
            />
          </View>

          <Pressable style={[styles.actionButton, loading && styles.actionButtonDisabled]} onPress={onSend} disabled={loading}>
            <Text style={styles.actionButtonText}>{loading ? t("auth.forgotPassword.sending") : t("auth.forgotPassword.sendRequest")}</Text>
          </Pressable>

          <Pressable style={styles.backButton} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.backButtonText}>{t("auth.forgotPassword.backToLogin")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
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
    paddingHorizontal: scale(16),
    paddingTop: scale(70),
    paddingBottom: scale(30)
  },
  brandRow: {
    alignSelf: "center",
    marginBottom: scale(20),
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  brandLogo: {
    width: scale(100),
    height: scale(100)
  },
  title: {
    color: COLORS.DARK_TEXT,
    fontSize: clampScale(24, 20, 28),
    fontWeight: "800",
    textAlign: "center"
  },
  subtitle: {
    marginTop: scale(8),
    color: COLORS.DARK_TEXT_SECONDARY,
    fontSize: clampScale(13, 11, 15),
    textAlign: "center"
  },
  formCard: {
    marginTop: scale(24),
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: COLORS.DARK_BORDER_LIGHT,
    backgroundColor: COLORS.DARK_CARD,
    padding: scale(16),
    gap: scale(16)
  },
  inputWrap: {
    backgroundColor: COLORS.DARK_INPUT_BG,
    borderRadius: scale(12),
    borderWidth: 1.5,
    borderColor: COLORS.DARK_BORDER,
    paddingHorizontal: scale(14),
    height: scale(48),
    justifyContent: "center",
    marginBottom: scale(4)
  },
  input: {
    color: COLORS.DARK_TEXT,
    fontSize: 16
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
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonDisabled: {
    opacity: 0.7
  },
  actionButtonText: {
    color: COLORS.WHITE || "#FFFFFF",
    fontSize: clampScale(16, 14, 18),
    fontWeight: "800"
  },
  backButton: {
    marginTop: scale(4),
    alignItems: "center"
  },
  backButtonText: {
    color: COLORS.PRIMARY_LIGHT,
    fontSize: clampScale(13, 11, 15),
    fontWeight: "700"
  }
});
