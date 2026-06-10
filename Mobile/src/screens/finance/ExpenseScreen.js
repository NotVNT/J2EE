import React, { useCallback, useContext } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AmountText from "../../components/ui/AmountText";
import AppIcon from "../../components/ui/AppIcon";
import TransactionIcon from "../../components/ui/TransactionIcon";
import ExpenseForm from "../../components/Expenses/ExpenseForm";
import { useAppColors } from "../../constants/colors";
import { AuthContext } from "../../contexts/AuthContext";
import useExpenses from "../../hooks/useExpenses";
import useExpenseForm from "../../hooks/useExpenseForm";
import useExpenseReceiptImport from "../../hooks/useExpenseReceiptImport";
import { formatDate } from "../../utils/format";
import { getSafeAreaBottom, getSafeAreaContentStyle, getSafeAreaTop } from "../../utils/safeArea";

function TransactionGroup({ colors, group, onDelete, onEdit }) {
  return (
    <View style={[styles.dateGroupContainer, { backgroundColor: colors.CARD, borderColor: colors.BORDER }]}>
      <View style={[styles.groupHeaderRow, { borderBottomColor: colors.SEPARATOR }]}>
        <Text style={[styles.groupDateText, { color: colors.TEXT }]}>{formatDate(group.date)}</Text>
        <View style={styles.groupTotalRow}>
          {group.totalIncome > 0 ? <AmountText value={group.totalIncome} type="income" showSign style={styles.groupTotalText} /> : null}
          {group.totalExpense > 0 ? <AmountText value={group.totalExpense} type="expense" showSign style={styles.groupTotalText} /> : null}
        </View>
      </View>

      {group.items.map((transaction) => (
        <Pressable
          key={`${transaction.type}-${transaction.id}`}
          onPress={() => onEdit(transaction)}
          onLongPress={() => onDelete(transaction)}
          style={styles.rowWrapper}
        >
          <View style={styles.rowLeft}>
            <TransactionIcon iconValue={transaction.icon} containerSize={36} size={18} />
            <View style={styles.rowTexts}>
              <Text style={[styles.rowName, { color: colors.TEXT }]} numberOfLines={1}>{transaction.name}</Text>
              {transaction.note ? (
                <Text style={[styles.rowNote, { color: colors.TEXT_MUTED }]} numberOfLines={1}>{transaction.note}</Text>
              ) : null}
            </View>
          </View>
          <View style={styles.rowRight}>
            <AmountText value={transaction.amount} type={transaction.type} showSign style={styles.rowAmount} />
            <View style={styles.rowActions}>
              <Pressable
                onPress={(event) => {
                  event?.stopPropagation?.();
                  onEdit(transaction);
                }}
                style={styles.rowActionButton}
                accessibilityRole="button"
                accessibilityLabel="Chỉnh sửa giao dịch"
              >
                <AppIcon name="create-outline" size={15} color={colors.PRIMARY || "#7C4DFF"} />
              </Pressable>
              <Pressable
                onPress={(event) => {
                  event?.stopPropagation?.();
                  onDelete(transaction);
                }}
                style={styles.rowActionButton}
                accessibilityRole="button"
                accessibilityLabel="Xóa giao dịch"
              >
                <AppIcon name="trash-outline" size={15} color={colors.EXPENSE_COLOR || "#EF4444"} />
              </Pressable>
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function TransactionCalendarHeader({
  activeType,
  colors,
  currentMonth,
  daysInMonth,
  monthlySummary,
  nextMonth,
  prevMonth,
  renderCalendarDay,
  setActiveType,
  setSelectedDay
}) {
  const monthYearStr = `Tháng ${currentMonth.getMonth() + 1}, ${currentMonth.getFullYear()}`;
  const isDark = colors.BG === "#0F0D0C";

  return (
    <View style={styles.listHeader}>
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

      <View style={[styles.monthSelector, { borderColor: colors.BORDER, backgroundColor: colors.CARD }]}>
        <Pressable onPress={prevMonth} style={styles.monthNavBtn}>
          <AppIcon name="chevron-back" size={20} color={colors.TEXT} />
        </Pressable>
        <Text style={[styles.monthLabel, { color: colors.TEXT }]}>{monthYearStr}</Text>
        <Pressable onPress={nextMonth} style={styles.monthNavBtn}>
          <AppIcon name="chevron-forward" size={20} color={colors.TEXT} />
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((weekday) => (
          <Text key={weekday} style={[styles.weekdayText, { color: colors.TEXT_MUTED || "#B8A6AC" }]}>{weekday}</Text>
        ))}
      </View>

      <FlatList
        data={daysInMonth}
        renderItem={renderCalendarDay}
        keyExtractor={(item) => item.id}
        numColumns={7}
        scrollEnabled={false}
        style={styles.calendarGrid}
      />

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
}

function ExpenseFormRoute() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const subscriptionPlan = String(user?.subscriptionPlan || "FREE").toUpperCase();
  const isPremium = subscriptionPlan === "PREMIUM";
  const title = route.params?.initialData ? "Chỉnh sửa chi tiêu" : "Thêm chi tiêu";

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
      title={title}
    />
  );
}

function ExpenseListRoute() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const colors = useAppColors();

  const {
    activeType,
    currentMonth,
    daysInMonth,
    filteredTransactions,
    groupedTransactions,
    monthlySummary,
    refreshing,
    searchQuery,
    selectedDay,
    showSearch,
    handleDelete,
    loadData,
    nextMonth,
    prevMonth,
    setActiveType,
    setSearchQuery,
    setSelectedDay,
    setShowSearch
  } = useExpenses();

  const handleAddTransaction = useCallback(() => {
    navigation.navigate(activeType === "income" ? "AddIncome" : "AddExpense");
  }, [activeType, navigation]);

  const handleEditTransaction = useCallback((item) => {
    if (!item?.id) return;
    navigation.navigate(item.type === "income" ? "AddIncome" : "AddExpense", { initialData: item });
  }, [navigation]);

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

export default function ExpenseScreen() {
  const route = useRoute();

  if (route.name === "AddExpense") {
    return <ExpenseFormRoute />;
  }

  return <ExpenseListRoute />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700"
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16
  },
  actionIcon: {
    padding: 4
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0
  },
  listContent: {
    paddingBottom: 24
  },
  listHeader: {
    marginBottom: 16
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16
  },
  segmentContainer: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
    marginBottom: 16
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10
  },
  segmentButtonActive: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.16,
    shadowRadius: 1.5
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: "750"
  },
  segmentButtonTextActive: {
    color: "#FFF"
  },
  monthNavBtn: {
    padding: 4
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: "600"
  },
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 8
  },
  weekdayText: {
    width: "14%",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600"
  },
  calendarGrid: {
    marginBottom: 16
  },
  calendarDayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 2,
    paddingBottom: 4
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500"
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
    height: 4
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2
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
    shadowRadius: 2
  },
  summaryCol: {
    flex: 1,
    alignItems: "center"
  },
  summaryDivider: {
    width: 1,
    height: "80%",
    alignSelf: "center"
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginBottom: 4
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "700"
  },
  dateGroupContainer: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 0.5
  },
  groupHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    marginBottom: 8
  },
  groupDateText: {
    fontSize: 12,
    fontWeight: "700"
  },
  groupTotalRow: {
    flexDirection: "row",
    gap: 8
  },
  groupTotalText: {
    fontSize: 11,
    fontWeight: "600"
  },
  rowWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8
  },
  rowTexts: {
    marginLeft: 10,
    flex: 1
  },
  rowName: {
    fontSize: 14,
    fontWeight: "600"
  },
  rowNote: {
    fontSize: 11,
    marginTop: 2
  },
  rowAmount: {
    fontSize: 14,
    fontWeight: "700"
  },
  rowRight: {
    alignItems: "flex-end",
    minWidth: 104
  },
  rowActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 5
  },
  rowActionButton: {
    width: 28,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 4
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18
  }
});
