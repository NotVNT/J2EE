import React, { useCallback, useState } from "react";
import { Alert, FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import http from "../services/http";
import { API_ENDPOINTS } from "../constants/api";
import { formatMoney, getApiErrorMessage, todayIso } from "../utils/format";

function GoalCard({ item, onContribute, onDelete }) {
  const progress = Math.max(0, Math.min(100, Number(item?.progressPercent || 0)));

  return (
    <View style={styles.goalCard}>
      <Text style={styles.goalName}>{item?.name || "Mục tiêu"}</Text>
      <Text style={styles.goalText}>Mục tiêu: {formatMoney(item?.targetAmount)}</Text>
      <Text style={styles.goalText}>Đã có: {formatMoney(item?.currentAmount)}</Text>
      <Text style={styles.goalText}>Còn thiếu: {formatMoney(item?.remainingAmount)}</Text>

      <View style={styles.progressOuter}>
        <View style={[styles.progressInner, { width: `${progress}%` }]} />
      </View>

      <View style={styles.goalActions}>
        <Pressable style={styles.contributeButton} onPress={() => onContribute(item)}>
          <Text style={styles.contributeText}>Đóng góp</Text>
        </Pressable>
        <Pressable onPress={() => onDelete(item?.id)}>
          <Text style={styles.deleteText}>Xóa</Text>
        </Pressable>
      </View>
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
      await fetchGoals();
    } catch (error) {
      Alert.alert("Thất bại", getApiErrorMessage(error, "Không thể tạo mục tiêu"));
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!id) return;

    try {
      await http.delete(API_ENDPOINTS.DELETE_SAVING_GOAL(id));
      await fetchGoals();
    } catch (error) {
      Alert.alert("Xóa thất bại", getApiErrorMessage(error, "Không thể xóa mục tiêu"));
    }
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
    } catch (error) {
      Alert.alert("Thất bại", getApiErrorMessage(error, "Không thể đóng góp cho mục tiêu"));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Thêm mục tiêu tiết kiệm</Text>

        <TextInput
          style={styles.input}
          placeholder="Tên mục tiêu"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Số tiền mục tiêu"
          keyboardType="numeric"
          value={targetAmount}
          onChangeText={setTargetAmount}
        />
        <TextInput
          style={styles.input}
          placeholder="Ngày bắt đầu (YYYY-MM-DD)"
          value={startDate}
          onChangeText={setStartDate}
        />
        <TextInput
          style={styles.input}
          placeholder="Ngày đích (YYYY-MM-DD)"
          value={targetDate}
          onChangeText={setTargetDate}
        />

        <Pressable style={[styles.saveButton, loading && styles.saveButtonDisabled]} onPress={onCreate} disabled={loading}>
          <Text style={styles.saveButtonText}>{loading ? "Đang lưu..." : "Tạo mục tiêu"}</Text>
        </Pressable>
      </View>

      <FlatList
        data={goals}
        keyExtractor={(item) => String(item?.id)}
        renderItem={({ item }) => <GoalCard item={item} onContribute={openContributionModal} onDelete={onDelete} />}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Chưa có mục tiêu tiết kiệm</Text>}
      />

      <Modal visible={Boolean(selectedGoal)} transparent animationType="slide" onRequestClose={closeContributionModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Đóng góp mục tiêu</Text>
            <Text style={styles.modalSubtitle}>{selectedGoal?.name}</Text>

            <TextInput
              style={styles.input}
              placeholder="Số tiền"
              keyboardType="numeric"
              value={contributionAmount}
              onChangeText={setContributionAmount}
            />
            <TextInput
              style={styles.input}
              placeholder="Ngày đóng góp (YYYY-MM-DD)"
              value={contributionDate}
              onChangeText={setContributionDate}
            />
            <TextInput
              style={styles.input}
              placeholder="Ghi chú"
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
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    marginBottom: 12
  },
  formTitle: { fontWeight: "700", color: "#0f172a", marginBottom: 10, fontSize: 16 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 10
  },
  saveButton: {
    backgroundColor: "#7c3aed",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center"
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: "#fff", fontWeight: "700" },
  listContent: { gap: 10, paddingBottom: 30 },
  goalCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12
  },
  goalName: { color: "#0f172a", fontWeight: "700", marginBottom: 6 },
  goalText: { color: "#475569", marginBottom: 2 },
  progressOuter: {
    marginTop: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: "#ede9fe",
    overflow: "hidden"
  },
  progressInner: {
    height: "100%",
    backgroundColor: "#7c3aed"
  },
  goalActions: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  contributeButton: {
    backgroundColor: "#ede9fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999
  },
  contributeText: {
    color: "#6d28d9",
    fontWeight: "700"
  },
  deleteText: { color: "#ef4444", fontWeight: "700" },
  emptyText: { textAlign: "center", color: "#64748b", marginTop: 20 },
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
    fontWeight: "700",
    fontSize: 18
  },
  modalSubtitle: {
    color: "#64748b",
    marginBottom: 10
  },
  modalActions: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14
  },
  secondaryButtonText: {
    color: "#334155",
    fontWeight: "700"
  },
  primaryButton: {
    backgroundColor: "#7c3aed",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700"
  }
});
