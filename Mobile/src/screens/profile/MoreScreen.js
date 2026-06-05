import React, { useContext, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../contexts/AuthContext";
import { useTheme, THEME_MODES } from "../../contexts/ThemeContext";
import MoreSettings, { LogoutButton } from "../../components/More/MoreSettings";
import ProfileHero from "../../components/More/ProfileHero";
import { useAppColors } from "../../constants/colors";
import useEmailPreferences from "../../hooks/useEmailPreferences";
import { getSafeAreaContentStyle } from "../../utils/safeArea";

export default function MoreScreen() {
  const navigation = useNavigation();
  const { user, signOut } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const [appNotifications, setAppNotifications] = useState(true);
  const emailPreferences = useEmailPreferences();

  const isDark = theme === THEME_MODES.DARK;

  const handleItemPress = (item) => {
    if (item.key === "about") {
      Alert.alert(
        "Về ứng dụng Money Manager",
        "Phiên bản: 1.5\n\nNền tảng tài chính thông minh nhất giúp bạn theo dõi chi tiêu, tiết kiệm và đầu tư hiệu quả cho tương lai.\n\nThiết kế bởi BotDev Team.",
        [{ text: "Đóng", style: "cancel" }]
      );
      return;
    }
    if (!item.route) return;
    navigation.navigate(item.route, item.params);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.BG }]} contentContainerStyle={[styles.content, getSafeAreaContentStyle(insets)]} showsVerticalScrollIndicator={false}>
      <ProfileHero user={user} onPress={() => navigation.navigate("Profile")} />

      <MoreSettings
        appNotifications={appNotifications}
        emailPreferences={emailPreferences}
        onAppNotificationsChange={setAppNotifications}
        onItemPress={handleItemPress}
      />

      {/* ─── Theme Toggle Section ─── */}
      <View style={[styles.themeCard, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}>
        <View style={styles.themeRow}>
          <View style={styles.themeLeft}>
            <View style={[styles.iconWrap, { backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(168, 85, 247, 0.05)" }]}>
              <Ionicons name={isDark ? "moon-outline" : "sunny-outline"} size={18} color={colors.ACTION_VOICE || '#A855F7'} />
            </View>
            <View>
              <Text style={[styles.themeTitle, { color: colors.TEXT }]}>Giao diện tối</Text>
              <Text style={[styles.themeSubtitle, { color: colors.TEXT_SECONDARY }]}>
                {isDark ? "Đang bật chế độ tối" : "Đang bật chế độ sáng"}
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.CARD_BORDER, true: colors.ACTION_VOICE || '#A855F7' }}
            thumbColor={colors.WHITE}
          />
        </View>
      </View>

      <LogoutButton onPress={signOut} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  themeCard: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  themeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  themeTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  themeSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
