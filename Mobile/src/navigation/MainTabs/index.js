import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppIcon from "../../components/ui/AppIcon";
import { useAppColors } from "../../constants/colors";
import FloatingQuickMenu, { FloatingTabButton } from "../FloatingQuickMenu";
import { appNavigationRef } from "../navigationRef";
import { CategoryStack, ExpenseStack, HomeStack, SettingStack } from "./stacks";
import styles from "./styles";

const Tab = createBottomTabNavigator();

function EmptyScreen() {
  return <View style={{ flex: 1 }} />;
}

function PillTabButton({ children, onPress, accessibilityState, suppressActive, style }) {
  const focused = accessibilityState?.selected && !suppressActive;
  const colors = useAppColors();
  const activeBg = colors.ACTION_VOICE || "#A855F7";
  const isDark = colors.BG === "#0F0D0C";
  const hoverBg = isDark ? "rgba(168, 85, 247, 0.3)" : "#E9D5FF";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }) => [
        styles.pillButton,
        style,
        focused && { backgroundColor: activeBg },
        pressed && { opacity: 0.85 },
        hovered && {
          backgroundColor: focused ? activeBg : hoverBg
        }
      ]}
      unstable_pressDelay={0}
    >
      {children}
    </Pressable>
  );
}

function TabLabel({ label, color }) {
  return (
    <Text
      style={[styles.tabLabel, { color }]}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.72}
      allowFontScaling={false}
    >
      {label}
    </Text>
  );
}

export default function MainTabs() {
  const insets = useSafeAreaInsets();
  const colors = useAppColors();
  const [isQuickMenuVisible, setIsQuickMenuVisible] = useState(false);
  const [suppressTabFocus, setSuppressTabFocus] = useState(false);
  const [floatingFocusedKey, setFloatingFocusedKey] = useState(null);

  const openExtraScreen = (routeName) => {
    setFloatingFocusedKey(routeName);
    setSuppressTabFocus(true);
    setIsQuickMenuVisible(false);

    const routeMap = {
      Income: "Income",
      Budget: "Budget",
      Forecast: "Forecast",
      Goal: "Goal",
      Chat: "Chat"
    };
    const screen = routeMap[routeName] || routeName;
    appNavigationRef.current?.navigate("HomeTab", { screen });
  };

  const pillTabBarButton = (props) => {
    const originalOnPress = props.onPress;
    const focused = props.accessibilityState?.selected && !suppressTabFocus;
    const activeBg = colors.ACTION_VOICE || "#A855F7";

    return (
      <PillTabButton
        {...props}
        suppressActive={suppressTabFocus}
        onPress={(event) => {
          setSuppressTabFocus(false);
          setFloatingFocusedKey(null);
          originalOnPress?.(event);
        }}
        style={[
          styles.pillButton,
          focused && { backgroundColor: activeBg }
        ]}
      />
    );
  };

  const fabTabBarButton = () => (
    <View style={styles.fabTabSlot}>
      <FloatingTabButton
        isOpen={isQuickMenuVisible}
        onPress={() => setIsQuickMenuVisible((previousValue) => !previousValue)}
      />
    </View>
  );

  const tabColor = (focused, originalColor) =>
    focused && !suppressTabFocus
      ? colors.TAB_ACTIVE_FG || colors.TEXT || "#1A0F14"
      : colors.TAB_INACTIVE || originalColor;

  const tabIcon = (focusedName, outlineName) => ({ focused, color }) => (
    <AppIcon
      name={focused ? focusedName : outlineName}
      size={20}
      color={tabColor(focused, color)}
      style={{ marginTop: 2 }}
    />
  );

  const tabLabel = (label) => ({ focused, color }) => (
    <TabLabel label={label} color={tabColor(focused, color)} />
  );

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.TAB_ACTIVE_FG || colors.TEXT || "#1A0F14",
          tabBarInactiveTintColor: colors.TAB_INACTIVE,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "600",
            marginBottom: 2
          },
          tabBarStyle: {
            height: 72,
            backgroundColor: colors.SURFACE,
            borderTopWidth: 0.5,
            borderTopColor: colors.BORDER,
            borderLeftWidth: 0.5,
            borderLeftColor: colors.BORDER,
            borderRightWidth: 0.5,
            borderRightColor: colors.BORDER,
            borderRadius: 24,
            marginHorizontal: 16,
            marginBottom: Math.max(insets.bottom, 8),
            paddingBottom: 4,
            position: "absolute",
            shadowColor: colors.SHADOW_COLOR || "#000",
            shadowOffset: {
              width: 0,
              height: 4
            },
            shadowOpacity: 0.08,
            shadowRadius: 10,
            elevation: 4
          },
          tabBarItemStyle: {
            flex: 1
          }
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStack}
          options={{
            tabBarLabel: tabLabel("Tổng quan"),
            tabBarIcon: tabIcon("home", "home-outline"),
            tabBarButton: pillTabBarButton
          }}
        />

        <Tab.Screen
          name="CategoryTab"
          component={CategoryStack}
          options={{
            tabBarLabel: tabLabel("Thống kê"),
            tabBarIcon: tabIcon("bar-chart", "bar-chart-outline"),
            tabBarButton: pillTabBarButton
          }}
        />

        <Tab.Screen
          name="FabCenter"
          component={EmptyScreen}
          options={{
            tabBarLabel: () => null,
            tabBarIcon: () => null,
            tabBarButton: fabTabBarButton
          }}
          listeners={{
            tabPress: (event) => {
              event.preventDefault();
              setIsQuickMenuVisible((previousValue) => {
                if (previousValue) {
                  setFloatingFocusedKey(null);
                }
                return !previousValue;
              });
            }
          }}
        />

        <Tab.Screen
          name="ExpenseTab"
          component={ExpenseStack}
          options={{
            tabBarLabel: tabLabel("Lịch sử"),
            tabBarIcon: tabIcon("calendar", "calendar-outline"),
            tabBarButton: pillTabBarButton
          }}
        />

        <Tab.Screen
          name="SettingTab"
          component={SettingStack}
          options={{
            tabBarLabel: tabLabel("Cài đặt"),
            tabBarIcon: tabIcon("settings", "settings-outline"),
            tabBarButton: pillTabBarButton
          }}
        />
      </Tab.Navigator>

      <FloatingQuickMenu
        visible={isQuickMenuVisible}
        onClose={() => {
          setFloatingFocusedKey(null);
          setIsQuickMenuVisible(false);
        }}
        onSelectRoute={openExtraScreen}
        focusedKey={floatingFocusedKey}
      />
    </>
  );
}
