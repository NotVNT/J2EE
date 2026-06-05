import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppColors } from "../../constants/colors";
import AppIcon from "../ui/AppIcon";
import { scale } from "../../utils/layoutScale";

export default function ScreenBackHeader({ title, fallbackRoute = "Dashboard", onBack, right = null, style }) {
  const navigation = useNavigation();
  const colors = useAppColors();

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    if (!fallbackRoute) {
      return;
    }

    const parentNavigation = navigation.getParent?.();
    if (parentNavigation?.navigate) {
      parentNavigation.navigate("HomeTab", { screen: fallbackRoute });
      return;
    }

    navigation.navigate(fallbackRoute);
  }, [fallbackRoute, navigation, onBack]);

  return (
    <View style={[styles.header, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Quay lại"
        hitSlop={8}
        onPress={handleBack}
        style={({ pressed }) => [
          styles.backButton,
          {
            backgroundColor: colors.CARD,
            borderColor: colors.CARD_BORDER,
          },
          pressed && styles.backButtonPressed,
        ]}
      >
        <AppIcon name="chevron-back" size={22} color={colors.TEXT} />
      </Pressable>

      <Text style={[styles.title, { color: colors.TEXT }]} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.rightSlot}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: scale(44),
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(14),
  },
  backButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.08,
    shadowRadius: scale(8),
    elevation: 2,
  },
  backButtonPressed: {
    opacity: 0.72,
    transform: [{ translateY: 1 }],
  },
  title: {
    flex: 1,
    marginHorizontal: scale(12),
    textAlign: "center",
    fontSize: scale(18),
    fontWeight: "800",
  },
  rightSlot: {
    width: scale(40),
    minHeight: scale(40),
    alignItems: "center",
    justifyContent: "center",
  },
});
