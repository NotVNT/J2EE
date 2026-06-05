import React, { useContext } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ExpenseForm from "../../../components/Expenses/ExpenseForm";
import { AuthContext } from "../../../contexts/AuthContext";
import useExpenseForm from "../../../hooks/useExpenseForm";
import useExpenseReceiptImport from "../../../hooks/useExpenseReceiptImport";
import { getSafeAreaContentStyle } from "../../../utils/safeArea";

export default function ExpenseFormRoute() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const subscriptionPlan = String(user?.subscriptionPlan || "FREE").toUpperCase();
  const isPremium = subscriptionPlan === "PREMIUM";
  const title = route.params?.initialData ? "Chỉnh sửa chi tiêu" : "Thêm chi tiêu";

  const { handleScanReceipt, isScanning } = useExpenseReceiptImport({
    isPremium,
    navigation
  });

  const expenseForm = useExpenseForm({
    defaultJarId: route.params?.defaultJarId,
    initialData: route.params?.initialData,
    onSaved: () => navigation.goBack()
  });

  return (
    <ExpenseForm
      form={expenseForm}
      insetsStyle={getSafeAreaContentStyle(insets)}
      isPremium={isPremium}
      isScanning={isScanning}
      onImportReceipt={handleScanReceipt}
      title={title}
    />
  );
}
