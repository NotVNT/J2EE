import React, { useState } from "react";
import { Text, Pressable, StyleSheet, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppColors } from "../constants/colors";
import FloatingQuickMenu, { FloatingTabButton } from "./FloatingQuickMenu";
import AppIcon from "../components/ui/AppIcon";
import { appNavigationRef } from "./navigationRef";
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import CategoryScreen from "../screens/finance/CategoryScreen";
import ExpenseScreen from "../screens/finance/ExpenseScreen";
import MoreScreen from "../screens/profile/MoreScreen";
import IncomeScreen from "../screens/finance/IncomeScreen";
import BudgetScreen from "../screens/finance/BudgetScreen";
import GoalScreen from "../screens/finance/GoalScreen";
import ForecastScreen from "../screens/insights/ForecastScreen";
import ChatScreen from "../screens/insights/ChatScreen";
import ReportsScreen from "../screens/insights/ReportsScreen";
import JarScreen from "../screens/finance/JarScreen";
import ReceiptPreviewScreen from "../screens/finance/ReceiptPreviewScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import PaymentScreen from "../screens/payment/PaymentScreen";
import PaymentCheckoutScreen from "../screens/payment/PaymentCheckoutScreen";
import PaymentResultScreen from "../screens/payment/PaymentResultScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─── Empty placeholder for center FAB tab slot ──────────
function EmptyScreen() {
  return <View style={{ flex: 1 }} />;
}

function PillTabButton({ children, onPress, accessibilityState, suppressActive, style }) {
  const focused = accessibilityState?.selected && !suppressActive;
  const colors = useAppColors();
  const activeBg = colors.ACTION_VOICE || "#A855F7";
  const isDark = colors.BG === '#0F0D0C';
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

// ─── Stack navigators for each tab ──────────────────────────

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

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="AddExpense" component={ExpenseScreen} />
      <Stack.Screen name="AddIncome" component={IncomeScreen} />
      <Stack.Screen name="Income" component={IncomeScreen} />
      <Stack.Screen name="Budget" component={BudgetScreen} />
      <Stack.Screen name="Goal" component={GoalScreen} />
      <Stack.Screen name="Forecast" component={ForecastScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="Jars" component={JarScreen} />
      <Stack.Screen name="JarDetail" component={JarScreen} />
      <Stack.Screen name="JarForm" component={JarScreen} />
      <Stack.Screen name="JarTransfer" component={JarScreen} />
      <Stack.Screen name="ReceiptPreview" component={ReceiptPreviewScreen} />
    </Stack.Navigator>
  );
}

function CategoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CategoryMain" component={ReportsScreen} />
    </Stack.Navigator>
  );
}

function ExpenseStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExpenseMain" component={ExpenseScreen} />
      <Stack.Screen name="AddExpense" component={ExpenseScreen} />
    </Stack.Navigator>
  );
}

function SettingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MoreMain" component={MoreScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="PaymentCheckout" component={PaymentCheckoutScreen} />
      <Stack.Screen name="PaymentResult" component={PaymentResultScreen} />
    </Stack.Navigator>
  );
}

// ─── Main Tabs ──────────────────────────────────────────────

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
      Chat: "Chat",
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
        onPress={(e) => {
          setSuppressTabFocus(false);
          setFloatingFocusedKey(null);
          originalOnPress?.(e);
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
        onPress={() => setIsQuickMenuVisible((prev) => !prev)}
      />
    </View>
  );

  // Override icon/label color when floating menu suppresses tab focus
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
            marginBottom: 2,
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
              height: 4,
            },
            shadowOpacity: 0.08,
            shadowRadius: 10,
            elevation: 4,
          },
          tabBarItemStyle: {
            flex: 1,
          },
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStack}
          options={{
            tabBarLabel: tabLabel("Tổng quan"),
            tabBarIcon: tabIcon("home", "home-outline"),
            tabBarButton: pillTabBarButton,
          }}
        />

        <Tab.Screen
          name="CategoryTab"
          component={CategoryStack}
          options={{
            tabBarLabel: tabLabel("Thống kê"),
            tabBarIcon: tabIcon("bar-chart", "bar-chart-outline"),
            tabBarButton: pillTabBarButton,
          }}
        />

        {/* Center FAB — occupies 5th slot, evenly spaced between tabs */}
        <Tab.Screen
          name="FabCenter"
          component={EmptyScreen}
          options={{
            tabBarLabel: () => null,
            tabBarIcon: () => null,
            tabBarButton: fabTabBarButton,
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setIsQuickMenuVisible((prev) => {
                if (prev) {
                  setFloatingFocusedKey(null);
                }
                return !prev;
              });
            },
          }}
        />

        <Tab.Screen
          name="ExpenseTab"
          component={ExpenseStack}
          options={{
            tabBarLabel: tabLabel("Lịch sử"),
            tabBarIcon: tabIcon("calendar", "calendar-outline"),
            tabBarButton: pillTabBarButton,
          }}
        />

        <Tab.Screen
          name="SettingTab"
          component={SettingStack}
          options={{
            tabBarLabel: tabLabel("Cài đặt"),
            tabBarIcon: tabIcon("settings", "settings-outline"),
            tabBarButton: pillTabBarButton,
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

const styles = StyleSheet.create({
  pillButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    marginVertical: 10,
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  pillButtonActive: {
    borderColor: "transparent",
  },
  tabLabel: {
    width: "100%",
    maxWidth: 64,
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 2,
    textAlign: "center",
  },
  fabTabSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
