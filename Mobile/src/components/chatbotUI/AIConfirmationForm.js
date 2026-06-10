import React, { useState, useEffect } from "react";
import {
  Alert,
  Text,
  View,
  TextInput,
  Pressable,
  ActivityIndicator
} from "react-native";
import { useAppColors } from "../../constants/colors";
import { getFieldsForIntent, INTENT_ICONS, INTENT_LABELS } from "../../utils/aiIntent";
import { fetchCategoriesByType } from "../../services/categoryService";
import CategorySelectionModal from "./CategorySelectionModal";
import styles from "./AIConfirmationFormStyles";

export default function AIConfirmationForm({
  intent,
  extractedFields = {},
  suggestedValues = {},
  confirmationPrompt = "",
  onConfirm,
  onCancel,
  isProcessing = false
}) {
  const colors = useAppColors();
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [activeCategoryField, setActiveCategoryField] = useState(null);

  useEffect(() => {
    const fieldDefs = getFieldsForIntent(intent);
    const merged = { ...suggestedValues, ...extractedFields };
    setFields(fieldDefs);

    const initialData = {};
    fieldDefs.forEach((f) => {
      // For date fields, default to today if not provided
      if (f.type === "date" && !merged[f.key]) {
        initialData[f.key] = new Date().toISOString().split("T")[0];
      } else {
        initialData[f.key] = merged[f.key] !== undefined ? String(merged[f.key]) : "";
      }
    });
    setFormData(initialData);

    // Fetch categories if required
    const categoryField = fieldDefs.find((f) => f.type === "category_select");
    if (categoryField && categoryField.categoryType) {
      setLoadingCategories(true);
      fetchCategoriesByType(categoryField.categoryType)
        .then((data) => {
          setCategories(data);
        })
        .catch(() => {})
        .finally(() => setLoadingCategories(false));
    }
  }, [intent, extractedFields, suggestedValues]);

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCategorySelect = (categoryName) => {
    if (activeCategoryField) {
      handleFieldChange(activeCategoryField, categoryName);
    }
    setShowCategoryModal(false);
  };

  const openCategoryModal = (fieldKey) => {
    setActiveCategoryField(fieldKey);
    setShowCategoryModal(true);
  };

  const handleSubmit = () => {
    // Basic validation
    const missingField = fields.find((f) => f.required && !formData[f.key]);
    if (missingField) {
      Alert.alert("Thiếu thông tin", `Vui lòng nhập ${missingField.label}`);
      return;
    }
    // Call parent handler
    onConfirm(intent, { ...suggestedValues, ...extractedFields, ...formData });
  };

  const intentIcon = INTENT_ICONS[intent] || "🤖";
  const intentLabel = INTENT_LABELS[intent] || intent;

  return (
    <View style={[styles.card, { backgroundColor: colors.BG, borderColor: colors.ROSE_MIST, shadowColor: colors.PRIMARY }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>{intentIcon}</Text>
        <Text style={[styles.headerTitle, { color: colors.PRIMARY }]}>{intentLabel}</Text>
      </View>

      {/* Confirmation prompt */}
      {!!confirmationPrompt && (
        <Text style={[styles.promptText, { color: colors.TEXT }]}>{confirmationPrompt}</Text>
      )}

      {/* Fields */}
      <View style={styles.fieldsContainer}>
        {fields.map((field) => {
          const value = formData[field.key] || "";
          return (
            <View key={field.key} style={styles.fieldWrapper}>
              <Text style={[styles.fieldLabel, { color: colors.TEXT_SECONDARY }]}>
                {field.label}
                {field.required && <Text style={{ color: colors.PRIMARY }}> *</Text>}
              </Text>

              {field.type === "category_select" ? (
                <Pressable
                  style={[styles.input, styles.pickerButton, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}
                  onPress={() => openCategoryModal(field.key)}
                  disabled={isProcessing || loadingCategories}
                >
                  <Text
                    style={[
                      styles.pickerButtonText,
                      { color: colors.TEXT },
                      !value && { color: colors.TEXT_MUTED }
                    ]}
                  >
                    {loadingCategories
                      ? "Đang tải danh mục..."
                      : value || "-- Chọn danh mục --"}
                  </Text>
                  <Text style={[styles.pickerArrow, { color: colors.TEXT_MUTED }]}>▼</Text>
                </Pressable>
              ) : (
                <TextInput
                  style={[styles.input, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER, color: colors.TEXT }]}
                  value={value}
                  onChangeText={(text) => handleFieldChange(field.key, text)}
                  placeholder={field.label}
                  placeholderTextColor={colors.TEXT_MUTED}
                  keyboardType={field.type === "number" ? "numeric" : "default"}
                  editable={!isProcessing}
                />
              )}
            </View>
          );
        })}
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Pressable
          style={[styles.actionBtn, styles.confirmBtn, { backgroundColor: colors.INCOME }, isProcessing && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={colors.WHITE} />
          ) : (
            <Text style={styles.confirmBtnText}>✓ Xác nhận</Text>
          )}
        </Pressable>

        <Pressable
          style={[styles.actionBtn, styles.cancelBtn, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }, isProcessing && styles.btnDisabled]}
          onPress={onCancel}
          disabled={isProcessing}
        >
          <Text style={[styles.cancelBtnText, { color: colors.TEXT_SECONDARY }]}>✕ Hủy</Text>
        </Pressable>
      </View>

      <CategorySelectionModal
        visible={showCategoryModal}
        categories={categories}
        onClose={() => setShowCategoryModal(false)}
        onSelect={handleCategorySelect}
      />
    </View>
  );
}
