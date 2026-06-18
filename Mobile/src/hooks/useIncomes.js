import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import { deleteIncomeById, exportIncomeReport, fetchIncomesByFilter, parseIncomeVoice } from "../services/incomeService";
import { getApiErrorMessage } from "../utils/format";

export const INCOME_FILTER_TYPES = {
  current: "current",
  all: "all"
};

export default function useIncomes() {
  const { t } = useTranslation();
  const [incomes, setIncomes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState(INCOME_FILTER_TYPES.current);
  const [isExporting, setIsExporting] = useState(false);

  const totalIncome = useMemo(() => incomes.reduce((sum, item) => sum + Number(item?.amount || 0), 0), [incomes]);

  const fetchIncomes = useCallback(async () => {
    const data = await fetchIncomesByFilter(filterType);
    setIncomes(data);
  }, [filterType]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchIncomes();
    } catch (error) {
      Alert.alert(t("common.error"), getApiErrorMessage(error, t("incomeCommon.loadFail")));
    } finally {
      setRefreshing(false);
    }
  }, [fetchIncomes]);

  const onDelete = useCallback(
    async (id) => {
      if (!id) return;

      Alert.alert(t("commonComponents.confirm"), t("incomeCommon.deleteConfirm"), [
        { text: t("commonComponents.cancel"), style: "cancel" },
        {
          text: t("commonComponents.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteIncomeById(id);
              await fetchIncomes();
              Alert.alert(t("common.success"), t("incomeCommon.deleteSuccess"));
            } catch (error) {
              Alert.alert(t("incomeCommon.deleteFailTitle"), getApiErrorMessage(error, t("incomeCommon.deleteFailMsg")));
            }
          }
        }
      ]);
    },
    [fetchIncomes]
  );

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  const handleVoiceResult = useCallback(async (text, onParsed) => {
    try {
      const data = await parseIncomeVoice(text);
      if (data) {
        onParsed?.(data);
      }
    } catch (error) {
      Alert.alert(t("incomeCommon.aiErrorTitle"), getApiErrorMessage(error, t("incomeCommon.aiErrorMsg")));
    }
  }, []);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      await exportIncomeReport(filterType);
    } catch (error) {
      Alert.alert(t("incomeCommon.exportFailTitle"), getApiErrorMessage(error, t("incomeCommon.exportFailMsg")));
    } finally {
      setIsExporting(false);
    }
  }, [filterType]);

  return {
    filterType,
    handleExport,
    handleVoiceResult,
    incomes,
    isExporting,
    onDelete,
    onRefresh,
    refreshing,
    setFilterType,
    totalIncome
  };
}
