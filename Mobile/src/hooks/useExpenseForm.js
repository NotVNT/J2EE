import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { fetchCategoriesByType } from "../services/categoryService";
import { createExpense, updateExpense } from "../services/expenseService";
import { fetchJars } from "../services/jarService";
import { formatCurrencyInput, getApiErrorMessage, parseCurrencyInput, todayIso } from "../utils/format";
import { parseNote, suggestCategory } from "../utils/noteParser";
import { PARENT_WALLET_NAME } from "../utils/jar";


function getDefaultJarId(jars, defaultJarId) {
  if (defaultJarId) {
    return String(defaultJarId);
  }

  const parentWallet = jars.find((jar) => jar.name === PARENT_WALLET_NAME);
  return parentWallet?.id ? String(parentWallet.id) : String(jars[0]?.id || "");
}

export default function useExpenseForm({ defaultJarId, initialData, onSaved }) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayIso());
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote] = useState("");
  const [splitInfo, setSplitInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [jars, setJars] = useState([]);
  const [jarId, setJarId] = useState("");
  const [jarsLoading, setJarsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      setCategoryLoading(true);
      try {
        const data = await fetchCategoriesByType("expense");
        if (!active) return;
        setCategories(data);
        if (data.length > 0) {
          setCategoryId(String(initialData?.categoryId || data[0].id));
        }
      } catch (error) {
        Alert.alert(t("common.error"), getApiErrorMessage(error, t("expenseForm.loadCatFail")));
      } finally {
        if (active) {
          setCategoryLoading(false);
        }
      }
    }

    loadCategories();
    return () => {
      active = false;
    };
  }, [initialData?.categoryId]);

  useEffect(() => {
    let active = true;

    async function loadJars() {
      setJarsLoading(true);
      try {
        const data = await fetchJars();
        if (!active) return;
        setJars(data);
        setJarId(
          initialData?.id
            ? (initialData.jarId ? String(initialData.jarId) : "")
            : getDefaultJarId(data, defaultJarId)
        );
      } catch (error) {
        console.error("Lỗi tải danh sách hũ:", error);
      } finally {
        if (active) {
          setJarsLoading(false);
        }
      }
    }

    loadJars();
    return () => {
      active = false;
    };
  }, [defaultJarId, initialData?.id, initialData?.jarId]);

  useEffect(() => {
    if (!initialData) return;

    if (initialData.name) setName(initialData.name);
    if (initialData.amount) setAmount(formatCurrencyInput(String(initialData.amount)));
    if (initialData.date) setDate(initialData.date);
    if (initialData.note) setNote(initialData.note);
    if (initialData.categoryId) setCategoryId(String(initialData.categoryId));
    if (initialData.jarId) setJarId(String(initialData.jarId));
    if (initialData.id && !initialData.jarId) setJarId("");

    if (initialData.categoryHint && categories.length > 0) {
      const hint = initialData.categoryHint.toLowerCase();
      const matched = categories.find(
        (category) =>
          category.name.toLowerCase().includes(hint) || hint.includes(category.name.toLowerCase())
      );
      if (matched) setCategoryId(String(matched.id));
    }
  }, [initialData, categories]);

  const setFormattedAmount = useCallback((value) => {
    setAmount(formatCurrencyInput(value));
  }, []);

  const handleVoiceResult = useCallback(
    (voiceText) => {
      if (!voiceText) return;

      const parsed = parseNote(voiceText);
      if (parsed.amount > 0) {
        setAmount(formatCurrencyInput(String(parsed.amount)));
      }

      if (parsed.note) {
        setName(parsed.note.length > 40 ? `${parsed.note.substring(0, 40)}...` : parsed.note);
      }

      setSplitInfo(parsed.splitInfo?.splits?.length > 0 ? parsed.splitInfo : null);

      const suggested = suggestCategory(parsed.note, categories);
      if (suggested) {
        setCategoryId(String(suggested.id));
      }
    },
    [categories]
  );

  const onSave = useCallback(async () => {
    const normalizedName = name.trim();
    const numericAmount = parseCurrencyInput(amount);

    if (!normalizedName) {
      Alert.alert(t("expenseForm.missingInfoTitle"), t("expenseForm.missingName"));
      return;
    }

    if (!amount.trim()) {
      Alert.alert(t("expenseForm.missingInfoTitle"), t("expenseForm.missingAmount"));
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert(t("expenseForm.invalidAmountTitle"), t("expenseForm.invalidAmountMsg"));
      return;
    }

    if (!categoryId) {
      Alert.alert(t("expenseForm.missingCategoryTitle"), t("expenseForm.missingCategoryMsg"));
      return;
    }

    setSubmitting(true);
    try {
      const selectedCategory = categories.find((c) => String(c.id) === String(categoryId));
      const payload = {
        name: normalizedName,
        amount: numericAmount,
        categoryId: Number(categoryId),
        date,
        icon: selectedCategory?.icon || "",
        jarId: jarId ? Number(jarId) : null
      };

      const noteTrimmed = note.trim();
      if (noteTrimmed) {
        payload.note = noteTrimmed;
      }

      if (splitInfo?.splits?.length > 0) {
        payload.splitExpense = splitInfo.splits.map((split) => ({
          person: split.person || null,
          amount: split.share
        }));
      }

      const isEditing = Boolean(initialData?.id);
      if (isEditing) {
        await updateExpense(initialData.id, payload);
      } else {
        await createExpense(payload);
      }

      const successMessage = isEditing ? t("expenseForm.updateSuccess") : t("expenseForm.createSuccess");
      Alert.alert(t("common.success"), successMessage, [
        { text: "OK", onPress: onSaved }
      ]);
    } catch (error) {
      Alert.alert(t("expenseForm.saveFailTitle"), getApiErrorMessage(error, t("expenseForm.saveFailMsg")));
    } finally {
      setSubmitting(false);
    }
  }, [amount, categories, categoryId, date, initialData, jarId, name, note, onSaved, splitInfo]);

  return {
    amount,
    categories,
    categoryId,
    categoryLoading,
    date,
    handleVoiceResult,
    jarId,
    jars,
    jarsLoading,
    name,
    note,
    onSave,
    setAmount: setFormattedAmount,
    setCategoryId,
    setDate,
    setJarId,
    setName,
    setNote,
    splitInfo,
    submitting
  };
}
