import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useAppColors } from "../../constants/colors";
import { PickDateField } from "../../utils/datePicker";
import CategoryGridSelector from "../common/CategoryGridSelector";
import ExpenseNoteField from "./ExpenseNoteField";
import AppIcon from "../ui/AppIcon";
import { formatMoney } from "../../utils/format";
import { getJarBalanceAmount } from "../../utils/jar";
import ScreenBackHeader from "../common/ScreenBackHeader";
import styles from "./ExpenseFormStyles";

export default function ExpenseForm({ form, insetsStyle, isPremium, isScanning, onImportReceipt, title = "Thêm chi tiêu" }) {
  const colors = useAppColors();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.BG }]} contentContainerStyle={[styles.content, insetsStyle]} keyboardShouldPersistTaps="handled">
      <ScreenBackHeader title={title} />

      {/* SECTION 1: THÔNG TIN GIAO DỊCH */}
      <View style={[styles.sectionContainer, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER, shadowColor: colors.SHADOW_COLOR || "#000" }]}>
        <Text style={[styles.sectionTitle, { color: colors.ACTION_EXPENSE || "#F97316" }]}>Thông tin giao dịch</Text>

        <Text style={[styles.amountLabel, { color: colors.TEXT_SECONDARY }]}>Số tiền chi tiêu</Text>
        <TextInput
          style={[styles.amountInput, { borderBottomColor: colors.ACTION_EXPENSE || "#F97316", color: colors.TEXT }]}
          value={form.amount}
          onChangeText={form.setAmount}
          keyboardType="numeric"
          placeholder="0 ₫"
          placeholderTextColor={colors.TEXT_MUTED}
          selectTextOnFocus
        />

        <Text style={[styles.label, { color: colors.TEXT }]}>Tên khoản chi</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.BG, borderColor: colors.CARD_BORDER, color: colors.TEXT }]}
          value={form.name}
          onChangeText={form.setName}
          placeholder="Ví dụ: Mua đồ ăn"
          placeholderTextColor={colors.TEXT_MUTED}
        />

        <PickDateField label="Ngày chi" value={form.date} onChange={form.setDate} />
      </View>

      {/* SECTION 2: DANH MỤC & HŨ */}
      <View style={[styles.sectionContainer, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER, shadowColor: colors.SHADOW_COLOR || "#000" }]}>
        <Text style={[styles.sectionTitle, { color: colors.ACTION_EXPENSE || "#F97316" }]}>Phân loại chi tiêu</Text>

        <Text style={[styles.label, { color: colors.TEXT, marginBottom: 8 }]}>Danh mục</Text>
        <CategoryGridSelector
          categories={form.categories}
          selectedId={form.categoryId}
          onSelect={form.setCategoryId}
          loading={form.categoryLoading}
          highlighted
          hintText="Chạm để chọn nhóm chi tiêu"
          placeholder="Chọn ngay"
          emptyText="Chưa có danh mục. Hãy tạo ở tab Danh mục."
        />

        <Text style={[styles.label, { color: colors.TEXT, marginTop: 16, marginBottom: 8 }]}>Hũ tài chính liên kết</Text>
        {form.jarsLoading ? (
          <Text style={[styles.mutedText, { color: colors.TEXT_MUTED }]}>Đang tải danh sách hũ...</Text>
        ) : form.jars.length === 0 ? (
          <Text style={[styles.mutedText, { color: colors.TEXT_MUTED }]}>Chưa tạo hũ. Hãy thiết lập trong Tiện ích khác.</Text>
        ) : (
          <View style={styles.jarsSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.jarsContainer}>
              {form.jars.map((jar) => {
                const isSelected = String(jar.id) === form.jarId;
                const color = jar.color || colors.ACTION_EXPENSE || "#F97316";
                return (
                  <Pressable
                    key={jar.id}
                    onPress={() => form.setJarId(isSelected ? "" : String(jar.id))}
                    style={[
                      styles.jarItem,
                      { backgroundColor: colors.BG, borderColor: colors.CARD_BORDER },
                      isSelected && { borderColor: color, backgroundColor: `${color}12` }
                    ]}
                  >
                    <View style={[styles.jarEmojiBox, { backgroundColor: `${color}18` }]}>
                      <Text style={styles.jarEmoji}>{jar.icon || "🏺"}</Text>
                    </View>
                    <View style={styles.jarInfoText}>
                      <Text style={[styles.jarName, { color: colors.TEXT }, isSelected && { color, fontWeight: "800" }]} numberOfLines={1}>{jar.name}</Text>
                      <Text style={[styles.jarBalance, { color: colors.TEXT_SECONDARY }]} numberOfLines={1}>Còn: {formatMoney(getJarBalanceAmount(jar))}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>

      {/* SECTION 3: GHI CHÚ & HÓA ĐƠN */}
      <View style={[styles.sectionContainer, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER, shadowColor: colors.SHADOW_COLOR || "#000" }]}>
        <Text style={[styles.sectionTitle, { color: colors.ACTION_EXPENSE || "#F97316" }]}>Ghi chú & Hóa đơn</Text>

        <ExpenseNoteField value={form.note} onChange={form.setNote} onVoiceResult={form.handleVoiceResult} />

        {form.splitInfo?.splits?.length > 0 && (
          <View style={[styles.splitBanner, { backgroundColor: colors.INFO_LIGHT, borderColor: colors.INFO }]}>
            <Text style={[styles.splitTitle, { color: colors.INFO }]}>Phát hiện chia tiền</Text>
            {form.splitInfo.splits.map((split, index) => (
              <Text key={`${split.label}-${index}`} style={[styles.splitText, { color: colors.TEXT }]}>
                {split.label}
              </Text>
            ))}
            {form.splitInfo.myShareLabel && <Text style={[styles.splitMyShare, { color: colors.ACTION_EXPENSE || "#F97316" }]}>{form.splitInfo.myShareLabel}</Text>}
          </View>
        )}

        <Pressable
          style={[
            styles.importBanner,
            { backgroundColor: colors.BG, borderColor: colors.ACTION_EXPENSE || "#F97316", shadowColor: colors.ACTION_EXPENSE || "#F97316" },
            isScanning && styles.importBannerScanning
          ]}
          onPress={onImportReceipt}
          disabled={isScanning}
        >
          {isScanning ? (
            <View style={styles.importBannerInner}>
              <ActivityIndicator color={colors.ACTION_EXPENSE || "#F97316"} size="small" />
              <Text style={[styles.importBannerText, { color: colors.TEXT_SECONDARY }]}>Đang phân tích hóa đơn...</Text>
            </View>
          ) : (
            <View style={styles.importBannerInner}>
              <View style={[styles.importBannerIconBox, { backgroundColor: colors.BADGE_NEGATIVE_BG || "rgba(239,94,131,0.1)" }]}>
                <AppIcon name="document-attach-outline" size={18} color={colors.ACTION_EXPENSE || "#F97316"} />
              </View>
              <View style={styles.importBannerBody}>
                <Text style={[styles.importBannerTitle, { color: colors.ACTION_EXPENSE || "#F97316" }]}>Nhập từ hóa đơn AI</Text>
                <Text style={[styles.importBannerSub, { color: colors.TEXT_MUTED }]}>Quét ảnh hóa đơn hoặc file PDF{!isPremium ? "  •  Premium" : ""}</Text>
              </View>
              <AppIcon name="chevron-forward" size={16} color={colors.ACTION_EXPENSE || "#F97316"} />
            </View>
          )}
        </Pressable>
      </View>

      <Pressable style={[styles.saveButton, { backgroundColor: colors.ACTION_EXPENSE || "#F97316" }, form.submitting && styles.saveButtonDisabled]} onPress={form.onSave} disabled={form.submitting}>
        <Text style={styles.saveButtonText}>{form.submitting ? "Đang lưu..." : "Lưu chi tiêu"}</Text>
      </Pressable>
    </ScrollView>
  );
}

