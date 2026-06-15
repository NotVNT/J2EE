import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import CategoryGridSelector from "../common/CategoryGridSelector";
import { useAppColors } from "../../constants/colors";
import { formatCurrencyInput, formatMoney } from "../../utils/format";
import { PickDateField } from "../../utils/datePicker";
import { scale } from "../../utils/layoutScale";
import ScreenBackHeader from "../common/ScreenBackHeader";

export default function IncomeForm({ form, insetsStyle, title = "Thêm thu nhập" }) {
  const colors = useAppColors();
  const primaryThemeColor = colors.INCOME; // Teal palette for income
  const lightThemeColor = colors.INCOME_LIGHT;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.BG }]} contentContainerStyle={[styles.content, insetsStyle]} keyboardShouldPersistTaps="handled">
      <ScreenBackHeader title={title} />

      {/* SECTION 1: THÔNG TIN GIAO DỊCH */}
      <View style={[styles.sectionContainer, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER, shadowColor: colors.SHADOW_COLOR || "#000" }]}>
        <Text style={[styles.sectionTitle, { color: primaryThemeColor }]}>Thông tin thu nhập</Text>

        <Text style={[styles.amountLabel, { color: colors.TEXT_SECONDARY }]}>Số tiền thu nhập</Text>
        <TextInput
          style={[styles.amountInput, { borderBottomColor: primaryThemeColor, color: colors.TEXT }]}
          value={form.amount}
          onChangeText={form.setAmount}
          keyboardType="numeric"
          placeholder="0 ₫"
          placeholderTextColor={colors.TEXT_MUTED}
          selectTextOnFocus
        />

        <Text style={[styles.label, { color: colors.TEXT }]}>Tên khoản thu</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.BG, borderColor: colors.CARD_BORDER, color: colors.TEXT }]}
          value={form.name}
          onChangeText={form.setName}
          placeholder="Ví dụ: Lương tháng"
          placeholderTextColor={colors.TEXT_MUTED}
        />
      </View>

      {/* SECTION 2: PHÂN BỔ HŨ TÀI CHÍNH */}
      {form.jars.length > 0 && form.incomeAmount > 0 && (
        <View style={[styles.sectionContainer, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER, shadowColor: colors.SHADOW_COLOR || "#000" }]}>
          <Text style={[styles.sectionTitle, { color: primaryThemeColor }]}>Phân bổ hũ tài chính</Text>

          <Pressable style={[styles.allocHeader, { backgroundColor: lightThemeColor, borderRadius: 10 }]} onPress={() => form.setShowAllocations(!form.showAllocations)}>
            <Text style={[styles.allocHeaderTitle, { color: primaryThemeColor }]}>
              💰 Phân bổ vào {form.jars.length} hũ ({formatMoney(form.totalAllocated)} / {formatMoney(form.incomeAmount)})
            </Text>
            <Text style={[styles.allocHeaderArrow, { color: primaryThemeColor }]}>{form.showAllocations ? "▲" : "▼"}</Text>
          </Pressable>

          {form.showAllocations && (
            <View style={styles.allocList}>
              {form.allocations.map((allocation, index) => {
                const jarColor = allocation.jarColor || primaryThemeColor;
                return (
                  <View key={allocation.jarId} style={[styles.allocRow, { borderBottomColor: colors.BG }]}>
                    <View style={styles.allocRowLeft}>
                      <View style={[styles.allocJarIconBox, { backgroundColor: jarColor + "18" }]}>
                        <Text style={styles.allocJarIcon}>{allocation.jarIcon || "🏺"}</Text>
                      </View>
                      <View style={styles.allocJarInfo}>
                        <Text style={[styles.allocJarName, { color: colors.TEXT }]} numberOfLines={1}>
                          {allocation.jarName}
                        </Text>
                        <Text style={[styles.allocJarPct, { color: colors.TEXT_MUTED }]}>Mục tiêu: {allocation.percentage}%</Text>
                      </View>
                    </View>
                    <TextInput
                      style={[styles.allocInput, { borderBottomColor: colors.CARD_BORDER, color: primaryThemeColor }]}
                      value={formatCurrencyInput(String(allocation.amount))}
                      onChangeText={(value) => form.handleAllocationAmountChange(index, value)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={colors.TEXT_MUTED}
                    />
                  </View>
                );
              })}

              {form.allocationDiff !== 0 && (
                <Text style={[styles.allocWarning, form.allocationDiff > 0 ? styles.allocWarningUnder : styles.allocWarningOver]}>
                  {form.allocationDiff > 0
                    ? `⚠️ Còn ${formatMoney(form.allocationDiff)} chưa được phân bổ`
                    : `⚠️ Vượt ${formatMoney(Math.abs(form.allocationDiff))} so với số tiền nhập`}
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* SECTION 3: PHÂN LOẠI GIAO DỊCH */}
      <View style={[styles.sectionContainer, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER, shadowColor: colors.SHADOW_COLOR || "#000" }]}>
        <Text style={[styles.sectionTitle, { color: primaryThemeColor }]}>Phân loại giao dịch</Text>

        <PickDateField label="Ngày nhận" value={form.date} onChange={form.setDate} />

        <Text style={[styles.label, { color: colors.TEXT, marginTop: 16, marginBottom: 8 }]}>Danh mục</Text>
        <CategoryGridSelector
          categories={form.categories}
          selectedId={form.categoryId}
          onSelect={form.setCategoryId}
          loading={form.categoryLoading}
          emptyText="Chưa có danh mục thu nhập. Hãy tạo ở tab Danh mục."
        />
      </View>

      <Pressable style={[styles.saveButton, { backgroundColor: primaryThemeColor }, form.submitting && styles.saveButtonDisabled]} onPress={form.onSave} disabled={form.submitting}>
        <Text style={styles.saveButtonText}>{form.submitting ? "Đang lưu..." : "Lưu thu nhập"}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: scale(14),
    paddingBottom: scale(100),
  },
  sectionContainer: {
    borderRadius: scale(16),
    borderWidth: 1,
    padding: scale(16),
    marginBottom: scale(14),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: scale(14),
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: scale(2),
  },
  amountInput: {
    fontSize: scale(30),
    fontWeight: "800",
    textAlign: "center",
    paddingVertical: scale(6),
    borderBottomWidth: 1.5,
    marginBottom: scale(16),
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: scale(6),
  },
  input: {
    borderRadius: scale(10),
    borderWidth: 1,
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    marginBottom: scale(12),
    fontSize: 14,
  },
  allocHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: scale(12),
    paddingHorizontal: scale(14),
  },
  allocHeaderTitle: {
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
  },
  allocHeaderArrow: {
    fontSize: 12,
    fontWeight: "800",
    marginLeft: scale(8),
  },
  allocList: {
    paddingHorizontal: scale(4),
    paddingVertical: scale(4),
  },
  allocRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingVertical: scale(10),
    paddingHorizontal: scale(4),
  },
  allocRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: scale(10),
  },
  allocJarIconBox: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(8),
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(10),
  },
  allocJarIcon: {
    fontSize: 16,
  },
  allocJarInfo: {
    flex: 1,
  },
  allocJarName: {
    fontSize: 13,
    fontWeight: "600",
  },
  allocJarPct: {
    fontSize: 10,
    marginTop: scale(2),
  },
  allocInput: {
    width: scale(120),
    borderBottomWidth: 1,
    textAlign: "right",
    paddingVertical: scale(4),
    paddingHorizontal: scale(8),
    fontSize: 14,
    fontWeight: "700",
  },
  allocWarning: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: scale(8),
    marginTop: scale(4),
  },
  allocWarningUnder: {
    color: "#FFB84D",
  },
  allocWarningOver: {
    color: "#E76F51",
  },
  saveButton: {
    borderRadius: scale(12),
    paddingVertical: scale(13),
    alignItems: "center",
    marginTop: scale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 15,
  },
});
