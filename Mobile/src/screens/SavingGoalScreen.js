import React, { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import http from "../services/http";
import { API_ENDPOINTS } from "../constants/api";
import { SUCCESS_ALERT_MESSAGES, SUCCESS_ALERT_TITLE } from "../constants/alertMessages";
import { formatDate, formatMoney, getApiErrorMessage, todayIso } from "../utils/format";
import { PickDateField } from "../utils/pickDate";

function getGoalVisual(goal) {
  const progressPercent = Number(goal?.progressPercent || 0);
  const status = String(goal?.status || "ACTIVE").toUpperCase();
  const isBehindSchedule = Boolean(goal?.isBehindSchedule);

  if (status === "COMPLETED") {
    return { color: "#067647", bg: "#ecfdf3", border: "#abefc6", label: "Hoàn thành" };
  }

  if (status === "CANCELLED") {
    return { color: "#475467", bg: "#f2f4f7", border: "#d0d5dd", label: "Đã hủy" };
  }

  if (isBehindSchedule) {
    return { color: "#b42318", bg: "#fef3f2", border: "#fecdca", label: "Chậm tiến độ" };
  }

  if (progressPercent >= 75) {
    return { color: "#067647", bg: "#ecfdf3", border: "#abefc6", label: "Đang thực hiện" };
  }

  if (progressPercent >= 40) {
    return { color: "#b54708", bg: "#fffaeb", border: "#fedf89", label: "Đang thực hiện" };
  }

  return { color: "#175cd3", bg: "#eff8ff", border: "#b2ddff", label: "Đang thực hiện" };
}

function GoalCard({ item, onContribute, onDelete }) {
  const target = Number(item?.targetAmount || 0);
  const current = Number(item?.currentAmount || 0);
  const remaining = Math.max(0, Number(item?.remainingAmount ?? target - current));
  const progress = Math.max(0, Math.min(100, Number(item?.progressPercent || 0)));

  const monthlyTarget = Number(item?.monthlyTarget || 0);
  const monthlyContributed = Number(item?.monthlyContributed || 0);
  const monthlyProgress = Math.max(0, Math.min(100, Number(item?.monthlyProgressPercent || 0)));

  const visual = getGoalVisual(item);
  const isActive = String(item?.status || "ACTIVE").toUpperCase() === "ACTIVE";

  return (
    <View style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <View style={styles.goalHeaderLeft}>
          <Text style={styles.goalName} numberOfLines={1}>{item?.name || "Mục tiêu"}</Text>
          <Text style={styles.goalPeriod}>{formatDate(item?.startDate)} {'>'} {formatDate(item?.targetDate)}</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: visual.bg, borderColor: visual.border }]}>
          <Text style={[styles.statusBadgeText, { color: visual.color }]}>{visual.label}</Text>
        </View>
      </View>

      <View style={styles.progressTopRow}>
        <Text style={styles.progressLabel}>Tiến độ tổng</Text>
        <Text style={[styles.progressValue, { color: visual.color }]}>{progress.toFixed(1)}%</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: visual.color }]} />
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Mục tiêu</Text>
          <Text style={styles.statValue}>{formatMoney(target)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Đã có</Text>
          <Text style={[styles.statValue, styles.statValueGood]}>{formatMoney(current)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Còn thiếu</Text>
          <Text style={[styles.statValue, styles.statValueWarn]}>{formatMoney(remaining)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Cần/tháng</Text>
          <Text style={[styles.statValue, styles.statValueInfo]}>{formatMoney(monthlyTarget)}</Text>
        </View>
      </View>

      {isActive ? (
        <View style={styles.monthlyCard}>
          <View style={styles.progressTopRow}>
            <Text style={styles.monthlyLabel}>Tiến độ tháng này</Text>
            <Text style={styles.monthlyValue}>
              {formatMoney(monthlyContributed)} / {formatMoney(monthlyTarget)} ({monthlyProgress.toFixed(0)}%)
            </Text>
          </View>
          <View style={styles.monthlyTrack}>
            <View style={[styles.monthlyFill, { width: `${monthlyProgress}%` }]} />
          </View>
        </View>
      ) : null}

      {isActive ? (
        <View style={styles.goalActions}>
          <Pressable style={styles.contributeButton} onPress={() => onContribute(item)}>
            <Text style={styles.contributeText}>Đóng góp</Text>
          </Pressable>
          <Pressable style={styles.deleteButton} onPress={() => onDelete(item?.id)}>
            <Text style={styles.deleteText}>Xóa</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export default function SavingGoalScreen() {
  const [goals, setGoals] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [startDate, setStartDate] = useState(todayIso());
  const [targetDate, setTargetDate] = useState(todayIso());

  const [selectedGoal, setSelectedGoal] = useState(null);
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionNote, setContributionNote] = useState("");
  const [contributionDate, setContributionDate] = useState(todayIso());

  const overview = useMemo(() => {
    const totalTarget = goals.reduce((sum, goal) => sum + Number(goal?.targetAmount || 0), 0);
    const totalCurrent = goals.reduce((sum, goal) => sum + Number(goal?.currentAmount || 0), 0);
    const overallProgress = totalTarget > 0 ? Math.min(100, (totalCurrent / totalTarget) * 100) : 0;

    const activeCount = goals.filter((goal) => String(goal?.status || "ACTIVE").toUpperCase() === "ACTIVE").length;

    return {
      totalTarget,
      totalCurrent,
      overallProgress,
      activeCount
    };
  }, [goals]);

  const fetchGoals = useCallback(async () => {
    const response = await http.get(API_ENDPOINTS.GET_SAVING_GOALS);
    setGoals(Array.isArray(response.data) ? response.data : []);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchGoals();
    } catch (error) {
      Alert.alert("Lỗi", getApiErrorMessage(error, "Không tải được mục tiêu tiết kiệm"));
    } finally {
      setRefreshing(false);
    }
  }, [fetchGoals]);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  const onCreate = async () => {
    const amount = Number(targetAmount);

    if (!name.trim()) {
      Alert.alert("Thiếu tên", "Vui lòng nhập tên mục tiêu.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert("Sai dữ liệu", "Vui lòng nhập số tiền mục tiêu hợp lệ.");
      return;
    }

    if (new Date(targetDate).getTime() < new Date(startDate).getTime()) {
      Alert.alert("Sai ngày", "Ngày đích cần lớn hơn hoặc bằng ngày bắt đầu.");
      return;
    }

    setLoading(true);
    try {
      await http.post(API_ENDPOINTS.ADD_SAVING_GOAL, {
        name: name.trim(),
        targetAmount: amount,
        startDate,
        targetDate
      });

      setName("");
      setTargetAmount("");
      setStartDate(todayIso());
      setTargetDate(todayIso());
      await fetchGoals();
      Alert.alert(SUCCESS_ALERT_TITLE, SUCCESS_ALERT_MESSAGES.create.savingGoal);
    } catch (error) {
      Alert.alert("Thất bại", getApiErrorMessage(error, "Không thể tạo mục tiêu"));
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!id) return;

    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa mục tiêu này không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await http.delete(API_ENDPOINTS.DELETE_SAVING_GOAL(id));
            await fetchGoals();
            Alert.alert(SUCCESS_ALERT_TITLE, SUCCESS_ALERT_MESSAGES.delete.savingGoal);
          } catch (error) {
            Alert.alert("Xóa thất bại", getApiErrorMessage(error, "Không thể xóa mục tiêu"));
          }
        }
      }
    ]);
  };

  const openContributionModal = (goal) => {
    setSelectedGoal(goal);
    setContributionAmount("");
    setContributionNote("");
    setContributionDate(todayIso());
  };

  const closeContributionModal = () => {
    setSelectedGoal(null);
  };

  const onContribute = async () => {
    if (!selectedGoal?.id) return;

    const amount = Number(contributionAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert("Sai dữ liệu", "Vui lòng nhập số tiền đóng góp hợp lệ.");
      return;
    }

    try {
      await http.post(API_ENDPOINTS.ADD_SAVING_GOAL_CONTRIBUTION(selectedGoal.id), {
        amount,
        contributionDate,
        note: contributionNote.trim()
      });

      closeContributionModal();
      await fetchGoals();
      Alert.alert(SUCCESS_ALERT_TITLE, SUCCESS_ALERT_MESSAGES.contribute.savingGoal);
    } catch (error) {
      Alert.alert("Thất bại", getApiErrorMessage(error, "Không thể đóng góp cho mục tiêu"));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.overviewCard}>
        <Text style={styles.overviewTag}>Kế hoạch tích lũy</Text>
        <Text style={styles.overviewTitle}>Mục tiêu tiết kiệm</Text>
        <Text style={styles.overviewText}>Đang theo dõi {overview.activeCount} mục tiêu hoạt động</Text>
        <Text style={styles.overviewMoney}>Đã có: {formatMoney(overview.totalCurrent)}</Text>
        <Text style={styles.overviewSubMoney}>Mục tiêu: {formatMoney(overview.totalTarget)}</Text>

        <View style={styles.overviewTrack}>
          <View style={[styles.overviewFill, { width: `${overview.overallProgress}%` }]} />
        </View>
        <Text style={styles.overviewProgress}>{overview.overallProgress.toFixed(1)}% hoàn thành</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Tạo mục tiêu mới</Text>
        <Text style={styles.formSubtitle}>Nhập mục tiêu và thời gian để theo dõi tiến độ tự động.</Text>

        <Text style={styles.label}>Tên mục tiêu</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: Quỹ du lịch"
          placeholderTextColor="#98a2b3"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Số tiền mục tiêu</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: 30000000"
          placeholderTextColor="#98a2b3"
          keyboardType="numeric"
          value={targetAmount}
          onChangeText={setTargetAmount}
        />

        <View style={styles.dateRow}>
          <View style={[styles.dateCol, styles.dateColLeft]}>
            <PickDateField label="Ngày bắt đầu" value={startDate} onChange={setStartDate} maximumDate={targetDate} />
          </View>
          <View style={styles.dateCol}>
            <PickDateField label="Ngày đích" value={targetDate} onChange={setTargetDate} minimumDate={startDate} />
          </View>
        </View>

        <Pressable style={[styles.saveButton, loading && styles.saveButtonDisabled]} onPress={onCreate} disabled={loading}>
          <Text style={styles.saveButtonText}>{loading ? "Đang lưu..." : "Tạo mục tiêu"}</Text>
        </Pressable>
      </View>

      <FlatList
        data={goals}
        keyExtractor={(item) => String(item?.id)}
        renderItem={({ item }) => <GoalCard item={item} onContribute={openContributionModal} onDelete={onDelete} />}
        contentContainerStyle={[styles.listContent, !goals.length && styles.listContentEmpty]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          goals.length ? (
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Danh sách mục tiêu</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTitle}>Chưa có mục tiêu tiết kiệm</Text>
            <Text style={styles.emptyText}>Hãy tạo mục tiêu đầu tiên để bắt đầu kế hoạch tích lũy của bạn.</Text>
          </View>
        }
      />

      <Modal visible={Boolean(selectedGoal)} transparent animationType="slide" onRequestClose={closeContributionModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Đóng góp mục tiêu</Text>
            <Text style={styles.modalSubtitle}>{selectedGoal?.name}</Text>

            <Text style={styles.label}>Số tiền</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: 1000000"
              placeholderTextColor="#98a2b3"
              keyboardType="numeric"
              value={contributionAmount}
              onChangeText={setContributionAmount}
            />

            <PickDateField label="Ngày đóng góp" value={contributionDate} onChange={setContributionDate} />

            <Text style={styles.label}>Ghi chú</Text>
            <TextInput
              style={styles.input}
              placeholder="Tùy chọn"
              placeholderTextColor="#98a2b3"
              value={contributionNote}
              onChangeText={setContributionNote}
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.secondaryButton} onPress={closeContributionModal}>
                <Text style={styles.secondaryButtonText}>Hủy</Text>
              </Pressable>
              <Pressable style={styles.primaryButton} onPress={onContribute}>
                <Text style={styles.primaryButtonText}>Xác nhận</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f4f7", padding: 16, paddingTop: 24 },
  overviewCard: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12
  },
  overviewTag: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#312e81",
    color: "#e0e7ff",
    fontWeight: "700",
    fontSize: 11
  },
  overviewTitle: { color: "#ffffff", fontSize: 20, fontWeight: "800", marginTop: 8 },
  overviewText: { color: "#cbd5e1", marginTop: 2, fontSize: 12 },
  overviewMoney: { color: "#d1fae5", marginTop: 8, fontWeight: "800", fontSize: 16 },
  overviewSubMoney: { color: "#93c5fd", marginTop: 2, fontWeight: "700", fontSize: 13 },
  overviewTrack: {
    marginTop: 10,
    height: 8,
    borderRadius: 8,
    backgroundColor: "#374151",
    overflow: "hidden"
  },
  overviewFill: {
    height: "100%",
    backgroundColor: "#22c55e"
  },
  overviewProgress: {
    marginTop: 6,
    color: "#d1fae5",
    fontWeight: "700",
    fontSize: 12
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    marginBottom: 12
  },
  formTitle: { fontWeight: "800", color: "#0f172a", marginBottom: 4, fontSize: 18 },
  formSubtitle: { color: "#667085", marginBottom: 10, fontSize: 12 },
  label: { color: "#344054", marginBottom: 6, fontWeight: "700" },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d0d5dd",
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 10,
    color: "#101828"
  },
  dateRow: { flexDirection: "row" },
  dateCol: { flex: 1 },
  dateColLeft: { marginRight: 8 },
  saveButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center"
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: "#fff", fontWeight: "800" },
  listContent: { paddingBottom: 30 },
  listContentEmpty: { flexGrow: 1, justifyContent: "center" },
  listHeader: { marginBottom: 8 },
  listTitle: { color: "#101828", fontWeight: "800", fontSize: 16 },
  goalCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    marginBottom: 10
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  goalHeaderLeft: { flex: 1, paddingRight: 10 },
  goalName: { color: "#0f172a", fontWeight: "800", fontSize: 16, marginBottom: 2 },
  goalPeriod: { color: "#667085", fontSize: 12 },
  statusBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  statusBadgeText: { fontWeight: "700", fontSize: 12 },
  progressTopRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  progressLabel: { color: "#667085", fontSize: 12 },
  progressValue: { fontWeight: "800" },
  progressTrack: {
    marginTop: 6,
    height: 8,
    borderRadius: 8,
    backgroundColor: "#e4e7ec",
    overflow: "hidden"
  },
  progressFill: { height: "100%" },
  statsGrid: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  statBox: {
    width: "48%",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8
  },
  statLabel: { color: "#667085", fontSize: 11, marginBottom: 2 },
  statValue: { color: "#0f172a", fontWeight: "700", fontSize: 12 },
  statValueGood: { color: "#067647" },
  statValueWarn: { color: "#b42318" },
  statValueInfo: { color: "#175cd3" },
  monthlyCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 10,
    marginTop: 2
  },
  monthlyLabel: { color: "#667085", fontSize: 12 },
  monthlyValue: { color: "#0f172a", fontSize: 11, fontWeight: "700" },
  monthlyTrack: {
    marginTop: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: "#d0d5dd",
    overflow: "hidden"
  },
  monthlyFill: { height: "100%", backgroundColor: "#4f46e5" },
  goalActions: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  contributeButton: {
    backgroundColor: "#eef2ff",
    borderWidth: 1,
    borderColor: "#c7d2fe",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999
  },
  contributeText: { color: "#4338ca", fontWeight: "800" },
  deleteButton: {
    backgroundColor: "#fef3f2",
    borderWidth: 1,
    borderColor: "#fecdca",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  deleteText: { color: "#b42318", fontWeight: "700" },
  emptyState: { alignItems: "center", paddingHorizontal: 24 },
  emptyIcon: { fontSize: 34, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#101828", marginBottom: 6 },
  emptyText: { textAlign: "center", color: "#667085", lineHeight: 19 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.35)",
    justifyContent: "center",
    padding: 16
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16
  },
  modalTitle: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: 18
  },
  modalSubtitle: {
    color: "#64748b",
    marginBottom: 10,
    marginTop: 2
  },
  modalActions: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 10
  },
  secondaryButtonText: {
    color: "#334155",
    fontWeight: "700"
  },
  primaryButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700"
  }
});
