import React, { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import http from "../services/http";
import { API_ENDPOINTS } from "../constants/api";
import { formatDate, formatMoney, getApiErrorMessage } from "../utils/format";

function IncomeItem({ item, onDelete }) {
  return (
    <View style={styles.item}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemName}>{item?.name || "Thu nhập"}</Text>
        <Text style={styles.itemDate}>{formatDate(item?.date)}</Text>
      </View>
      <View style={styles.itemRight}>
        <Text style={styles.itemAmount}>{formatMoney(item?.amount)}</Text>
        <Pressable onPress={() => onDelete(item?.id)}>
          <Text style={styles.deleteText}>Xóa</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function IncomeScreen() {
  const navigation = useNavigation();
  const [incomes, setIncomes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchIncomes = useCallback(async () => {
    const response = await http.get(API_ENDPOINTS.GET_ALL_INCOMES, {
      params: { all: true }
    });
    setIncomes(Array.isArray(response.data) ? response.data : []);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchIncomes();
    } catch (error) {
      Alert.alert("Lỗi", getApiErrorMessage(error, "Không tải được danh sách thu nhập"));
    } finally {
      setRefreshing(false);
    }
  }, [fetchIncomes]);

  const onDelete = async (id) => {
    if (!id) return;

    try {
      await http.delete(API_ENDPOINTS.DELETE_INCOME(id));
      await fetchIncomes();
    } catch (error) {
      Alert.alert("Xóa thất bại", getApiErrorMessage(error, "Không thể xóa khoản thu này"));
    }
  };

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  return (
    <View style={styles.container}>
      <Pressable style={styles.addButton} onPress={() => navigation.navigate("AddIncome")}>
        <Text style={styles.addButtonText}>+ Thêm thu nhập</Text>
      </Pressable>

      <FlatList
        data={incomes}
        keyExtractor={(item) => String(item?.id)}
        renderItem={({ item }) => <IncomeItem item={item} onDelete={onDelete} />}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Chưa có dữ liệu thu nhập</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16
  },
  addButton: {
    backgroundColor: "#15803d",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700"
  },
  listContent: {
    gap: 10,
    paddingBottom: 24
  },
  item: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  itemLeft: {
    flex: 1,
    paddingRight: 10
  },
  itemName: {
    fontWeight: "700",
    color: "#0f172a"
  },
  itemDate: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 12
  },
  itemRight: {
    alignItems: "flex-end"
  },
  itemAmount: {
    color: "#15803d",
    fontWeight: "700"
  },
  deleteText: {
    marginTop: 6,
    color: "#ef4444",
    fontWeight: "600"
  },
  emptyText: {
    textAlign: "center",
    color: "#64748b",
    marginTop: 32
  }
});
