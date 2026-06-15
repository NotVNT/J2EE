import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppColors } from "../../constants/colors";
import { CategoryVectorIcon, getIconColor } from "../../utils/categoryIcons";
import { scale } from "../../utils/layoutScale";

export default function CategoryPickerModal({
  categories,
  loading,
  onClose,
  onSelect,
  selectedId,
  visible
}) {
  const colors = useAppColors();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.modalOverlay, { backgroundColor: colors.OVERLAY }]} onPress={onClose}>
        <View style={[styles.pickerSheet, { backgroundColor: colors.CARD }]}>
          <View style={[styles.pickerHeader, { borderBottomColor: colors.CARD_BORDER }]}>
            <Text style={[styles.pickerTitle, { color: colors.TEXT }]}>Chọn danh mục</Text>
            <Pressable onPress={onClose}>
              <Text style={[styles.pickerClose, { color: colors.PRIMARY }]}>Đóng</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.pickerList}>
            {loading ? <Text style={[styles.emptyPickerText, { color: colors.TEXT_SECONDARY }]}>Đang tải danh mục...</Text> : null}
            {!loading && !categories.length ? (
              <Text style={[styles.emptyPickerText, { color: colors.TEXT_SECONDARY }]}>Chưa có danh mục chi tiêu.</Text>
            ) : null}
            {categories.map((category) => {
              const isSelected = String(category.id) === String(selectedId);
              const iconColor = getIconColor(category.icon);
              return (
                <Pressable
                  key={String(category.id)}
                  style={[styles.pickerItem, isSelected && [styles.pickerItemActive, { backgroundColor: colors.ROSE_MIST }]]}
                  onPress={() => {
                    onSelect(String(category.id));
                    onClose();
                  }}
                >
                  <View style={[styles.pickerIconBubble, { backgroundColor: `${iconColor}18` }]}>
                    <CategoryVectorIcon iconValue={category.icon} size={18} color={iconColor} />
                  </View>
                  <Text style={[styles.pickerItemText, { color: colors.TEXT }, isSelected && [styles.pickerItemTextActive, { color: colors.PRIMARY }]]}>
                    {category.name}
                  </Text>
                  {isSelected ? <Text style={[styles.pickerCheck, { color: colors.PRIMARY }]}>✓</Text> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end"
  },
  pickerSheet: {
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    maxHeight: "65%",
    paddingBottom: scale(24)
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: scale(16),
    borderBottomWidth: 1,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  pickerClose: {
    fontSize: 14,
    fontWeight: "600",
  },
  pickerList: {
    padding: scale(8)
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scale(12),
    paddingHorizontal: scale(12),
    borderRadius: scale(10),
    gap: scale(10)
  },
  pickerItemActive: {},
  pickerIconBubble: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    justifyContent: "center",
    alignItems: "center"
  },
  pickerItemText: {
    fontSize: 14,
    flex: 1
  },
  pickerItemTextActive: {
    fontWeight: "700",
  },
  pickerCheck: {
    fontSize: 16,
    fontWeight: "700"
  },
  emptyPickerText: {
    fontSize: 13,
    padding: scale(14),
    textAlign: "center"
  }
});
