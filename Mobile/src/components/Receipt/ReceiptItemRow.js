import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppColors } from "../../constants/colors";
import { formatCurrencyInput, parseCurrencyInput, todayIso } from "../../utils/format";
import { PickDateField } from "../../utils/datePicker";
import { CategoryVectorIcon, getIconColor } from "../../utils/categoryIcons";
import CategoryPickerModal from "./CategoryPickerModal";
import { scale } from "../../utils/layoutScale";

export default function ReceiptItemRow({
  categories,
  categoriesLoading,
  index,
  item,
  onDelete,
  onUpdate
}) {
  const { t } = useTranslation();
  const colors = useAppColors();
  const [pickerVisible, setPickerVisible] = useState(false);
  const selectedCategory = categories.find((category) => String(category.id) === String(item.categoryId));
  const iconColor = getIconColor(item.icon || selectedCategory?.icon);

  const handleCategorySelect = (categoryId) => {
    const category = categories.find((cat) => String(cat.id) === String(categoryId));
    onUpdate(index, {
      ...item,
      categoryId: categoryId ? Number(categoryId) : null,
      icon: category?.icon || item.icon
    });
  };

  return (
    <View style={[styles.itemCard, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}>
      <View style={styles.itemHeader}>
        <View style={[styles.itemIndexBadge, { backgroundColor: `${colors.PRIMARY}18` }]}>
          <Text style={[styles.itemIndexText, { color: colors.PRIMARY }]}>#{index + 1}</Text>
        </View>

        <Pressable onPress={() => onDelete(index)} style={[styles.itemDeleteBtn, { backgroundColor: colors.BADGE_NEGATIVE_BG || colors.EXPENSE_LIGHT }]}>
          <Text style={[styles.itemDeleteText, { color: colors.BADGE_NEGATIVE_FG || colors.EXPENSE }]}>✕ {t("receiptItem.deleteItem")}</Text>
        </Pressable>
      </View>

      <Text style={[styles.fieldLabel, { color: colors.TEXT_SECONDARY }]}>{t("receiptItem.fieldName")}</Text>
      <TextInput
        style={[styles.textInput, { backgroundColor: colors.BG || colors.APP_BACKGROUND, borderColor: colors.BORDER || colors.CARD_BORDER, color: colors.TEXT }]}
        value={item.name || ""}
        onChangeText={(text) => onUpdate(index, { ...item, name: text })}
        placeholder={t("receiptItem.namePlaceholder")}
        placeholderTextColor={colors.TEXT_MUTED}
      />

      <Text style={[styles.fieldLabel, { color: colors.TEXT_SECONDARY }]}>{t("receiptItem.fieldAmount")}</Text>
      <TextInput
        style={[styles.textInput, { backgroundColor: colors.BG || colors.APP_BACKGROUND, borderColor: colors.BORDER || colors.CARD_BORDER, color: colors.TEXT }]}
        value={item.amount ? formatCurrencyInput(String(item.amount)) : ""}
        onChangeText={(text) => onUpdate(index, { ...item, amount: parseCurrencyInput(text) })}
        placeholder={t("receiptItem.amountPlaceholder")}
        placeholderTextColor={colors.TEXT_MUTED}
        keyboardType="numeric"
      />

      <View style={styles.fieldRow}>
        <View style={styles.fieldHalf}>
          <Text style={[styles.fieldLabel, { color: colors.TEXT_SECONDARY }]}>{t("receiptItem.fieldCategory")}</Text>
          <Pressable style={[styles.categoryBtn, { backgroundColor: colors.BG || colors.APP_BACKGROUND, borderColor: colors.BORDER || colors.CARD_BORDER }]} onPress={() => setPickerVisible(true)}>
            {selectedCategory ? (
              <View style={styles.categoryBtnContent}>
                <View style={[styles.catIconSm, { backgroundColor: `${iconColor}18` }]}>
                  <CategoryVectorIcon iconValue={selectedCategory.icon} size={14} color={iconColor} />
                </View>
                <Text style={[styles.categoryBtnText, { color: colors.TEXT }]} numberOfLines={1}>
                  {selectedCategory.name}
                </Text>
              </View>
            ) : (
              <Text style={[styles.categoryBtnPlaceholder, { color: colors.TEXT_MUTED }]}>{t("receiptItem.selectCategory")}</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.fieldHalf}>
          <PickDateField
            label={t("receiptItem.fieldDate")}
            value={item.date || todayIso()}
            onChange={(newDate) => onUpdate(index, { ...item, date: newDate })}
          />
        </View>
      </View>

      {item.categoryHint && !item.categoryId ? (
        <Text style={[styles.hintText, { color: colors.WARNING }]}>{t("receiptItem.suggestion")} {item.categoryHint}</Text>
      ) : null}

      <CategoryPickerModal
        visible={pickerVisible}
        categories={categories}
        loading={categoriesLoading}
        selectedId={item.categoryId}
        onSelect={handleCategorySelect}
        onClose={() => setPickerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    borderRadius: scale(14),
    borderWidth: 1,
    padding: scale(14)
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(10)
  },
  itemIndexBadge: {
    borderRadius: scale(8),
    paddingHorizontal: scale(10),
    paddingVertical: scale(3)
  },
  itemIndexText: {
    fontSize: 12,
    fontWeight: "700",
  },
  itemDeleteBtn: {
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: scale(8),
  },
  itemDeleteText: {
    fontSize: 12,
    fontWeight: "600",
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: scale(4),
    marginTop: scale(8)
  },
  textInput: {
    borderRadius: scale(10),
    borderWidth: 1,
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    fontSize: 14,
  },
  fieldRow: {
    flexDirection: "row",
    gap: scale(10),
    marginTop: scale(4)
  },
  fieldHalf: {
    flex: 1
  },
  categoryBtn: {
    borderRadius: scale(10),
    borderWidth: 1,
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    justifyContent: "center",
    minHeight: scale(42)
  },
  categoryBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6)
  },
  catIconSm: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    justifyContent: "center",
    alignItems: "center"
  },
  categoryBtnText: {
    fontSize: 13,
    flex: 1
  },
  categoryBtnPlaceholder: {
    fontSize: 13,
  },
  hintText: {
    fontSize: 12,
    marginTop: scale(6),
    fontStyle: "italic"
  }
});
