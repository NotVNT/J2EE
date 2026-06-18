import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import { API_ENDPOINTS } from "../constants/api";
import apiClient from "../services/apiClient";
import { fetchCategoriesByType } from "../services/categoryService";
import { formatCurrencyInput, getApiErrorMessage, parseCurrencyInput } from "../utils/format";
import { summarizeBudgets } from "../utils/budget";

async function fetchBudgets() {
  const response = await apiClient.get(API_ENDPOINTS.GET_BUDGETS);
  return Array.isArray(response.data) ? response.data : [];
}

async function saveBudget(payload) {
  return apiClient.post(API_ENDPOINTS.SET_BUDGET, payload);
}

async function deleteBudgetById(id) {
  return apiClient.delete(API_ENDPOINTS.DELETE_BUDGET(id));
}

export default function useBudget() {
  const { t } = useTranslation();
  const now = new Date();
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [amountLimit, setAmountLimit] = useState("");
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [submitting, setSubmitting] = useState(false);

  const summary = useMemo(() => summarizeBudgets(budgets), [budgets]);

  const fetchData = useCallback(async () => {
    const [budgetData, categoryData] = await Promise.all([
      fetchBudgets(),
      fetchCategoriesByType("expense")
    ]);

    setBudgets(budgetData);
    setCategories(categoryData);
    setCategoryId((current) => current || (categoryData.length > 0 ? String(categoryData[0].id) : ""));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } catch (error) {
      Alert.alert(t("common.error"), getApiErrorMessage(error, t("budgetForm.missingLoadMsg")));
    } finally {
      setRefreshing(false);
    }
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  const setFormattedAmountLimit = useCallback((value) => {
    setAmountLimit(formatCurrencyInput(value));
  }, []);

  const onSave = useCallback(async () => {
    const limit = parseCurrencyInput(amountLimit);
    const selectedMonth = Number(month);
    const selectedYear = Number(year);

    if (!categoryId) {
      Alert.alert(t("budgetForm.missingInfoTitle"), t("budgetForm.missingCategory"));
      return;
    }

    if (!amountLimit.trim()) {
      Alert.alert(t("budgetForm.missingInfoTitle"), t("budgetForm.missingLimit"));
      return;
    }

    if (!month.trim()) {
      Alert.alert(t("budgetForm.missingInfoTitle"), t("budgetForm.missingMonth"));
      return;
    }

    if (!year.trim()) {
      Alert.alert(t("budgetForm.missingInfoTitle"), t("budgetForm.missingYear"));
      return;
    }

    if (!Number.isFinite(limit) || limit <= 0) {
      Alert.alert(t("budgetForm.invalidDataTitle"), t("budgetForm.invalidLimit"));
      return;
    }

    if (!Number.isFinite(selectedMonth) || selectedMonth < 1 || selectedMonth > 12) {
      Alert.alert(t("budgetForm.invalidMonthTitle"), t("budgetForm.invalidMonthMsg"));
      return;
    }

    if (!Number.isFinite(selectedYear) || selectedYear < 2000 || selectedYear > 2100) {
      Alert.alert(t("budgetForm.invalidYearTitle"), t("budgetForm.invalidYearMsg"));
      return;
    }

    setSubmitting(true);
    try {
      await saveBudget({
        categoryId: Number(categoryId),
        amountLimit: limit,
        month: selectedMonth,
        year: selectedYear
      });

      setAmountLimit("");
      await fetchData();
      Alert.alert(t("common.success"), t("budgetForm.saveSuccess"));
    } catch (error) {
      Alert.alert(t("budgetForm.saveFailTitle"), getApiErrorMessage(error, t("budgetForm.saveFailMsg")));
    } finally {
      setSubmitting(false);
    }
  }, [amountLimit, categoryId, fetchData, month, year]);

  const onDelete = useCallback(
    async (id) => {
      if (!id) return;

      Alert.alert(t("commonComponents.confirm"), t("budgetForm.deleteConfirm"), [
        { text: t("commonComponents.cancel"), style: "cancel" },
        {
          text: t("commonComponents.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBudgetById(id);
              await fetchData();
              Alert.alert(t("common.success"), t("budgetForm.deleteSuccess"));
            } catch (error) {
              Alert.alert(t("budgetForm.deleteFailTitle"), getApiErrorMessage(error, t("budgetForm.deleteFailMsg")));
            }
          }
        }
      ]);
    },
    [fetchData]
  );

  return {
    amountLimit,
    budgets,
    categories,
    categoryId,
    month,
    onDelete,
    onRefresh,
    onSave,
    refreshing,
    setAmountLimit: setFormattedAmountLimit,
    setCategoryId,
    setMonth,
    setYear,
    submitting,
    summary,
    year
  };
}
