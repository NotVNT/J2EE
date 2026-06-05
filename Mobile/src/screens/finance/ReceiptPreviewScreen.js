import React, { useCallback } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import JarSelector from "../../components/Receipt/JarSelector";
import ReceiptItemRow from "../../components/Receipt/ReceiptItemRow";
import ReceiptSummaryCard from "../../components/Receipt/ReceiptSummaryCard";
import { COLORS, useAppColors } from "../../constants/colors";
import useReceiptPreview from "../../hooks/useReceiptPreview";
import { getSafeAreaBottom, getSafeAreaTop } from "../../utils/safeArea";
import { scale } from "../../utils/layoutScale";
import ScreenBackHeader from "../../components/common/ScreenBackHeader";

export default function ReceiptPreviewScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const colors = useAppColors();

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const {
    categories,
    categoriesLoading,
    confirmImport,
    deleteItem,
    hasInitialItems,
    items,
    jarId,
    jars,
    jarsLoading,
    receiptMeta,
    setJarId,
    submitting,
    totalAmount,
    updateItem
  } = useReceiptPreview({
    analyzeResult: route.params?.analyzeResult,
    onImportSuccess: handleBack
  });

  if (!hasInitialItems && !submitting) {
    return <ReceiptPreviewEmptyState onBack={handleBack} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.APP_BACKGROUND || colors.BG, paddingTop: getSafeAreaTop(insets) }]}>
      <ScreenBackHeader title="Xem lại hóa đơn" style={styles.screenHeader} />
      <ReceiptSummaryCard
        itemCount={items.length}
        location={receiptMeta.location}
        merchant={receiptMeta.merchant}
        receiptDate={receiptMeta.receiptDate}
        totalAmount={totalAmount}
      />

      <ScrollView
        style={styles.list}
        contentContainerStyle={[styles.listContent, { paddingBottom: getSafeAreaBottom(insets) }]}
        keyboardShouldPersistTaps="handled"
      >
        <JarSelector
          jarId={jarId}
          jars={jars}
          loading={jarsLoading}
          onChange={setJarId}
        />

        {items.map((item, index) => (
          <ReceiptItemRow
            key={String(index)}
            item={item}
            index={index}
            categories={categories}
            categoriesLoading={categoriesLoading}
            onUpdate={updateItem}
            onDelete={deleteItem}
          />
        ))}
      </ScrollView>

      <ReceiptPreviewFooter
        itemCount={items.length}
        onCancel={handleBack}
        onConfirm={confirmImport}
        submitting={submitting}
      />
    </View>
  );
}

function ReceiptPreviewEmptyState({ onBack }) {
  const insets = useSafeAreaInsets();
  const colors = useAppColors();

  return (
    <View style={[styles.emptyContainer, { backgroundColor: colors.APP_BACKGROUND || colors.BG, paddingTop: getSafeAreaTop(insets) }]}>
      <ScreenBackHeader title="Xem lại hóa đơn" style={styles.screenHeader} />
      <View style={styles.emptyBody}>
        <Text style={styles.emptyIcon}>🧾</Text>
        <Text style={[styles.emptyTitle, { color: colors.TEXT }]}>Không nhận diện được khoản chi</Text>
        <Text style={[styles.emptyText, { color: colors.TEXT_SECONDARY }]}>
          Gemini không tìm thấy mặt hàng nào trong ảnh.{"\n"}
          Hãy thử lại với ảnh rõ hơn hoặc nhập tay.
        </Text>
        <Pressable style={[styles.backButton, { backgroundColor: colors.PRIMARY }]} onPress={onBack}>
          <Text style={[styles.backButtonText, { color: colors.WHITE || "#FFFFFF" }]}>← Quay lại</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ReceiptPreviewFooter({ itemCount, onCancel, onConfirm, submitting }) {
  const colors = useAppColors();

  return (
    <View style={[styles.footer, { backgroundColor: colors.CARD, borderTopColor: colors.CARD_BORDER }]}>
      <Pressable style={[styles.confirmButton, { backgroundColor: colors.PRIMARY }]} onPress={onConfirm} disabled={submitting}>
        {submitting ? (
          <ActivityIndicator color={colors.WHITE || "#FFFFFF"} size="small" />
        ) : (
          <Text style={[styles.confirmButtonText, { color: colors.WHITE || "#FFFFFF" }]}>✅ Xác nhận lưu ({itemCount} mục)</Text>
        )}
      </Pressable>

      <Pressable style={[styles.cancelButton, { borderColor: colors.BORDER || colors.CARD_BORDER }]} onPress={onCancel} disabled={submitting}>
        <Text style={[styles.cancelButtonText, { color: colors.TEXT_SECONDARY }]}>Hủy</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenHeader: {
    marginHorizontal: scale(16),
    marginBottom: scale(8),
  },
  list: {
    flex: 1
  },
  listContent: {
    padding: scale(16),
    paddingTop: scale(8),
    gap: scale(12),
    paddingBottom: scale(24)
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: scale(16),
  },
  emptyBody: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: scale(32)
  },
  emptyIcon: {
    fontSize: scale(56),
    marginBottom: scale(16)
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: scale(8),
    textAlign: "center"
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: scale(24),
    lineHeight: scale(20)
  },
  backButton: {
    borderRadius: scale(12),
    paddingVertical: scale(12),
    paddingHorizontal: scale(28)
  },
  backButtonText: {
    fontWeight: "700",
    fontSize: 15
  },
  footer: {
    padding: scale(16),
    borderTopWidth: 1,
    gap: scale(10)
  },
  confirmButton: {
    borderRadius: scale(14),
    paddingVertical: scale(14),
    alignItems: "center",
    shadowOpacity: 0.25,
    shadowRadius: scale(8),
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    elevation: 3
  },
  confirmButtonText: {
    fontWeight: "800",
    fontSize: 16
  },
  cancelButton: {
    borderRadius: scale(14),
    paddingVertical: scale(12),
    alignItems: "center",
    borderWidth: 1,
  },
  cancelButtonText: {
    fontWeight: "600",
    fontSize: 14
  }
});
