import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, useAppColors } from "../../constants/colors";
import { getSafeAreaContentStyle } from "../../utils/safeArea";
import ScreenBackHeader from "../../components/common/ScreenBackHeader";

const SECTION_ICONS = [
  "person-outline",
  "card-outline",
  "lock-closed-outline",
  "shield-checkmark-outline",
  "finger-print-outline",
  "globe-outline",
  "document-text-outline",
];

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const colors = useAppColors();
  const { t } = useTranslation();

  const sections = t("privacy.sections", { returnObjects: true });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.BG }]}
      contentContainerStyle={[styles.content, getSafeAreaContentStyle(insets)]}
    >
      <ScreenBackHeader title={t("privacy.title")} />

      <View style={[styles.heroCard, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}>
        <Text style={[styles.heroTitle, { color: colors.TEXT }]}>{t("privacy.title")}</Text>
        <Text style={[styles.heroDescription, { color: colors.TEXT_SECONDARY }]}>
          {t("privacy.intro")}
        </Text>
        <Text style={[styles.lastUpdated, { color: colors.TEXT_SECONDARY }]}>
          {t("privacy.lastUpdated")}
        </Text>
      </View>

      {sections.map((section, index) => (
        <View
          key={index}
          style={[styles.sectionCard, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.iconWrap, { backgroundColor: colors.PRIMARY + "18" }]}>
              <Ionicons
                name={SECTION_ICONS[index] || "information-circle-outline"}
                size={20}
                color={colors.PRIMARY}
              />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.TEXT }]}>{section.title}</Text>
          </View>
          {section.items.map((item, itemIndex) => (
            <View key={itemIndex} style={styles.itemRow}>
              <View style={[styles.bullet, { backgroundColor: colors.PRIMARY }]} />
              <Text style={[styles.itemText, { color: colors.TEXT_SECONDARY }]}>{item}</Text>
            </View>
          ))}
        </View>
      ))}

      <View style={[styles.sectionCard, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconWrap, { backgroundColor: "#8B5CF618" }]}>
            <Ionicons name="mail-outline" size={20} color="#8B5CF6" />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.TEXT }]}>{t("privacy.contact.title")}</Text>
        </View>
        <Text style={[styles.contactText, { color: colors.TEXT_SECONDARY }]}>
          {t("privacy.contact.description")}
        </Text>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 16,
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 12,
    shadowColor: COLORS.BLACK,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 10,
  },
  heroDescription: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
  },
  lastUpdated: {
    fontSize: 12,
    fontWeight: "600",
  },
  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.BLACK,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingLeft: 4,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: 10,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
  contactText: {
    fontSize: 14,
    lineHeight: 21,
    paddingLeft: 4,
  },
  bottomSpacer: {
    height: 100,
  },
});
