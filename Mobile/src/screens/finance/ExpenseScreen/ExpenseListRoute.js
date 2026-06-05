import React, { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, Text, TextInput, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppIcon from "../../../components/ui/AppIcon";
import { useAppColors } from "../../../constants/colors";
import { deleteExpenseById, fetchExpensesByFilter } from "../../../services/expenseService";
import { deleteIncomeById, fetchIncomesByFilter } from "../../../services/incomeService";
import { getApiErrorMessage } from "../../../utils/format";
import { getSafeAreaBottom, getSafeAreaTop } from "../../../utils/safeArea";
import TransactionCalendarHeader from "./TransactionCalendarHeader";
import TransactionGroup from "./TransactionGroup";
import styles from "./styles";

export default function ExpenseListRoute() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const colors = useAppColors();

  const [allTransactions, setAllTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeType, setActiveType] = useState("expense");

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [expenses, incomes] = await Promise.all([
        fetchExpensesByFilter("all"),
        fetchIncomesByFilter("all")
      ]);

      const merged = [
        ...expenses.map((expense) => ({ ...expense, type: "expense" })),
        ...incomes.map((income) => ({ ...income, type: "income" }))
      ];

      merged.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      setAllTransactions(merged);
    } catch (error) {
      Alert.alert("Lỗi", getApiErrorMessage(error, "Không tải được lịch sử giao dịch"));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleDelete = useCallback((item) => {
    const isIncome = item.type === "income";
    Alert.alert("Xác nhận", `Bạn có chắc muốn xóa khoản ${isIncome ? "thu nhập" : "chi tiêu"} này?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            if (isIncome) {
              await deleteIncomeById(item.id);
            } else {
              await deleteExpenseById(item.id);
            }
            loadData();
          } catch (error) {
            Alert.alert("Thất bại", getApiErrorMessage(error, "Không thể xóa giao dịch"));
          }
        }
      }
    ]);
  }, [loadData]);

  const handleAddTransaction = useCallback(() => {
    navigation.navigate(activeType === "income" ? "AddIncome" : "AddExpense");
  }, [activeType, navigation]);

  const handleEditTransaction = useCallback((item) => {
    if (!item?.id) return;
    navigation.navigate(item.type === "income" ? "AddIncome" : "AddExpense", { initialData: item });
  }, [navigation]);

  const nextMonth = () => {
    setCurrentMonth((previous) => new Date(previous.getFullYear(), previous.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const prevMonth = () => {
    setCurrentMonth((previous) => new Date(previous.getFullYear(), previous.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const filteredTransactions = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const keyword = searchQuery.toLowerCase().trim();

    return allTransactions.filter((transaction) => {
      if (transaction.type !== activeType) return false;

      const transactionDate = new Date(transaction.createdAt || transaction.date);
      const isSameMonth = transactionDate.getFullYear() === year && transactionDate.getMonth() === month;
      if (!isSameMonth) return false;

      if (!keyword) return true;

      return (
        (transaction.name || "").toLowerCase().includes(keyword) ||
        (transaction.note || "").toLowerCase().includes(keyword) ||
        (transaction.categoryName || "").toLowerCase().includes(keyword)
      );
    });
  }, [activeType, allTransactions, currentMonth, searchQuery]);

  const displayedTransactions = useMemo(() => {
    if (selectedDay === null) return filteredTransactions;
    return filteredTransactions.filter((transaction) => {
      const transactionDate = new Date(transaction.createdAt || transaction.date);
      return transactionDate.getDate() === selectedDay;
    });
  }, [filteredTransactions, selectedDay]);

  const monthlySummary = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    let income = 0;
    let expense = 0;

    allTransactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.createdAt || transaction.date);
      if (transactionDate.getFullYear() !== year || transactionDate.getMonth() !== month) return;
      if (transaction.type === "income") income += Number(transaction.amount || 0);
      else expense += Number(transaction.amount || 0);
    });

    return { income, expense, net: income - expense };
  }, [allTransactions, currentMonth]);

  const groupedTransactions = useMemo(() => {
    const groups = {};
    displayedTransactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.createdAt || transaction.date);
      const dateKey = transactionDate.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = { date: transactionDate, items: [], totalIncome: 0, totalExpense: 0 };
      }
      groups[dateKey].items.push(transaction);
      if (transaction.type === "income") groups[dateKey].totalIncome += Number(transaction.amount || 0);
      else groups[dateKey].totalExpense += Number(transaction.amount || 0);
    });

    return Object.values(groups).sort((a, b) => b.date - a.date);
  }, [displayedTransactions]);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let index = 0; index < firstDayIndex; index += 1) {
      days.push({ id: `empty-${index}`, day: null });
    }
    for (let day = 1; day <= totalDays; day += 1) {
      days.push({ id: `day-${day}`, day });
    }
    return days;
  }, [currentMonth]);

  const renderCalendarDay = ({ item }) => {
    if (item.day === null) return <View style={styles.calendarDayCell} />;

    const dayTransactions = filteredTransactions.filter((transaction) => {
      const transactionDate = new Date(transaction.createdAt || transaction.date);
      return transactionDate.getDate() === item.day;
    });
    const hasIncome = activeType === "income" && dayTransactions.some((transaction) => transaction.type === "income");
    const hasExpense = activeType === "expense" && dayTransactions.some((transaction) => transaction.type === "expense");
    const isSelected = selectedDay === item.day;

    return (
      <Pressable
        style={[
          styles.calendarDayCell,
          isSelected && {
            backgroundColor: activeType === "expense" ? (colors.ACTION_EXPENSE || "#F97316") : (colors.ACTION_INCOME || "#22C55E"),
            borderRadius: 8
          }
        ]}
        onPress={() => setSelectedDay(isSelected ? null : item.day)}
      >
        <Text style={[styles.dayText, { color: isSelected ? "#FFF" : colors.TEXT }]}>{item.day}</Text>
        <View style={styles.dotsRow}>
          {hasIncome ? <View style={[styles.dot, { backgroundColor: "#22C55E" }]} /> : null}
          {hasExpense ? <View style={[styles.dot, { backgroundColor: "#EF4444" }]} /> : null}
        </View>
      </Pressable>
    );
  };

  const renderHeader = () => (
    <TransactionCalendarHeader
      activeType={activeType}
      colors={colors}
      currentMonth={currentMonth}
      daysInMonth={daysInMonth}
      monthlySummary={monthlySummary}
      nextMonth={nextMonth}
      prevMonth={prevMonth}
      renderCalendarDay={renderCalendarDay}
      setActiveType={setActiveType}
      setSelectedDay={setSelectedDay}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.APP_BACKGROUND || "#F2F2F7", paddingTop: getSafeAreaTop(insets, 12) }]}>
      <View style={styles.topHeader}>
        <Text style={[styles.headerTitle, { color: colors.TEXT }]}>Lịch sử</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.actionIcon} onPress={() => setShowSearch((previous) => !previous)}>
            <AppIcon name={showSearch ? "close" : "search-outline"} size={20} color={colors.TEXT} />
          </Pressable>
          <Pressable style={styles.actionIcon} onPress={() => navigation.navigate("HomeTab", { screen: "Chat", params: { mode: "voice" } })}>
            <AppIcon name="mic-outline" size={20} color={colors.TEXT} />
          </Pressable>
          <Pressable style={styles.actionIcon} onPress={handleAddTransaction}>
            <AppIcon name="add" size={24} color={colors.TEXT} />
          </Pressable>
        </View>
      </View>

      {showSearch ? (
        <View style={[styles.searchBar, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}>
          <AppIcon name="search-outline" size={16} color={colors.TEXT_MUTED} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.TEXT }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm kiếm giao dịch..."
            placeholderTextColor={colors.TEXT_MUTED}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery("")}>
              <AppIcon name="close-circle" size={16} color={colors.TEXT_MUTED} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <FlatList
        data={groupedTransactions}
        keyExtractor={(item) => item.date.toDateString()}
        renderItem={({ item }) => (
          <TransactionGroup colors={colors} group={item} onDelete={handleDelete} onEdit={handleEditTransaction} />
        )}
        contentContainerStyle={[styles.listContent, { paddingBottom: getSafeAreaBottom(insets) + 80 }]}
        ListHeaderComponent={renderHeader}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <AppIcon name="document-text-outline" size={48} color={colors.TEXT_MUTED} />
            <Text style={[styles.emptyTitle, { color: colors.TEXT }]}>Không có giao dịch</Text>
            <Text style={[styles.emptySubtitle, { color: colors.TEXT_SECONDARY }]}>
              Không tìm thấy giao dịch nào trong khoảng thời gian này.
            </Text>
          </View>
        }
      />
    </View>
  );
}
