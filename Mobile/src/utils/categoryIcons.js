import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ICON_PREFIX = "mdi:";

export const CATEGORY_ICON_PRESETS = {
  income: [
    { value: `${ICON_PREFIX}cash-multiple`, iconName: "cash-multiple", color: "#16a34a", label: "Cash", localeKey: "iconLabels.cash" },
    { value: `${ICON_PREFIX}briefcase`, iconName: "briefcase", color: "#2563eb", label: "Work", localeKey: "iconLabels.work" },
    { value: `${ICON_PREFIX}gift`, iconName: "gift", color: "#db2777", label: "Gift", localeKey: "iconLabels.gift" },
    { value: `${ICON_PREFIX}bank`, iconName: "bank", color: "#0f766e", label: "Bank", localeKey: "iconLabels.bank" },
    { value: `${ICON_PREFIX}trending-up`, iconName: "trending-up", color: "#7c3aed", label: "Growth", localeKey: "iconLabels.growth" },
    { value: `${ICON_PREFIX}wallet-plus`, iconName: "wallet-plus", color: "#15803d", label: "Wallet", localeKey: "iconLabels.wallet" },
    { value: `${ICON_PREFIX}account-cash`, iconName: "account-cash", color: "#0284c7", label: "Personal income", localeKey: "iconLabels.personalIncome" },
    { value: `${ICON_PREFIX}cash-refund`, iconName: "cash-refund", color: "#0ea5e9", label: "Refund", localeKey: "iconLabels.refund" },
    { value: `${ICON_PREFIX}piggy-bank`, iconName: "piggy-bank", color: "#ca8a04", label: "Savings", localeKey: "iconLabels.savings" },
    { value: `${ICON_PREFIX}hand-coin`, iconName: "hand-coin", color: "#8b5cf6", label: "Interest", localeKey: "iconLabels.interest" },
    { value: `${ICON_PREFIX}chart-line`, iconName: "chart-line", color: "#4338ca", label: "Investment", localeKey: "iconLabels.investment" },
    { value: `${ICON_PREFIX}cash-check`, iconName: "cash-check", color: "#16a34a", label: "Debt collection", localeKey: "iconLabels.debtCollection" }
  ],
  expense: [
    { value: `${ICON_PREFIX}noodles`, iconName: "noodles", color: "#d97706", label: "Food", localeKey: "iconLabels.food" },
    { value: `${ICON_PREFIX}cart`, iconName: "cart", color: "#0ea5e9", label: "Shopping", localeKey: "iconLabels.shopping" },
    { value: `${ICON_PREFIX}car`, iconName: "car", color: "#475467", label: "Transport", localeKey: "iconLabels.transport" },
    { value: `${ICON_PREFIX}home`, iconName: "home", color: "#3b82f6", label: "Housing", localeKey: "iconLabels.housing" },
    { value: `${ICON_PREFIX}pill`, iconName: "pill", color: "#ef4444", label: "Health", localeKey: "iconLabels.health" },
    { value: `${ICON_PREFIX}lightning-bolt`, iconName: "lightning-bolt", color: "#eab308", label: "Electricity", localeKey: "iconLabels.electricity" },
    { value: `${ICON_PREFIX}water`, iconName: "water", color: "#0284c7", label: "Water", localeKey: "iconLabels.water" },
    { value: `${ICON_PREFIX}wifi`, iconName: "wifi", color: "#6366f1", label: "Internet", localeKey: "iconLabels.internet" },
    { value: `${ICON_PREFIX}phone`, iconName: "phone", color: "#06b6d4", label: "Phone", localeKey: "iconLabels.phone" },
    { value: `${ICON_PREFIX}movie-open`, iconName: "movie-open", color: "#7c3aed", label: "Entertainment", localeKey: "iconLabels.entertainment" },
    { value: `${ICON_PREFIX}school`, iconName: "school", color: "#2563eb", label: "Education", localeKey: "iconLabels.education" },
    { value: `${ICON_PREFIX}airplane`, iconName: "airplane", color: "#0ea5e9", label: "Travel", localeKey: "iconLabels.travel" },
    { value: `${ICON_PREFIX}dog`, iconName: "dog", color: "#f59e0b", label: "Pets", localeKey: "iconLabels.pets" },
    { value: `${ICON_PREFIX}charity`, iconName: "charity", color: "#ec4899", label: "Charity", localeKey: "iconLabels.charity" },
    { value: `${ICON_PREFIX}credit-card-minus`, iconName: "credit-card-minus", color: "#ef4444", label: "Card payment", localeKey: "iconLabels.cardPayment" }
  ]
};

const LEGACY_EMOJI_TO_ICON = {
  "💵": "cash-multiple",
  "💼": "briefcase",
  "🎁": "gift",
  "🏦": "bank",
  "📈": "trending-up",
  "💳": "credit-card-minus",
  "🐷": "piggy-bank",
  "⚡": "lightning-bolt",
  "💡": "lightning-bolt",
  "💧": "water",
  "📶": "wifi",
  "📱": "phone",
  "🎬": "movie-open",
  "🎓": "school",
  "✈️": "airplane",
  "🐶": "dog",
  "❤️": "charity",
  "🍜": "noodles",
  "🛒": "cart",
  "🚗": "car",
  "🏠": "home",
  "💊": "pill",
  "📁": "folder-outline"
};

const PRESET_BY_VALUE = [...CATEGORY_ICON_PRESETS.income, ...CATEGORY_ICON_PRESETS.expense].reduce((acc, preset) => {
  acc[preset.value] = preset;
  return acc;
}, {});

export function getCategoryIconPresets(type) {
  return CATEGORY_ICON_PRESETS[type] || CATEGORY_ICON_PRESETS.expense;
}

export function getFirstCategoryIcon(type) {
  const presets = getCategoryIconPresets(type);
  return presets[0]?.value || "";
}

export function getIconLabel(iconValue) {
  const normalized = String(iconValue || "").trim();
  if (normalized && PRESET_BY_VALUE[normalized]?.label) {
    return PRESET_BY_VALUE[normalized].label;
  }
  return null;
}

export function getIconLocaleKey(iconValue) {
  const normalized = String(iconValue || "").trim();
  if (normalized && PRESET_BY_VALUE[normalized]?.localeKey) {
    return PRESET_BY_VALUE[normalized].localeKey;
  }
  return null;
}

export function getIconColor(iconValue) {
  const normalized = String(iconValue || "").trim();
  return PRESET_BY_VALUE[normalized]?.color || "#344054";
}

function resolveIconName(iconValue) {
  const normalized = String(iconValue || "").trim();

  if (normalized.startsWith(ICON_PREFIX)) {
    const directName = normalized.slice(ICON_PREFIX.length);
    return directName || null;
  }

  if (LEGACY_EMOJI_TO_ICON[normalized]) {
    return LEGACY_EMOJI_TO_ICON[normalized];
  }

  return null;
}

function resolveIconColor(iconValue, defaultColor) {
  const normalized = String(iconValue || "").trim();
  return PRESET_BY_VALUE[normalized]?.color || defaultColor;
}

export function CategoryVectorIcon({
  iconValue,
  size = 20,
  color = "#344054",
  style
}) {
  const iconName = resolveIconName(iconValue);
  if (!iconName) return null;

  const iconColor = resolveIconColor(iconValue, color);

  return (
    <MaterialCommunityIcons
      name={iconName}
      size={size}
      color={iconColor}
      style={style}
    />
  );
}
