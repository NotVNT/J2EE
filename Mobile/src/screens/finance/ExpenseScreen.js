import React, { useCallback, useContext, useState, useEffect, useMemo } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View, Alert } from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../../contexts/AuthContext";
import ExpenseForm from "../../components/Expenses/ExpenseForm";
import { COLORS, useAppColors } from "../../constants/colors";
import { getSafeAreaBottom, getSafeAreaContentStyle, getSafeAreaTop } from "../../utils/safeArea";
import AppIcon from "../../components/ui/AppIcon";
import TransactionIcon from "../../components/ui/TransactionIcon";
import AmountText from "../../components/ui/AmountText";
import { fetchExpensesByFilter, deleteExpenseById } from "../../services/expenseService";
import { fetchIncomesByFilter, deleteIncomeById } from "../../services/incomeService";
import { getApiErrorMessage, formatDate, formatMoney } from "../../utils/format";
import useExpenseReceiptImport from "../../hooks/useExpenseReceiptImport";
import useExpenseForm from "../../hooks/useExpenseForm";

const FILTER_TYPES = {
  current: "current",
  all: "all"
};

export default function ExpenseScreen() {
  const route = useRoute();

  if (route.name === "AddExpense") {
    return <ExpenseFormRoute />;
  }

  return <ExpenseListRoute />;
}

function ExpenseFormRoute() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const subscriptionPlan = String(user?.subscriptionPlan || "FREE").toUpperCase();
  const isPremium = subscriptionPlan === "PREMIUM";

  const { handleScanReceipt, isScanning } = useExpenseReceiptImport({
    isPremium,
    navigation
  });

  const expenseForm = useExpenseForm({
    defaultJarId: route.params?.defaultJarId,
    initialData: route.params?.initialData,
    onSaved: () => navigation.goBack()
  });

  return (
    <ExpenseForm
      form={expenseForm}
      insetsStyle={getSafeAreaContentStyle(insets)}
      isPremium={isPremium}
      isScanning={isScanning}
      onImportReceipt={handleScanReceipt}
    />
  );
}

function ExpenseListRoute() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const colors = useAppColors();
  
  const [allTransactions, setAllTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeType, setActiveType] = useState("expense"); // "expense" | "income"

  // Fetch both incomes and expenses
  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [expenses, incomes] = await Promise.all([
        fetchExpensesByFilter("all"),
        fetchIncomesByFilter("all")
      ]);

      const merged = [
        ...expenses.map(e => ({ ...e, type: "expense" })),
        ...incomes.map(i => ({ ...i, type: "income" }))
      ];

      // Sort by date descending
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

  // Month navigation helpers
  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  // Filter transaction by current month, search keyword & activeType (to separate Expense / Income like on the web)
  const filteredTransactions = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const keyword = searchQuery.toLowerCase().trim();

    return allTransactions.filter(tx => {
      if (tx.type !== activeType) return false;

      const txDate = new Date(tx.createdAt || tx.date);
      const isSameMonth = txDate.getFullYear() === year && txDate.getMonth() === month;
      if (!isSameMonth) return false;

      if (keyword) {
        return (
          (tx.name || "").toLowerCase().includes(keyword) ||
          (tx.note || "").toLowerCase().includes(keyword) ||
          (tx.categoryName || "").toLowerCase().includes(keyword)
        );
      }
      return true;
    });
  }, [allTransactions, currentMonth, searchQuery, activeType]);

  // Filter by selected day
  const displayedTransactions = useMemo(() => {
    if (selectedDay === null) {
      return filteredTransactions;
    }
    return filteredTransactions.filter(tx => {
      const txDate = new Date(tx.createdAt || tx.date);
      return txDate.getDate() === selectedDay;
    });
  }, [filteredTransactions, selectedDay]);

  // Calculate monthly summaries (true monthly sum for the whole month from allTransactions to show true net balance)
  const monthlySummary = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    let income = 0;
    let expense = 0;
    allTransactions.forEach(tx => {
      const txDate = new Date(tx.createdAt || tx.date);
      const isSameMonth = txDate.getFullYear() === year && txDate.getMonth() === month;
      if (!isSameMonth) return;

      if (tx.type === "income") {
        income += Number(tx.amount || 0);
      } else {
        expense += Number(tx.amount || 0);
      }
    });
    return { income, expense, net: income - expense };
  }, [allTransactions, currentMonth]);

  // Group displayed transactions by day
  const groupedTransactions = useMemo(() => {
    const groups = {};
    displayedTransactions.forEach(tx => {
      const dateStr = new Date(tx.createdAt || tx.date).toDateString();
      if (!groups[dateStr]) {
        groups[dateStr] = {
          date: new Date(tx.createdAt || tx.date),
          items: [],
          totalIncome: 0,
          totalExpense: 0,
        };
      }
      groups[dateStr].items.push(tx);
      if (tx.type === "income") {
        groups[dateStr].totalIncome += Number(tx.amount || 0);
      } else {
        groups[dateStr].totalExpense += Number(tx.amount || 0);
      }
    });

    return Object.values(groups).sort((a, b) => b.date - a.date);
  }, [displayedTransactions]);

  // Calendar Day generation
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday is 0
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Sunday prefix padding
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ id: `empty-${i}`, day: null });
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push({ id: `day-${d}`, day: d });
    }
    return days;
  }, [currentMonth]);

  // Render Calendar Day
  const renderCalendarDay = ({ item }) => {
    if (item.day === null) {
      return <View style={styles.calendarDayCell} />;
    }

    const dayTxs = filteredTransactions.filter(tx => {
      const txDate = new Date(tx.createdAt || tx.date);
      return txDate.getDate() === item.day;
    });

    const hasIncome = activeType === "income" && dayTxs.some(tx => tx.type === "income");
    const hasExpense = activeType === "expense" && dayTxs.some(tx => tx.type === "expense");
    const isSelected = selectedDay === item.day;

    return (
      <Pressable
        style={[
          styles.calendarDayCell,
          isSelected && {
            backgroundColor: activeType === "expense"
              ? (colors.ACTION_EXPENSE || "#F97316")
              : (colors.ACTION_INCOME || "#22C55E"),
            borderRadius: 8
          }
        ]}
        onPress={() => setSelectedDay(isSelected ? null : item.day)}
      >
        <Text style={[styles.dayText, { color: isSelected ? "#FFF" : colors.TEXT }]}>{item.day}</Text>
        <View style={styles.dotsRow}>
          {hasIncome && <View style={[styles.dot, { backgroundColor: "#22C55E" }]} />}
          {hasExpense && <View style={[styles.dot, { backgroundColor: "#EF4444" }]} />}
        </View>
      </Pressable>
    );
  };

  const renderHeader = () => {
    const monthYearStr = `Tháng ${currentMonth.getMonth() + 1}, ${currentMonth.getFullYear()}`;
    const isDark = colors.BG === '#0F0D0C';
    return (
      <View style={styles.listHeader}>
        {/* Segmented Control */}
        <View style={[styles.segmentContainer, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)" }]}>
          <Pressable
            style={[
              styles.segmentButton,
              activeType === "expense" && [styles.segmentButtonActive, { backgroundColor: colors.ACTION_EXPENSE || "#F97316" }]
            ]}
            onPress={() => {
              setActiveType("expense");
              setSelectedDay(null);
            }}
          >
            <Text style={[styles.segmentButtonText, activeType === "expense" ? styles.segmentButtonTextActive : { color: colors.TEXT_SECONDARY }]}>
              Chi tiêu
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.segmentButton,
              activeType === "income" && [styles.segmentButtonActive, { backgroundColor: colors.ACTION_INCOME || "#22C55E" }]
            ]}
            onPress={() => {
              setActiveType("income");
              setSelectedDay(null);
            }}
          >
            <Text style={[styles.segmentButtonText, activeType === "income" ? styles.segmentButtonTextActive : { color: colors.TEXT_SECONDARY }]}>
              Thu nhập
            </Text>
          </Pressable>
        </View>

        {/* Month Selector */}
        <View style={[styles.monthSelector, { borderColor: colors.BORDER, backgroundColor: colors.CARD }]}>
          <Pressable onPress={prevMonth} style={styles.monthNavBtn}>
            <AppIcon name="chevron-back" size={20} color={colors.TEXT} />
          </Pressable>
          <Text style={[styles.monthLabel, { color: colors.TEXT }]}>{monthYearStr}</Text>
          <Pressable onPress={nextMonth} style={styles.monthNavBtn}>
            <AppIcon name="chevron-forward" size={20} color={colors.TEXT} />
          </Pressable>
        </View>

        {/* Weekday headers */}
        <View style={styles.weekdayRow}>
          {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((w, idx) => (
            <Text key={idx} style={[styles.weekdayText, { color: colors.TEXT_MUTED || "#B8A6AC" }]}>{w}</Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <FlatList
          data={daysInMonth}
          renderItem={renderCalendarDay}
          keyExtractor={(item) => item.id}
          numColumns={7}
          scrollEnabled={false}
          style={styles.calendarGrid}
        />

        {/* Summary Row */}
        <View style={[styles.summaryCard, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}>
          {activeType === "income" ? (
            <View style={styles.summaryCol}>
              <Text style={[styles.summaryLabel, { color: colors.TEXT_SECONDARY }]}>Thu nhập</Text>
              <AmountText value={monthlySummary.income} type="income" style={styles.summaryValue} />
            </View>
          ) : (
            <View style={styles.summaryCol}>
              <Text style={[styles.summaryLabel, { color: colors.TEXT_SECONDARY }]}>Chi phí</Text>
              <AmountText value={monthlySummary.expense} type="expense" style={styles.summaryValue} />
            </View>
          )}
          <View style={[styles.summaryDivider, { backgroundColor: colors.SEPARATOR }]} />
          <View style={styles.summaryCol}>
            <Text style={[styles.summaryLabel, { color: colors.TEXT_SECONDARY }]}>Số dư ròng</Text>
            <AmountText value={monthlySummary.net} type={monthlySummary.net >= 0 ? "income" : "expense"} style={styles.summaryValue} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.APP_BACKGROUND || "#F2F2F7", paddingTop: getSafeAreaTop(insets, 12) }]}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={[styles.headerTitle, { color: colors.TEXT }]}>Lịch sử</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.actionIcon} onPress={() => setShowSearch(prev => !prev)}>
            <AppIcon name={showSearch ? "close" : "search-outline"} size={20} color={colors.TEXT} />
          </Pressable>
          <Pressable style={styles.actionIcon} onPress={() => navigation.navigate("HomeTab", { screen: "Chat", params: { mode: "voice" } })}>
            <AppIcon name="mic-outline" size={20} color={colors.TEXT} />
          </Pressable>
          <Pressable style={styles.actionIcon} onPress={() => navigation.navigate("AddExpense")}>
            <AppIcon name="add" size={24} color={colors.TEXT} />
          </Pressable>
        </View>
      </View>

      {/* Search Input Toggle */}
      {showSearch && (
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
      )}

      {/* Main transaction list */}
      <FlatList
        data={groupedTransactions}
        keyExtractor={(item) => item.date.toDateString()}
        renderItem={({ item }) => (
          <View style={[styles.dateGroupContainer, { backgroundColor: colors.CARD, borderColor: colors.BORDER }]}>
            {/* Day Header Row */}
            <View style={[styles.groupHeaderRow, { borderBottomColor: colors.SEPARATOR }]}>
              <Text style={[styles.groupDateText, { color: colors.TEXT }]}>
                {formatDate(item.date)}
              </Text>
              <View style={styles.groupTotalRow}>
                {item.totalIncome > 0 && (
                  <AmountText value={item.totalIncome} type="income" showSign style={styles.groupTotalText} />
                )}
                {item.totalExpense > 0 && (
                  <AmountText value={item.totalExpense} type="expense" showSign style={styles.groupTotalText} />
                )}
              </View>
            </View>
            {/* List of items in this day */}
            {item.items.map((tx) => (
              <Pressable key={tx.id} onLongPress={() => handleDelete(tx)} style={styles.rowWrapper}>
                <View style={styles.rowLeft}>
                  <TransactionIcon iconValue={tx.icon} containerSize={36} size={18} />
                  <View style={styles.rowTexts}>
                    <Text style={[styles.rowName, { color: colors.TEXT }]} numberOfLines={1}>{tx.name}</Text>
                    {tx.note ? (
                      <Text style={[styles.rowNote, { color: colors.TEXT_MUTED }]} numberOfLines={1}>{tx.note}</Text>
                    ) : null}
                  </View>
                </View>
                <AmountText value={tx.amount} type={tx.type} showSign style={styles.rowAmount} />
              </Pressable>
            ))}
          </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  actionIcon: {
    padding: 4,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  listContent: {
    paddingBottom: 24,
  },
  listHeader: {
    marginBottom: 16,
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  segmentContainer: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  segmentButtonActive: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.16,
    shadowRadius: 1.5,
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: "750",
  },
  segmentButtonTextActive: {
    color: "#FFF",
  },
  monthNavBtn: {
    padding: 4,
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  weekdayText: {
    width: "14%",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
  },
  calendarGrid: {
    marginBottom: 16,
  },
  calendarDayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 2,
    paddingBottom: 4,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
    height: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  summaryCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    elevation: 1,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  summaryCol: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    height: "80%",
    alignSelf: "center",
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  dateGroupContainer: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 0.5,
  },
  groupHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    marginBottom: 8,
  },
  groupDateText: {
    fontSize: 12,
    fontWeight: "700",
  },
  groupTotalRow: {
    flexDirection: "row",
    gap: 8,
  },
  groupTotalText: {
    fontSize: 11,
    fontWeight: "600",
  },
  rowWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  rowTexts: {
    marginLeft: 10,
    flex: 1,
  },
  rowName: {
    fontSize: 14,
    fontWeight: "600",
  },
  rowNote: {
    fontSize: 11,
    marginTop: 2,
  },
  rowAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});
