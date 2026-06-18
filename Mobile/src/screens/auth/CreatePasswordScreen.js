import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import apiClient from "../../services/apiClient";
import { API_ENDPOINTS } from "../../constants/api";
import { getApiErrorMessage } from "../../utils/format";
import { COLORS } from "../../constants/colors";
import {
  validatePasswordRequirements,
  isPasswordValid,
} from "../../utils/authPassword";
import PasswordInput from "../../components/auth/PasswordInput";
import PasswordRequirement from "../../components/auth/PasswordRequirement";
import { scale, clampScale } from "../../utils/layoutScale";

export default function CreatePasswordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const email = route.params?.email || "";
  const fullName = route.params?.fullName || "";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const req = useMemo(() => validatePasswordRequirements(password), [password]);
  const canProceed = isPasswordValid(req);

  const containsNameOrEmail = useMemo(() => {
    const lower = password.toLowerCase();
    const nameParts = fullName.toLowerCase().split(/\s+/);
    const emailLocal = email.split("@")[0]?.toLowerCase() || "";
    return (
      nameParts.some((p) => p.length > 1 && lower.includes(p)) ||
      (emailLocal.length > 1 && lower.includes(emailLocal))
    );
  }, [password, fullName, email]);

  const extraMet = useMemo(
    () => ({
      notTooLong: req.notTooLong,
      noPersonalInfo: !containsNameOrEmail,
    }),
    [req.notTooLong, containsNameOrEmail]
  );

  const onNext = async () => {
    if (!canProceed) return;

    if (containsNameOrEmail) {
      Alert.alert(t("auth.createPassword.weakTitle"), t("auth.createPassword.weakMessage"));
      return;
    }

    setLoading(true);
    try {
      await apiClient.put(API_ENDPOINTS.COMPLETE_PROFILE, { email, fullName, password });
      Alert.alert(
        t("auth.createPassword.completeTitle"),
        t("auth.createPassword.completeMessage"),
        [{ text: t("auth.common.login"), onPress: () => navigation.navigate("Login") }]
      );
    } catch (error) {
      const message = getApiErrorMessage(error, t("auth.createPassword.failedMessage"));
      Alert.alert(t("auth.common.error"), message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.bgGlowTop} />
        <View style={styles.bgGlowBottom} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{t("auth.createPassword.title")}</Text>
          <Text style={styles.subtitle}>{t("auth.createPassword.subtitle")}</Text>

          <PasswordInput
            value={password}
            onChangeText={setPassword}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            focused={passwordFocused}
            placeholder={t("auth.common.enterPassword")}
          />

          <Pressable
            style={[styles.nextButton, (!canProceed || loading) && styles.nextButtonDisabled]}
            onPress={onNext}
            disabled={!canProceed || loading}
          >
            <Text style={styles.nextButtonText}>
              {loading ? t("auth.createPassword.loading") : t("auth.common.next")}
            </Text>
          </Pressable>

          <PasswordRequirement req={req} extraMet={extraMet} />
        </ScrollView>
      </View>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: scale(28),
    paddingBottom: scale(20),
  },
  title: {
    fontSize: clampScale(26, 22, 30),
    fontWeight: "800",
    color: COLORS.DARK_TEXT,
    marginBottom: scale(8),
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.DARK_TEXT_SECONDARY,
    textAlign: "center",
    marginBottom: scale(28),
  },
  nextButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: scale(12),
    height: scale(50),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scale(24),
    marginTop: scale(4),
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    backgroundColor: COLORS.DARK_BORDER,
    opacity: 0.5,
  },
  nextButtonText: {
    color: COLORS.WHITE || "#FFFFFF",
    fontSize: clampScale(16, 14, 18),
    fontWeight: "800",
  },
});
