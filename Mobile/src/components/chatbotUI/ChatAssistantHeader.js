import React from "react";
import { Image, Platform, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, useAppColors } from "../../constants/colors";
import ModeSegmentedControl from "./ModeSegmentedControl";
import appLogo from "../../assets/applogo.png";

export default function ChatAssistantHeader({
  activeMode,
  isFreePlan,
  modelLabel,
  onChangeMode,
  onBack,
  onOpenSessions,
}) {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const statusBarTop = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;
  const topInset = Math.max(insets.top, statusBarTop);
  const safeTopPadding = topInset + 8;
  const subtitle = activeMode === "agent"
    ? "Trợ lý tự động tài chính"
    : "Trợ lý tài chính AI";

  return (
    <View style={[styles.headerCard, { marginTop: safeTopPadding, backgroundColor: colors.CARD, borderColor: colors.CHAT_BORDER, shadowColor: colors.PRIMARY }]}>
      <View style={styles.topRow}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            hitSlop={8}
            onPress={onBack}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: colors.CHAT_PURPLE_LIGHT, borderColor: colors.CHAT_BORDER },
              pressed && styles.backButtonPressed,
            ]}
          >
            <Ionicons name="chevron-back" size={20} color={colors.PRIMARY} />
          </Pressable>
        ) : null}

        <View style={[styles.avatarFrame, { backgroundColor: colors.ROSE_MIST }]}>
          <Image source={appLogo} style={styles.avatarImage} resizeMode="cover" />
        </View>

        <View style={styles.copyBlock}>
          <View style={styles.titleRow}>
            <Text style={[styles.subtitle, { color: colors.PRIMARY }]} numberOfLines={1}>{subtitle}</Text>
            {onOpenSessions ? (
              <Pressable
                style={({ pressed }) => [
                  styles.historyButton,
                  pressed && styles.historyButtonPressed,
                ]}
                onPress={onOpenSessions}
                accessibilityRole="button"
                accessibilityLabel="Open chat history"
              >
                <Ionicons name="time-outline" size={18} color={colors.PRIMARY} />
              </Pressable>
            ) : null}
          </View>
          <View style={styles.metaRow}>
            <View style={styles.onlineDot} />
            <Text style={[styles.metaText, { color: colors.TEXT_SECONDARY }]}>Trực tuyến</Text>
            <View style={[styles.metaDivider, { backgroundColor: colors.CARD_BORDER }]} />
            <View style={styles.modelInline}>
              <Text style={[styles.metaText, { color: colors.TEXT_SECONDARY }]} numberOfLines={1}>{modelLabel}</Text>
            </View>
          </View>
        </View>

      </View>

      <ModeSegmentedControl
        activeMode={activeMode}
        isFreePlan={isFreePlan}
        onChangeMode={onChangeMode}
        embedded
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 18,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderWidth: 1,
    borderColor: "rgba(239, 94, 131, 0.12)",
    shadowColor: COLORS.PRIMARY,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 5,
    zIndex: 20,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  backButtonPressed: {
    opacity: 0.72,
  },
  avatarFrame: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.ROSE_MIST,
    borderWidth: 1,
    borderColor: "rgba(239, 94, 131, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginRight: 14,
  },
  avatarImage: {
    width: 64,
    height: 64,
  },
  copyBlock: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.WARNING_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.WARNING,
    marginLeft: 8,
  },
  historyButtonPressed: {
    opacity: 0.78,
  },
  subtitle: {
    flexShrink: 1,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  metaRow: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
  },
  onlineDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#18B866",
    marginRight: 8,
  },
  metaText: {
    fontSize: 14,
    lineHeight: 18,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: "600",
  },
  metaDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.CARD_BORDER,
    marginHorizontal: 12,
  },
  modelInline: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    gap: 4,
  },
  modelDropdown: {
    position: "absolute",
    top: 104,
    right: 18,
    width: 250,
    padding: 8,
    borderRadius: 18,
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER,
    shadowColor: COLORS.BLACK,
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 12,
    zIndex: 30,
  },
  dropdownTitle: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 8,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    color: COLORS.PRIMARY,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  optionRowSelected: {
    backgroundColor: COLORS.ROSE_MIST,
    borderColor: "rgba(239, 94, 131, 0.24)",
  },
  optionRowDisabled: {
    opacity: 0.45,
  },
  optionIcon: {
    width: 24,
    alignItems: "center",
    marginRight: 6,
  },
  optionCopy: {
    flex: 1,
    minWidth: 0,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.TEXT,
  },
  optionDescription: {
    marginTop: 2,
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
  },
  optionLabelDisabled: {
    color: COLORS.TEXT_MUTED,
  },
  badge: {
    marginLeft: 8,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: COLORS.PRIMARY,
  },
  badgeText: {
    color: COLORS.WHITE,
    fontSize: 9,
    fontWeight: "900",
  },
});
