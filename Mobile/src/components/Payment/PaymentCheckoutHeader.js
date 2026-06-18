import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { COLORS, useAppColors } from "../../constants/colors";

export default function PaymentCheckoutHeader({ title }) {
  const colors = useAppColors();
  const { t } = useTranslation();

  return (
    <View style={[styles.header, { backgroundColor: colors.CARD, borderBottomColor: colors.CARD_BORDER }]}>
      <View style={styles.headerTextWrap}>
        <Text style={[styles.headerTitle, { color: colors.TEXT }]}>{title}</Text>
        <Text style={[styles.headerSubtitle, { color: colors.TEXT_SECONDARY }]}>{t("paymentCheckoutHeader.description")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  headerTextWrap: {
    flex: 1
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800"
  },
  headerSubtitle: {
    marginTop: 4,
    lineHeight: 20
  }
});
