import React, { useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { API_ENDPOINTS } from "../../constants/api";
import { COLORS, useAppColors } from "../../constants/colors";
import apiClient from "../../services/apiClient";
import { formatMoney, getApiErrorMessage } from "../../utils/format";

async function createPaymentLink(payload) {
  const response = await apiClient.post(API_ENDPOINTS.CREATE_PAYMENT, payload);
  return response.data;
}

import { getSafeAreaContentStyle } from "../../utils/safeArea";
import { PAYMENT_PLANS } from "./paymentPlans";
import AppIcon from "../../components/ui/AppIcon";

const APP_LOGO = require("../../assets/logo&banner/applogo.png");
const WALLET_BLUE = "#4FACFE";
const WALLET_PURPLE = "#7C4DFF";
const WALLET_DEEP_BLUE = "#3B82F6";

const PAYMENT_BENEFITS = [
  "payment.benefits.0",
  "payment.benefits.1",
  "payment.benefits.2",
  "payment.benefits.3",
  "payment.benefits.4"
];

export default function PaymentScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const colors = useAppColors();
  const { t } = useTranslation();
  const [selectedPlanId, setSelectedPlanId] = useState(PAYMENT_PLANS.find((plan) => plan.featured)?.id || PAYMENT_PLANS[0]?.id || "premium");
  const [loading, setLoading] = useState(false);

  const selectedPlan = PAYMENT_PLANS.find((plan) => plan.id === selectedPlanId) || PAYMENT_PLANS[0];
  const brandColor = WALLET_BLUE;
  const isDarkMode = colors.CARD !== "#FFFFFF";
  const pageBg = isDarkMode ? colors.BG : "#EEF7FF";
  const cardBg = isDarkMode ? colors.CARD : COLORS.WHITE;

  const createPayment = async () => {
    if (!selectedPlan) {
      Alert.alert(t("payment.missingInfo"), t("payment.missingPlan"));
      return;
    }

    setLoading(true);
    try {
      const response = await createPaymentLink({
        planId: selectedPlan.id,
        amount: selectedPlan.amount,
        description: `Payment ${t(selectedPlan.displayNameKey)}`
      });

      const checkoutUrl = response?.checkoutUrl;
      if (!checkoutUrl) {
        Alert.alert(t("payment.createSuccess"), t("payment.missingLink"));
        return;
      }

      navigation.navigate("PaymentCheckout", {
        checkoutUrl,
        orderCode: response?.orderCode ? String(response.orderCode) : "",
        planName: t(selectedPlan.displayNameKey)
      });
    } catch (error) {
      Alert.alert(t("payment.createFailed"), getApiErrorMessage(error, t("payment.createFailedMsg")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: pageBg }]} contentContainerStyle={[styles.content, getSafeAreaContentStyle(insets)]}>
      <View style={styles.hero}>
        <LinearGradient colors={[WALLET_PURPLE, WALLET_BLUE]} style={styles.heroIcon}>
          <Image source={APP_LOGO} style={styles.appLogo} resizeMode="contain" />
        </LinearGradient>
        <Text style={[styles.title, { color: colors.TEXT }]}>{t("payment.title")}</Text>
        <Text style={[styles.subtitle, { color: colors.TEXT_SECONDARY }]}>
          {t("payment.subtitle")}
        </Text>
      </View>

      <View style={styles.benefitList}>
        {PAYMENT_BENEFITS.map((benefitKey) => (
          <View key={benefitKey} style={styles.benefitRow}>
            <AppIcon name="star" size={22} color={brandColor} />
            <Text style={[styles.benefitText, { color: colors.TEXT }]}>{t(benefitKey)}</Text>
          </View>
        ))}
      </View>

      {PAYMENT_PLANS.map((plan) => {
        const active = plan.id === selectedPlanId;
        const premium = plan.id === "premium";
        const textColor = colors.TEXT;
        const secondaryTextColor = colors.TEXT_SECONDARY;
        const accentColor = premium ? brandColor : WALLET_PURPLE;

        return (
          <Pressable
            key={plan.id}
            style={[
              styles.planPressable,
              {
                shadowColor: premium ? brandColor : "#000",
                shadowOpacity: active ? 0.18 : 0.06,
                elevation: active ? 5 : 2
              },
            ]}
            onPress={() => setSelectedPlanId(plan.id)}
          >
            <View
              style={[
                styles.planCard,
                premium && styles.featuredPlanCard,
                {
                  backgroundColor: cardBg,
                  borderColor: active ? accentColor : (premium ? "rgba(79,172,254,0.5)" : "transparent")
                }
              ]}
            >
              {plan.discountLabelKey ? (
                <View style={styles.ribbon}>
                  <Text style={styles.ribbonText}>{t(plan.badgeKey)} {t(plan.discountLabelKey)}</Text>
                </View>
              ) : null}

              <View style={styles.planTopRow}>
                <View style={styles.planTitleBlock}>
                  <Text style={[styles.planName, { color: textColor }]}>{t(plan.displayNameKey)}</Text>
                  <Text style={[styles.planDescription, { color: secondaryTextColor }]}>{t(plan.descriptionKey)}</Text>
                </View>
                <View style={styles.priceBlock}>
                  {plan.originalAmount ? (
                    <Text style={[styles.originalAmount, { color: colors.TEXT_MUTED }]}>{formatMoney(plan.originalAmount)}</Text>
                  ) : null}
                  <Text style={[styles.planAmount, { color: colors.TEXT }]}>{formatMoney(plan.amount)}</Text>
                  <Text style={[styles.planCycle, { color: secondaryTextColor }]}>/ {t(plan.cycleLabelKey)}</Text>
                </View>
              </View>

              <View style={[styles.planDivider, { backgroundColor: colors.CARD_BORDER }]} />

              <View style={styles.featureList}>
                {plan.featuresKeys.map((featureKey) => (
                  <View key={featureKey} style={styles.featureRow}>
                    <AppIcon name={premium ? "sparkles" : "checkmark-circle"} size={15} color={premium ? WALLET_BLUE : accentColor} />
                    <Text style={[styles.featureText, { color: secondaryTextColor }]}>{t(featureKey)}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.selectRow}>
                <View style={[styles.radioOuter, { borderColor: active ? accentColor : colors.CARD_BORDER }]}>
                  {active ? <View style={[styles.radioInner, { backgroundColor: accentColor }]} /> : null}
                </View>
                <Text style={[styles.selectText, { color: active ? accentColor : colors.TEXT_SECONDARY }]}>
                  {active ? t("payment.selectedPlan") : t("payment.tapToSelect")}
                </Text>
              </View>
            </View>
          </Pressable>
        );
      })}

      <Text style={[styles.noteText, { color: colors.TEXT_SECONDARY }]}>
        {t("payment.note")}
      </Text>

      <Pressable
        style={[styles.button, { shadowColor: brandColor, elevation: 4 }, loading && styles.buttonDisabled]}
        onPress={createPayment}
        disabled={loading}
      >
        <LinearGradient colors={[WALLET_PURPLE, WALLET_BLUE]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.buttonGradient}>
          <Text style={styles.buttonText}>{loading ? t("payment.paying") : t("payment.bankTransfer")}</Text>
          <View style={styles.buttonPill}>
            <Text style={styles.buttonPillText}>{selectedPlan ? t(selectedPlan.displayNameKey) : t("payment.selected")}</Text>
          </View>
        </LinearGradient>
      </Pressable>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 14
  },
  hero: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 4
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.7)"
  },
  appLogo: {
    width: 52,
    height: 52,
    borderRadius: 18
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center"
  },
  benefitList: {
    gap: 14,
    marginVertical: 4
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 13
  },
  benefitText: {
    flex: 1,
    fontSize: 17,
    lineHeight: 25,
    fontWeight: "800"
  },
  planPressable: {
    borderRadius: 16,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
  },
  planCard: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    overflow: "hidden"
  },
  featuredPlanCard: {
    paddingTop: 22
  },
  ribbon: {
    alignSelf: "flex-start",
    backgroundColor: WALLET_DEEP_BLUE,
    borderBottomRightRadius: 8,
    marginTop: -22,
    marginLeft: -16,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  ribbonText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: "800"
  },
  planTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12
  },
  planTitleBlock: {
    flex: 1
  },
  planName: {
    fontWeight: "800",
    fontSize: 18
  },
  priceBlock: {
    alignItems: "flex-end",
    minWidth: 112
  },
  originalAmount: {
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "line-through"
  },
  planAmount: {
    fontWeight: "800",
    fontSize: 22
  },
  planCycle: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 1
  },
  planDescription: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18
  },
  planDivider: {
    height: 1,
    marginTop: 16,
    marginBottom: 14
  },
  featureList: {
    gap: 9
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19
  },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center"
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  selectText: {
    fontSize: 12,
    fontWeight: "800"
  },
  noteText: {
    fontSize: 13,
    lineHeight: 22,
    marginTop: 2,
    textAlign: "left"
  },
  button: {
    borderRadius: 14,
    marginTop: 4,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2
  },
  buttonDisabled: {
    opacity: 0.7
  },
  buttonGradient: {
    minHeight: 48,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15
  },
  buttonPill: {
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  buttonPillText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: "800"
  }
});
