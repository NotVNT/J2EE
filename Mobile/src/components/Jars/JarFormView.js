import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Modal, Dimensions } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import apiClient from "../../services/apiClient";
import { API_ENDPOINTS } from "../../constants/api";
import { useAppColors } from "../../constants/colors";
import { getApiErrorMessage } from "../../utils/format";
import { JAR_COLORS, JAR_EMOJI_CATEGORIES, PARENT_WALLET_NAME } from "../../utils/jar";
import { getSafeAreaContentStyle } from "../../utils/safeArea";
import { scale } from "../../utils/layoutScale";
import ScreenBackHeader from "../common/ScreenBackHeader";

export default function JarFormView() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const colors = useAppColors();
  const { t } = useTranslation();

  const isEditing = route.params?.isEditing ?? false;
  const initialData = route.params?.initialData ?? null;

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🏺");
  const [color, setColor] = useState("#8B5CF6");
  const [targetPercentage, setTargetPercentage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (isEditing && initialData) {
      setName(initialData.name || "");
      setIcon(initialData.icon || "🏺");
      setColor(initialData.color || "#8B5CF6");
      setTargetPercentage(initialData.targetPercentage?.toString() || "");
    }
  }, [isEditing, initialData]);

  const onSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert(t("jarForm.missingNameTitle"), t("jarForm.missingNameMsg"));
      return;
    }

    const pct = trimmedName === PARENT_WALLET_NAME ? 0 : parseFloat(targetPercentage);
    if (trimmedName !== PARENT_WALLET_NAME && (isNaN(pct) || pct < 0 || pct > 100)) {
      Alert.alert(t("jarForm.invalidPctTitle"), t("jarForm.invalidPctMsg"));
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: trimmedName,
        icon: icon.trim(),
        color,
        targetPercentage: pct,
      };

      if (isEditing && initialData?.id) {
        await apiClient.put(API_ENDPOINTS.UPDATE_JAR(initialData.id), payload);
        Alert.alert(t("jarForm.successUpdateTitle"), t("jarForm.successUpdateMsg"));
      } else {
        await apiClient.post(API_ENDPOINTS.ADD_JAR, payload);
        Alert.alert(t("jarForm.successCreateTitle"), t("jarForm.successCreateMsg"));
      }

      navigation.goBack();
    } catch (err) {
      console.error("Lỗi lưu hũ:", err);
      Alert.alert(t("jarForm.errorTitle"), getApiErrorMessage(err, t("jarForm.errorMsg")));
    } finally {
      setSubmitting(false);
    }
  };

  const isParentWallet = name === PARENT_WALLET_NAME;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.BG }]}
      contentContainerStyle={[styles.content, getSafeAreaContentStyle(insets)]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenBackHeader title={isEditing ? t("jarForm.editTitle") : t("jarForm.createTitle")} />

      <Text style={[styles.label, { color: colors.TEXT }]}>{t("jarForm.jarName")}</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER, color: colors.TEXT },
          isParentWallet && { backgroundColor: colors.BG, color: colors.TEXT_MUTED }
        ]}
        value={isParentWallet ? t("jarForm.parentWalletName") : name}
        onChangeText={setName}
        placeholder={t("jarForm.jarNamePlaceholder")}
        placeholderTextColor={colors.TEXT_MUTED}
        editable={!isParentWallet}
      />

      <Text style={[styles.label, { color: colors.TEXT }]}>{t("jarForm.iconLabel")}</Text>
      <View style={[styles.emojiPickerContainer, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}>
        <Pressable
          style={[styles.emojiBubble, { backgroundColor: colors.BG, borderColor: color || colors.PRIMARY }]}
          onPress={() => setShowEmojiPicker(true)}
        >
          <Text style={styles.emojiBubbleText}>{icon || "🏺"}</Text>
          <View style={[styles.emojiEditBadge, { backgroundColor: color || colors.PRIMARY, borderColor: colors.CARD }]}>
            <Text style={styles.emojiEditBadgeText}>✎</Text>
          </View>
        </Pressable>
        <Text style={[styles.emojiPickerDesc, { color: colors.TEXT_SECONDARY }]}>
          {t("jarForm.iconHint")}
        </Text>
      </View>

      <Text style={[styles.label, { color: colors.TEXT }]}>{t("jarForm.percentageLabel")}</Text>
      {isParentWallet ? (
        <View style={[styles.parentWalletInfo, { backgroundColor: colors.INFO_LIGHT, borderColor: colors.BORDER }]}>
          <Text style={[styles.parentWalletText, { color: colors.TEXT_SECONDARY }]}>
            {t("jarForm.parentWalletInfo")}
          </Text>
        </View>
      ) : (
        <TextInput
          style={[styles.input, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER, color: colors.TEXT }]}
          value={targetPercentage}
          onChangeText={(val) => setTargetPercentage(val.replace(/[^0-9.]/g, ""))}
          placeholder={t("jarForm.percentagePlaceholder")}
          placeholderTextColor={colors.TEXT_MUTED}
          keyboardType="numeric"
        />
      )}

      <Text style={[styles.label, { color: colors.TEXT }]}>{t("jarForm.colorLabel")}</Text>
      <View style={styles.colorsGrid}>
        {JAR_COLORS.map((c) => {
          const isSelected = color === c.value;
          return (
            <Pressable
              key={c.value}
              onPress={() => setColor(c.value)}
              style={[
                styles.colorCircle,
                { backgroundColor: c.value },
                isSelected && [styles.selectedColorCircle, { borderColor: colors.TEXT }],
              ]}
              title={c.label}
            />
          );
        })}
      </View>

      <Pressable
        style={[
          styles.saveButton,
          { backgroundColor: color || colors.PRIMARY, shadowColor: color || colors.PRIMARY },
          submitting && styles.saveButtonDisabled
        ]}
        onPress={onSave}
        disabled={submitting}
      >
        <Text style={styles.saveButtonText}>
          {submitting ? t("jarForm.saving") : isEditing ? t("jarForm.updateSave") : t("jarForm.createSave")}
        </Text>
      </Pressable>

      {/* Bộ Chọn Emoji Modal */}
      <Modal visible={showEmojiPicker} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.CARD }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.CARD_BORDER }]}>
              <Text style={[styles.modalTitle, { color: colors.TEXT }]}>{t("jarForm.modalTitle")}</Text>
              <Pressable onPress={() => setShowEmojiPicker(false)}>
                <Text style={[styles.closeBtn, { color: colors.PRIMARY }]}>{t("jarForm.close")}</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              {JAR_EMOJI_CATEGORIES.map((cat, catIdx) => (
                <View key={catIdx} style={styles.catSection}>
                  <Text style={[styles.catTitle, { color: colors.TEXT_SECONDARY }]}>{cat.localeKey ? t(cat.localeKey) : cat.title}</Text>
                  <View style={styles.emojiGrid}>
                    {cat.emojis.map((emoji) => {
                      const isSelected = icon === emoji;
                      return (
                        <Pressable
                          key={emoji}
                          style={[
                            styles.emojiGridCell,
                            { backgroundColor: colors.BG },
                            isSelected && {
                              borderColor: color || colors.PRIMARY,
                              backgroundColor: (color || colors.PRIMARY) + "18",
                            },
                          ]}
                          onPress={() => {
                            setIcon(emoji);
                            setShowEmojiPicker(false);
                          }}
                        >
                          <Text style={styles.emojiGridText}>{emoji}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: scale(16),
    paddingBottom: scale(100), // Ensures form can scroll completely above bottom tab bar
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  parentWalletInfo: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  parentWalletText: {
    fontSize: 13,
    lineHeight: 18,
  },
  colorsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginVertical: 12,
  },
  colorCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColorCircle: {
    borderWidth: 2.5,
    transform: [{ scale: 1.15 }],
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 24,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },

  // Emojis Picker Giao Diện
  emojiPickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 14,
    marginBottom: 12,
  },
  emojiBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emojiBubbleText: {
    fontSize: 32,
  },
  emojiEditBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  emojiEditBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  emojiPickerDesc: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },

  // Modal Centered Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    borderRadius: 20,
    maxHeight: "80%",
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingBottom: 14,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  closeBtn: {
    fontSize: 14,
    fontWeight: "700",
  },
  modalScroll: {
    paddingBottom: 24,
  },
  catSection: {
    marginBottom: 16,
  },
  catTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  emojiGridCell: {
    width: (Dimensions.get("window").width - 64 - 8 * 5) / 6, // 6 ô mỗi hàng
    height: (Dimensions.get("window").width - 64 - 8 * 5) / 6,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  emojiGridText: {
    fontSize: 24,
  },
});
