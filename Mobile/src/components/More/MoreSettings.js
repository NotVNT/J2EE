import React from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, useAppColors } from "../../constants/colors";
import { MORE_MENU_GROUPS } from "./moreMenuConfig";

function SettingGroup({ colors, title, children }) {
  return (
    <View style={[styles.groupCard, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}>
      {title ? (
        <View style={[styles.groupHeader, { borderBottomColor: colors.CARD_BORDER }]}>
          <Text style={[styles.groupHeaderText, { color: colors.ACTION_VOICE || '#A855F7' }]}>{title}</Text>
        </View>
      ) : null}
      <View style={styles.groupContent}>{children}</View>
    </View>
  );
}

function SettingItem({ colors, icon, title, value, onPress, hasChevron = true, isSwitch = false, switchValue, onSwitchChange, disabled = false }) {
  const isDark = colors.BG === '#0F0D0C';

  return (
    <Pressable
      style={({ pressed }) => [styles.itemRow, { borderBottomColor: colors.BG }, pressed && !isSwitch && styles.itemRowPressed, disabled && styles.itemRowDisabled]}
      onPress={onPress}
      disabled={isSwitch || disabled}
    >
      <View style={styles.itemLeft}>
        <View style={[
          styles.itemIconWrap, 
          { 
            backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(168, 85, 247, 0.05)", 
            borderColor: colors.CARD_BORDER 
          }
        ]}>
          <Ionicons name={icon} size={16} color={colors.ACTION_VOICE || '#A855F7'} />
        </View>
        <Text style={[styles.itemTitle, { color: colors.TEXT }]}>{title}</Text>
      </View>
      <View style={styles.itemRight}>
        {value ? <Text style={[styles.itemValueText, { color: colors.TEXT_SECONDARY }]}>{value}</Text> : null}
        {isSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            disabled={disabled}
            trackColor={{ false: colors.CARD_BORDER, true: colors.ACTION_VOICE || '#A855F7' }}
            thumbColor={colors.WHITE}
          />
        ) : hasChevron ? (
          <Ionicons name="chevron-forward" size={18} color={colors.TEXT_MUTED} />
        ) : null}
      </View>
    </Pressable>
  );
}

export function LogoutButton({ onPress }) {
  const colors = useAppColors();

  return (
    <Pressable style={({ pressed }) => [styles.logoutButton, { backgroundColor: colors.CARD }, pressed && styles.logoutButtonPressed]} onPress={onPress}>
      <Text style={[styles.logoutText, { color: colors.EXPENSE }]}>Đăng xuất</Text>
    </Pressable>
  );
}

export default function MoreSettings({ appNotifications, emailPreferences, onAppNotificationsChange, onItemPress }) {
  const colors = useAppColors();

  return (
    <>
      {MORE_MENU_GROUPS.map((group) => (
        <SettingGroup key={group.title} colors={colors} title={group.title}>
          {group.items.map((item) => {
            const { key, ...settingItemProps } = item;

            return <SettingItem key={key} colors={colors} {...settingItemProps} onPress={() => onItemPress(item)} />;
          })}
        </SettingGroup>
      ))}

      <SettingGroup colors={colors} title="THÔNG BÁO">
        <SettingItem
          colors={colors}
          icon="notifications-outline"
          title="Thông báo ứng dụng"
          isSwitch
          switchValue={appNotifications}
          onSwitchChange={onAppNotificationsChange}
        />
        <SettingItem
          colors={colors}
          icon="mail-outline"
          title="Nhắc nhở qua Email"
          isSwitch
          switchValue={emailPreferences.isDailyEnabled}
          onSwitchChange={emailPreferences.toggleDailyEmail}
          disabled={emailPreferences.isUpdating || !emailPreferences.dailyReportPref}
        />
      </SettingGroup>
    </>
  );
}

const styles = StyleSheet.create({
  groupCard: {
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
  groupHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
  },
  groupHeaderText: {
    fontSize: 11,
    fontWeight: "850",
    letterSpacing: 1.2,
  },
  groupContent: {
    flexDirection: "column",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  itemRowPressed: {
    backgroundColor: "rgba(232, 89, 126, 0.05)",
  },
  itemRowDisabled: {
    opacity: 0.6,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 12,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemValueText: {
    fontSize: 13,
    fontWeight: "600",
    marginRight: 6,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(231, 111, 81, 0.3)",
    borderRadius: 16,
    paddingVertical: 15,
    marginTop: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },
  logoutButtonPressed: {
    backgroundColor: "rgba(231, 111, 81, 0.04)",
    transform: [{ scale: 0.99 }],
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "800",
  }
});
