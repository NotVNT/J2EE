import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useVisibleItems } from "../components/common/ShowMoreButton";
import {
  createCategory,
  deleteCategory,
  fetchCategories as fetchCategoryList,
  updateCategory
} from "../services/categoryService";
import { getApiErrorMessage } from "../utils/format";
import { getFirstCategoryIcon } from "../utils/categoryIcons";


const DEFAULT_TYPE = "income";

function normalizeCategoryType(type) {
  return String(type || DEFAULT_TYPE).toLowerCase() === "expense" ? "expense" : "income";
}

function hasDuplicateName(categories, name, ignoredCategoryId) {
  const normalizedName = name.trim().toLowerCase();
  return categories.some((category) => {
    const sameName = String(category?.name || "").trim().toLowerCase() === normalizedName;
    const isIgnored = ignoredCategoryId && Number(category?.id) === Number(ignoredCategoryId);
    return sameName && !isIgnored;
  });
}

function getFormHint(type, t) {
  if (type === "income") {
    return t("categoryForm.nameHint");
  }
  return t("categoryForm.nameHintExpense");
}

export default function useCategories() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [name, setName] = useState("");
  const [type, setTypeState] = useState(DEFAULT_TYPE);
  const [selectedIcon, setSelectedIcon] = useState(getFirstCategoryIcon(DEFAULT_TYPE));
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditTypeState] = useState(DEFAULT_TYPE);
  const [editIcon, setEditIcon] = useState(getFirstCategoryIcon(DEFAULT_TYPE));
  const [isEditIconPickerOpen, setIsEditIconPickerOpen] = useState(false);
  const [editingCategorySaving, setEditingCategorySaving] = useState(false);

  const formHint = useMemo(() => getFormHint(type, t), [type, t]);

  const {
    visibleItems: visibleCategories,
    canToggle: canExpandCategories,
    expanded: showAllCategories,
    toggle: toggleCategories
  } = useVisibleItems(categories, { initialCount: 3, mode: "toggle" });

  const setCreateType = useCallback((nextType) => {
    const normalizedType = normalizeCategoryType(nextType);
    setTypeState(normalizedType);
    setSelectedIcon(getFirstCategoryIcon(normalizedType));
  }, []);

  const setEditType = useCallback((nextType) => {
    const normalizedType = normalizeCategoryType(nextType);
    setEditTypeState(normalizedType);
    setEditIcon(getFirstCategoryIcon(normalizedType));
  }, []);

  const fetchCategories = useCallback(async () => {
    const data = await fetchCategoryList();
    setCategories(data);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchCategories();
    } catch (error) {
      Alert.alert(t("common.error"), getApiErrorMessage(error, t("categoryForm.loadFail")));
    } finally {
      setRefreshing(false);
    }
  }, [fetchCategories]);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  const resetCreateForm = useCallback(() => {
    setName("");
    setCreateType(DEFAULT_TYPE);
  }, [setCreateType]);

  const onSave = useCallback(async () => {
    const normalizedName = name.trim();
    if (!normalizedName) {
      Alert.alert(t("categoryForm.missingDataTitle"), t("categoryForm.missingName"));
      return;
    }

    if (hasDuplicateName(categories, normalizedName)) {
      Alert.alert(t("categoryForm.duplicateTitle"), t("categoryForm.duplicateMsg"));
      return;
    }

    setSaving(true);
    try {
      await createCategory({
        name: normalizedName,
        icon: selectedIcon,
        type
      });

      resetCreateForm();
      await fetchCategories();
      Alert.alert(t("common.success"), t("categoryForm.createSuccess"));
    } catch (error) {
      Alert.alert(t("categoryForm.saveFailTitle"), getApiErrorMessage(error, t("categoryForm.saveFailMsg")));
    } finally {
      setSaving(false);
    }
  }, [categories, fetchCategories, name, resetCreateForm, selectedIcon, type]);

  const onOpenEditCategory = useCallback((category) => {
    if (!category?.id) return;
    const normalizedType = normalizeCategoryType(category.type);
    setEditingCategory(category);
    setEditName(String(category.name || ""));
    setEditTypeState(normalizedType);
    setEditIcon(String(category.icon || getFirstCategoryIcon(normalizedType)));
  }, []);

  const onCloseEditCategory = useCallback(() => {
    setEditingCategory(null);
    setEditName("");
    setEditTypeState(DEFAULT_TYPE);
    setEditIcon(getFirstCategoryIcon(DEFAULT_TYPE));
    setEditingCategorySaving(false);
    setIsEditIconPickerOpen(false);
  }, []);

  const onDeleteCategory = useCallback(
    (category) => {
      if (!category?.id) return;
      Alert.alert(
        t("categoryForm.deleteTitle"),
        t("categoryForm.deleteConfirm", { name: category.name }),
        [
          { text: t("commonComponents.cancel"), style: "cancel" },
          {
            text: t("commonComponents.delete"),
            style: "destructive",
            onPress: async () => {
              try {
                await deleteCategory(category.id);
                await fetchCategories();
                Alert.alert(t("common.success"), t("categoryForm.deleteSuccess"));
              } catch (error) {
                Alert.alert(t("categoryForm.deleteFailTitle"), getApiErrorMessage(error, t("categoryForm.deleteFailMsg")));
              }
            }
          }
        ]
      );
    },
    [fetchCategories]
  );

  const onUpdateCategory = useCallback(async () => {
    if (!editingCategory?.id) return;
    const normalizedName = editName.trim();
    if (!normalizedName) {
      Alert.alert(t("categoryForm.missingDataTitle"), t("categoryForm.missingName"));
      return;
    }

    if (hasDuplicateName(categories, normalizedName, editingCategory.id)) {
      Alert.alert(t("categoryForm.duplicateTitle"), t("categoryForm.duplicateMsg"));
      return;
    }

    setEditingCategorySaving(true);
    try {
      await updateCategory(editingCategory.id, {
        name: normalizedName,
        type: editType,
        icon: editIcon
      });
      await fetchCategories();
      onCloseEditCategory();
      Alert.alert(t("common.success"), t("categoryForm.updateSuccess"));
    } catch (error) {
      Alert.alert(t("categoryForm.updateFailTitle"), getApiErrorMessage(error, t("categoryForm.updateFailMsg")));
      setEditingCategorySaving(false);
    }
  }, [categories, editIcon, editName, editType, editingCategory, fetchCategories, onCloseEditCategory]);

  return {
    categories,
    canExpandCategories,
    createForm: {
      hint: formHint,
      icon: selectedIcon,
      isIconPickerOpen,
      name,
      saving,
      setIcon: setSelectedIcon,
      setIsIconPickerOpen,
      setName,
      setType: setCreateType,
      type
    },
    editForm: {
      category: editingCategory,
      icon: editIcon,
      isIconPickerOpen: isEditIconPickerOpen,
      name: editName,
      saving: editingCategorySaving,
      setIcon: setEditIcon,
      setIsIconPickerOpen: setIsEditIconPickerOpen,
      setName: setEditName,
      setType: setEditType,
      type: editType
    },
    onCloseEditCategory,
    onDeleteCategory,
    onOpenEditCategory,
    onRefresh,
    onSave,
    onUpdateCategory,
    refreshing,
    showAllCategories,
    toggleCategories,
    visibleCategories
  };
}
