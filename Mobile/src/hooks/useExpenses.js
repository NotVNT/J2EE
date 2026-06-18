import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import { deleteExpenseById, exportExpenseReport, fetchExpensesByFilter, parseExpenseVoice } from "../services/expenseService";
import { getApiErrorMessage } from "../utils/format";

export const EXPENSE_FILTER_TYPES = {
  current: "current",
  all: "all"
};

export default function useExpenses() {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState(EXPENSE_FILTER_TYPES.current);
  const [isExporting, setIsExporting] = useState(false);

  const totalExpense = useMemo(() => expenses.reduce((sum, item) => sum + Number(item?.amount || 0), 0), [expenses]);

  const fetchExpenses = useCallback(async () => {
    const data = await fetchExpensesByFilter(filterType);
    setExpenses(data);
  }, [filterType]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchExpenses();
    } catch (error) {
      Alert.alert(t("common.error"), getApiErrorMessage(error, t("expenseCommon.loadFail")));
    } finally {
      setRefreshing(false);
    }
  }, [fetchExpenses]);

  const onDelete = useCallback(
    async (id) => {
      if (!id) return;

      Alert.alert(t("commonComponents.confirm"), t("expenseCommon.deleteConfirm"), [
        { text: t("commonComponents.cancel"), style: "cancel" },
        {
          text: t("commonComponents.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExpenseById(id);
              await fetchExpenses();
              Alert.alert(t("common.success"), t("expenseCommon.deleteSuccess"));
            } catch (error) {
              Alert.alert(t("expenseCommon.deleteFailTitle"), getApiErrorMessage(error, t("expenseCommon.deleteFailMsg")));
            }
          }
        }
      ]);
    },
    [fetchExpenses]
  );

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  const handleVoiceResult = useCallback(async (text, onParsed) => {
    try {
      const data = await parseExpenseVoice(text);
      if (data) {
        onParsed?.(data);
      }
    } catch (error) {
      Alert.alert(t("expenseCommon.aiErrorTitle"), getApiErrorMessage(error, t("expenseCommon.aiErrorMsg")));
    }
  }, []);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      await exportExpenseReport(filterType);
    } catch (error) {
      Alert.alert(t("expenseCommon.exportFailTitle"), getApiErrorMessage(error, t("expenseCommon.exportFailMsg")));
    } finally {
      setIsExporting(false);
    }
  }, [filterType]);

  return {
    expenses,
    filterType,
    handleExport,
    handleVoiceResult,
    isExporting,
    onDelete,
    onRefresh,
    refreshing,
    setFilterType,
    totalExpense
  };
}
