import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import apiClient from "../services/apiClient";
import { API_ENDPOINTS } from "../constants/api";
import { parseCurrencyInput, todayIso, getApiErrorMessage } from "../utils/format";
import { useVisibleItems } from "../components/common/ShowMoreButton";

/**
 * Custom hook encapsulating all state, CRUD operations, and derived data
 * for the GoalScreen.
 */
export default function useGoals() {
  const { t } = useTranslation();
  // ── Goal list ──────────────────────────────────────────────
  const [goals, setGoals] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Create form ────────────────────────────────────────────
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [startDate, setStartDate] = useState(todayIso());
  const [targetDate, setTargetDate] = useState(todayIso());

  // ── Detail / Contribution ──────────────────────────────────
  const [detailGoal, setDetailGoal] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [returnGoalAfterContribution, setReturnGoalAfterContribution] = useState(null);
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionNote, setContributionNote] = useState("");
  const [contributionDate, setContributionDate] = useState(todayIso());

  // ── Overview ───────────────────────────────────────────────
  const overview = useMemo(() => {
    const totalTarget = goals.reduce((sum, g) => sum + Number(g?.targetAmount || 0), 0);
    const totalCurrent = goals.reduce((sum, g) => sum + Number(g?.currentAmount || 0), 0);
    const overallProgress = totalTarget > 0 ? Math.min(100, (totalCurrent / totalTarget) * 100) : 0;
    const activeCount = goals.filter(
      (g) => String(g?.status || "ACTIVE").toUpperCase() === "ACTIVE"
    ).length;

    return { totalTarget, totalCurrent, overallProgress, activeCount };
  }, [goals]);

  // ── Visible items (ShowMore) ───────────────────────────────
  const {
    visibleItems: visibleGoals,
    canToggle: canExpandGoals,
    expanded: showAllGoals,
    toggle: toggleGoals,
  } = useVisibleItems(goals, { initialCount: 3, mode: "toggle" });

  // ── Fetch ──────────────────────────────────────────────────
  const fetchGoals = useCallback(async () => {
    const response = await apiClient.get(API_ENDPOINTS.GET_GOALS);
    setGoals(Array.isArray(response.data) ? response.data : []);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchGoals();
    } catch (error) {
      Alert.alert(t("common.error"), getApiErrorMessage(error, t("goalForm.loadFail")));
    } finally {
      setRefreshing(false);
    }
  }, [fetchGoals]);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  // ── Create ─────────────────────────────────────────────────
  const onCreate = async () => {
    const amount = parseCurrencyInput(targetAmount);

    if (!name.trim()) {
      Alert.alert(t("goalForm.missingInfoTitle"), t("goalForm.missingName"));
      return;
    }
    if (!targetAmount.trim()) {
      Alert.alert(t("goalForm.missingInfoTitle"), t("goalForm.missingTargetAmount"));
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert(t("goalForm.invalidDataTitle"), t("goalForm.invalidTargetAmount"));
      return;
    }
    if (new Date(targetDate).getTime() < new Date(startDate).getTime()) {
      Alert.alert(t("goalForm.invalidDateTitle"), t("goalForm.invalidDateMsg"));
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(API_ENDPOINTS.ADD_GOAL, {
        name: name.trim(),
        targetAmount: amount,
        startDate,
        targetDate,
      });

      setName("");
      setTargetAmount("");
      setStartDate(todayIso());
      setTargetDate(todayIso());
      await fetchGoals();
      Alert.alert(t("common.success"), t("goalForm.createSuccess"));
    } catch (error) {
      Alert.alert(t("common.error"), getApiErrorMessage(error, t("goalForm.createFailMsg")));
    } finally {
      setLoading(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────
  const onDelete = async (id) => {
    if (!id) return;

    Alert.alert(t("commonComponents.confirm"), t("goalForm.deleteConfirm"), [
      { text: t("commonComponents.cancel"), style: "cancel" },
      {
        text: t("commonComponents.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await apiClient.delete(API_ENDPOINTS.DELETE_GOAL(id));
            setDetailGoal(null);
            await fetchGoals();
            Alert.alert(t("common.success"), t("goalForm.deleteSuccess"));
          } catch (error) {
            Alert.alert(t("goalForm.deleteFailTitle"), getApiErrorMessage(error, t("goalForm.deleteFailMsg")));
          }
        },
      },
    ]);
  };

  // ── Contribution modal ─────────────────────────────────────
  const openContributionModal = (goal) => {
    setDetailGoal(null);
    setReturnGoalAfterContribution(goal);
    setSelectedGoal(goal);
    setContributionAmount("");
    setContributionNote("");
    setContributionDate(todayIso());
  };

  const closeContributionModal = () => {
    if (returnGoalAfterContribution) {
      setDetailGoal(returnGoalAfterContribution);
    }
    setReturnGoalAfterContribution(null);
    setSelectedGoal(null);
  };

  const onContribute = async () => {
    if (!selectedGoal?.id) return;

    const amount = parseCurrencyInput(contributionAmount);
    if (!contributionAmount.trim()) {
      Alert.alert(t("goalForm.missingInfoTitle"), t("goalForm.missingAmount"));
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert(t("goalForm.invalidDataTitle"), t("goalForm.invalidContribution"));
      return;
    }

    try {
      await apiClient.post(API_ENDPOINTS.ADD_GOAL_CONTRIBUTION(selectedGoal.id), {
        amount,
        contributionDate,
        note: contributionNote.trim(),
      });

      setReturnGoalAfterContribution(null);
      closeContributionModal();
      await fetchGoals();
      Alert.alert(t("common.success"), t("goalForm.contributeSuccess"));
    } catch (error) {
      Alert.alert(t("common.error"), getApiErrorMessage(error, t("goalForm.contributeFailMsg")));
    }
  };

  // ── Return ─────────────────────────────────────────────────
  return {
    // List
    goals,
    refreshing,
    visibleGoals,
    canExpandGoals,
    showAllGoals,
    toggleGoals,
    onRefresh,
    // Overview
    overview,
    // Create form
    name,
    targetAmount,
    startDate,
    targetDate,
    loading,
    setName,
    setTargetAmount,
    setStartDate,
    setTargetDate,
    onCreate,
    // Detail
    detailGoal,
    setDetailGoal,
    onDelete,
    // Contribution
    selectedGoal,
    contributionAmount,
    contributionDate,
    contributionNote,
    setContributionAmount,
    setContributionDate,
    setContributionNote,
    openContributionModal,
    closeContributionModal,
    onContribute,
  };
}
