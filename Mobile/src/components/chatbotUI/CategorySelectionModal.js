import React from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { COLORS, useAppColors } from "../../constants/colors";

export default function CategorySelectionModal({ categories, onClose, onSelect, visible }) {
  const colors = useAppColors();
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { backgroundColor: colors.OVERLAY }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.CARD }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.CARD_BORDER }]}>
            <Text style={[styles.modalTitle, { color: colors.TEXT }]}>{t("categorySelectionModal.title")}</Text>
            <Pressable style={styles.modalCloseBtn} onPress={onClose}>
              <Text style={[styles.modalCloseText, { color: colors.TEXT_MUTED }]}>✕</Text>
            </Pressable>
          </View>

          <FlatList
            data={categories}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => (
              <Pressable style={[styles.categoryItem, { borderBottomColor: colors.CARD_BORDER }]} onPress={() => onSelect(item.name)}>
                <Text style={styles.categoryIcon}>{item.icon || "📁"}</Text>
                <Text style={[styles.categoryName, { color: colors.TEXT }]}>{item.name}</Text>
              </Pressable>
            )}
            ListEmptyComponent={<Text style={[styles.emptyCategories, { color: colors.TEXT_MUTED }]}>{t("categorySelectionModal.empty")}</Text>}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.OVERLAY,
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "60%",
    paddingBottom: 24
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.CARD_BORDER
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.TEXT
  },
  modalCloseBtn: {
    padding: 4
  },
  modalCloseText: {
    fontSize: 16,
    color: COLORS.TEXT_MUTED,
    fontWeight: "700"
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingTop: 8
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.CARD_BORDER,
    gap: 12
  },
  categoryIcon: {
    fontSize: 20
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.TEXT
  },
  emptyCategories: {
    textAlign: "center",
    color: COLORS.TEXT_MUTED,
    marginVertical: 24,
    fontSize: 14
  }
});
