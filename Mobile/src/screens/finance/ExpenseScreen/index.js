import React from "react";
import { useRoute } from "@react-navigation/native";
import ExpenseFormRoute from "./ExpenseFormRoute";
import ExpenseListRoute from "./ExpenseListRoute";

export default function ExpenseScreen() {
  const route = useRoute();

  if (route.name === "AddExpense") {
    return <ExpenseFormRoute />;
  }

  return <ExpenseListRoute />;
}
