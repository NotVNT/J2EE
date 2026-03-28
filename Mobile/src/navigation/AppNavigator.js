import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { AuthContext } from "../context/AuthContext";
import LoadingScreen from "../components/LoadingScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import DashboardScreen from "../screens/DashboardScreen";
import ExpenseScreen from "../screens/ExpenseScreen";
import AddExpenseScreen from "../screens/AddExpenseScreen";
import IncomeScreen from "../screens/IncomeScreen";
import AddIncomeScreen from "../screens/AddIncomeScreen";
import BudgetScreen from "../screens/BudgetScreen";
import SavingGoalScreen from "../screens/SavingGoalScreen";
import MoreScreen from "../screens/MoreScreen";
import CategoryScreen from "../screens/CategoryScreen";
import FilterScreen from "../screens/FilterScreen";
import PaymentScreen from "../screens/PaymentScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0f766e"
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color }}>📊</Text>
        }}
      />
      <Tab.Screen
        name="Expense"
        component={ExpenseScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color }}>💸</Text>
        }}
      />
      <Tab.Screen
        name="Income"
        component={IncomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color }}>💰</Text>
        }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color }}>🎯</Text>
        }}
      />
      <Tab.Screen
        name="Goal"
        component={SavingGoalScreen}
        options={{
          title: "Goals",
          tabBarIcon: ({ color }) => <Text style={{ color }}>🏦</Text>
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color }}>☰</Text>
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ title: "Đăng ký" }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: "Quên mật khẩu" }} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{
          title: "Thêm chi tiêu"
        }}
      />
      <Stack.Screen
        name="AddIncome"
        component={AddIncomeScreen}
        options={{
          title: "Thêm thu nhập"
        }}
      />
      <Stack.Screen name="Category" component={CategoryScreen} options={{ title: "Danh mục" }} />
      <Stack.Screen name="Filter" component={FilterScreen} options={{ title: "Lọc giao dịch" }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: "Thanh toán" }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Hồ sơ" }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isBootstrapping } = useContext(AuthContext);

  if (isBootstrapping) {
    return <LoadingScreen text="Đang khởi tạo phiên đăng nhập..." />;
  }

  return <NavigationContainer>{user ? <AppStack /> : <AuthStack />}</NavigationContainer>;
}
