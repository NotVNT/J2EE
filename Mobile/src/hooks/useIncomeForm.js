import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { fetchCategoriesByType } from "../services/categoryService";
import { createIncome, updateIncome } from "../services/incomeService";
import { fetchJars } from "../services/jarService";
import { formatCurrencyInput, getApiErrorMessage, parseCurrencyInput, todayIso } from "../utils/format";


function buildAllocations(jars, total) {
  if (!jars.length || total <= 0) {
    return [];
  }

  let remaining = total;
  return jars.map((jar, index) => {
    const percentage = jar.targetPercentage ?? 0;
    let amount;
    if (index === jars.length - 1) {
      amount = remaining;
    } else {
      amount = Math.round((total * percentage) / 100);
      remaining -= amount;
    }

    return {
      jarId: jar.id,
      jarName: jar.name,
      jarIcon: jar.icon,
      jarColor: jar.color,
      amount,
      percentage
    };
  });
}

function buildExistingAllocations(jars, existingAllocations = []) {
  if (!jars.length || !existingAllocations.length) {
    return [];
  }

  return jars.map((jar) => {
    const existing = existingAllocations.find((allocation) => Number(allocation.jarId) === Number(jar.id));
    return {
      jarId: jar.id,
      jarName: jar.name,
      jarIcon: jar.icon,
      jarColor: jar.color,
      amount: Number(existing?.amount || 0),
      percentage: jar.targetPercentage ?? 0
    };
  });
}

export default function useIncomeForm({ initialData, onSaved }) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [name, setName] = useState(initialData?.name || "");
  const [amount, setAmount] = useState(initialData?.amount ? formatCurrencyInput(String(initialData.amount)) : "");
  const [date, setDate] = useState(initialData?.date || todayIso());
  const [categoryId, setCategoryId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [jars, setJars] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [amountTouched, setAmountTouched] = useState(false);
  const [showAllocations, setShowAllocations] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      setCategoryLoading(true);
      try {
        const data = await fetchCategoriesByType("income");
        if (!active) return;
        setCategories(data);
        if (data.length > 0) {
          setCategoryId(String(initialData?.categoryId || data[0].id));
        }
      } catch (error) {
        Alert.alert(t("common.error"), t("incomeForm.loadCategoryFailMsg"));
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
      try {
        const data = await fetchJars();
        if (active) {
          setJars(data);
        }
      } catch (error) {
        console.error("Lỗi tải hũ để phân bổ:", error);
      }
    }

    loadJars();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const shouldUseExistingAllocations = initialData?.id && !amountTouched && initialData?.allocations?.length > 0;
    if (shouldUseExistingAllocations) {
      setAllocations(buildExistingAllocations(jars, initialData.allocations));
      return;
    }

    setAllocations(buildAllocations(jars, parseCurrencyInput(amount)));
  }, [amount, amountTouched, initialData, jars]);

  useEffect(() => {
    if (!initialData) return;

    if (initialData.name) setName(initialData.name);
    if (initialData.amount) setAmount(formatCurrencyInput(String(initialData.amount)));
    if (initialData.date) setDate(initialData.date);
    if (initialData.categoryId) setCategoryId(String(initialData.categoryId));

    if (initialData.categoryHint && categories.length > 0) {
      const hint = initialData.categoryHint.toLowerCase();
      const matched = categories.find(
        (category) => category.name.toLowerCase().includes(hint) || hint.includes(category.name.toLowerCase())
      );
      if (matched) setCategoryId(String(matched.id));
    }
  }, [initialData, categories]);

  const incomeAmount = parseCurrencyInput(amount) || 0;
  const totalAllocated = useMemo(() => allocations.reduce((sum, allocation) => sum + allocation.amount, 0), [allocations]);
  const allocationDiff = incomeAmount - totalAllocated;

  const setFormattedAmount = useCallback((value) => {
    setAmountTouched(true);
    setAmount(formatCurrencyInput(value));
  }, []);

  const handleAllocationAmountChange = useCallback(
    (index, valueText) => {
      const newAmount = parseCurrencyInput(valueText);
      let diff = newAmount - allocations[index].amount;
      const nextAllocations = [...allocations];
      nextAllocations[index] = { ...nextAllocations[index], amount: newAmount };

      if (diff !== 0 && nextAllocations.length > 1) {
        for (let i = 0; i < nextAllocations.length; i++) {
          if (i !== index && diff !== 0) {
            if (diff > 0) {
              const subtractAmount = Math.min(nextAllocations[i].amount, diff);
              nextAllocations[i].amount -= subtractAmount;
              diff -= subtractAmount;
            } else {
              nextAllocations[i].amount -= diff;
              diff = 0;
            }
          }
        }
      }

      setAllocations(nextAllocations);
    },
    [allocations]
  );

  const onSave = useCallback(async () => {
    const normalizedName = name.trim();
    const numericAmount = parseCurrencyInput(amount);

    if (!normalizedName) {
      Alert.alert(t("incomeForm.missingInfoTitle"), t("incomeForm.missingName"));
      return;
    }

    if (!amount.trim()) {
      Alert.alert(t("incomeForm.missingInfoTitle"), t("incomeForm.missingAmount"));
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert(t("incomeForm.invalidAmountTitle"), t("incomeForm.invalidAmountMsg"));
      return;
    }

    if (!categoryId) {
      Alert.alert(t("incomeForm.missingCategoryTitle"), t("incomeForm.missingCategoryMsg"));
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
        icon: selectedCategory?.icon || ""
      };

      if (jars.length > 0 && allocations.length > 0) {
        payload.allocations = allocations
          .filter((allocation) => allocation.amount > 0)
          .map((allocation) => ({ jarId: allocation.jarId, amount: allocation.amount }));
      }

      const isEditing = Boolean(initialData?.id);
      if (isEditing) {
        await updateIncome(initialData.id, payload);
      } else {
        await createIncome(payload);
      }

      const successMessage = isEditing ? t("incomeForm.updateSuccess") : t("incomeForm.createSuccess");
      Alert.alert(t("common.success"), successMessage, [{ text: t("common.ok"), onPress: onSaved }]);
    } catch (error) {
      Alert.alert(t("incomeForm.saveFailTitle"), getApiErrorMessage(error, t("incomeForm.saveFailMsg")));
    } finally {
      setSubmitting(false);
    }
  }, [allocations, amount, categories, categoryId, date, initialData, jars.length, name, onSaved]);

  return {
    allocationDiff,
    allocations,
    amount,
    categories,
    categoryId,
    categoryLoading,
    date,
    handleAllocationAmountChange,
    incomeAmount,
    jars,
    name,
    onSave,
    setAmount: setFormattedAmount,
    setCategoryId,
    setDate,
    setName,
    setShowAllocations,
    showAllocations,
    submitting,
    totalAllocated
  };
}
