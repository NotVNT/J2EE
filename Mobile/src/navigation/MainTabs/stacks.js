import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from "../../screens/dashboard/DashboardScreen";
import ExpenseScreen from "../../screens/finance/ExpenseScreen";
import MoreScreen from "../../screens/profile/MoreScreen";
import IncomeScreen from "../../screens/finance/IncomeScreen";
import BudgetScreen from "../../screens/finance/BudgetScreen";
import GoalScreen from "../../screens/finance/GoalScreen";
import ForecastScreen from "../../screens/insights/ForecastScreen";
import ChatScreen from "../../screens/insights/ChatScreen";
import ReportsScreen from "../../screens/insights/ReportsScreen";
import JarScreen from "../../screens/finance/JarScreen";
import ReceiptPreviewScreen from "../../screens/finance/ReceiptPreviewScreen";
import ProfileScreen from "../../screens/profile/ProfileScreen";
import EditProfileScreen from "../../screens/profile/EditProfileScreen";
import PaymentScreen from "../../screens/payment/PaymentScreen";
import PaymentCheckoutScreen from "../../screens/payment/PaymentCheckoutScreen";
import PaymentResultScreen from "../../screens/payment/PaymentResultScreen";

const Stack = createNativeStackNavigator();
const hiddenHeaderOptions = { headerShown: false };

export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={hiddenHeaderOptions}>
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

export function CategoryStack() {
  return (
    <Stack.Navigator screenOptions={hiddenHeaderOptions}>
      <Stack.Screen name="CategoryMain" component={ReportsScreen} />
    </Stack.Navigator>
  );
}

export function ExpenseStack() {
  return (
    <Stack.Navigator screenOptions={hiddenHeaderOptions}>
      <Stack.Screen name="ExpenseMain" component={ExpenseScreen} />
      <Stack.Screen name="AddExpense" component={ExpenseScreen} />
      <Stack.Screen name="AddIncome" component={IncomeScreen} />
    </Stack.Navigator>
  );
}

export function SettingStack() {
  return (
    <Stack.Navigator screenOptions={hiddenHeaderOptions}>
      <Stack.Screen name="MoreMain" component={MoreScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="PaymentCheckout" component={PaymentCheckoutScreen} />
      <Stack.Screen name="PaymentResult" component={PaymentResultScreen} />
    </Stack.Navigator>
  );
}
