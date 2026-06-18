import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import {
  fetchDashboardData,
  fetchDashboardMonthlySeries,
  fetchDashboardGoals,
  fetchUnreadNotificationCount
} from "../services/dashboardService";
import { getApiErrorMessage } from "../utils/format";

export default function useDashboard() {
  const { t } = useTranslation();
  const [dashboard, setDashboard] = useState(null);
  const [goals, setGoals] = useState([]);
  const [monthlySeries, setMonthlySeries] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [dashboardData, goals, series, nextUnreadCount] = await Promise.all([
        fetchDashboardData(),
        fetchDashboardGoals(),
        fetchDashboardMonthlySeries(),
        fetchUnreadNotificationCount()
      ]);

      setDashboard(dashboardData);
      setGoals(goals);
      setMonthlySeries(series);
      setUnreadCount(nextUnreadCount);
    } catch (error) {
      Alert.alert(t("common.error"), getApiErrorMessage(error, t("dashboardComponents.loadFail")));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  const recentTransactions = useMemo(
    () => (Array.isArray(dashboard?.recentTransactions) ? dashboard.recentTransactions : []),
    [dashboard?.recentTransactions]
  );

  return {
    dashboard,
    monthlySeries,
    onRefresh,
    recentTransactions,
    refreshing,
    goals,
    setUnreadCount,
    unreadCount
  };
}
