import React from "react";
import { Text } from "react-native";

const ICON_PREFIX = "mdi:";

export const DEFAULT_CATEGORY_ICON = `${ICON_PREFIX}folder-outline`;

export const CATEGORY_ICON_PRESETS = {
  income: [
    { value: `${ICON_PREFIX}cash-multiple`, iconName: "cash-multiple", color: "#16a34a", label: "Tien mat" },
    { value: `${ICON_PREFIX}briefcase`, iconName: "briefcase", color: "#2563eb", label: "Cong viec" },
    { value: `${ICON_PREFIX}gift`, iconName: "gift", color: "#db2777", label: "Qua tang" },
    { value: `${ICON_PREFIX}bank`, iconName: "bank", color: "#0f766e", label: "Ngan hang" },
    { value: `${ICON_PREFIX}trending-up`, iconName: "trending-up", color: "#7c3aed", label: "Tang truong" },
    { value: `${ICON_PREFIX}wallet-plus`, iconName: "wallet-plus", color: "#15803d", label: "Vi tien" },
    { value: `${ICON_PREFIX}account-cash`, iconName: "account-cash", color: "#0284c7", label: "Thu tu ca nhan" },
    { value: `${ICON_PREFIX}cash-refund`, iconName: "cash-refund", color: "#0ea5e9", label: "Hoan tien" },
    { value: `${ICON_PREFIX}piggy-bank`, iconName: "piggy-bank", color: "#ca8a04", label: "Tiet kiem" },
    { value: `${ICON_PREFIX}hand-coin`, iconName: "hand-coin", color: "#8b5cf6", label: "Lai suat" },
    { value: `${ICON_PREFIX}chart-line`, iconName: "chart-line", color: "#4338ca", label: "Dau tu" },
    { value: `${ICON_PREFIX}cash-check`, iconName: "cash-check", color: "#16a34a", label: "Thu no" }
  ],
  expense: [
    { value: `${ICON_PREFIX}noodles`, iconName: "noodles", color: "#d97706", label: "An uong" },
    { value: `${ICON_PREFIX}cart`, iconName: "cart", color: "#0ea5e9", label: "Mua sam" },
    { value: `${ICON_PREFIX}car`, iconName: "car", color: "#475467", label: "Di chuyen" },
    { value: `${ICON_PREFIX}home`, iconName: "home", color: "#3b82f6", label: "Nha o" },
    { value: `${ICON_PREFIX}pill`, iconName: "pill", color: "#ef4444", label: "Suc khoe" },
    { value: `${ICON_PREFIX}lightning-bolt`, iconName: "lightning-bolt", color: "#eab308", label: "Tien dien" },
    { value: `${ICON_PREFIX}water`, iconName: "water", color: "#0284c7", label: "Tien nuoc" },
    { value: `${ICON_PREFIX}wifi`, iconName: "wifi", color: "#6366f1", label: "Internet" },
    { value: `${ICON_PREFIX}phone`, iconName: "phone", color: "#06b6d4", label: "Dien thoai" },
    { value: `${ICON_PREFIX}movie-open`, iconName: "movie-open", color: "#7c3aed", label: "Giai tri" },
    { value: `${ICON_PREFIX}school`, iconName: "school", color: "#2563eb", label: "Hoc tap" },
    { value: `${ICON_PREFIX}airplane`, iconName: "airplane", color: "#0ea5e9", label: "Du lich" },
    { value: `${ICON_PREFIX}dog`, iconName: "dog", color: "#f59e0b", label: "Thu cung" },
    { value: `${ICON_PREFIX}charity`, iconName: "charity", color: "#ec4899", label: "Tu thien" },
    { value: `${ICON_PREFIX}credit-card-minus`, iconName: "credit-card-minus", color: "#ef4444", label: "Tra no the" }
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

const ICON_TO_EMOJI = {
  "cash-multiple": "💵",
  briefcase: "💼",
  gift: "🎁",
  bank: "🏦",
  "trending-up": "📈",
  "wallet-plus": "👛",
  "account-cash": "🧾",
  "cash-refund": "💸",
  "piggy-bank": "🐷",
  "hand-coin": "🫴",
  "chart-line": "📊",
  "cash-check": "✅",
  noodles: "🍜",
  cart: "🛒",
  car: "🚗",
  home: "🏠",
  pill: "💊",
  "lightning-bolt": "⚡",
  water: "💧",
  wifi: "📶",
  phone: "📱",
  "movie-open": "🎬",
  school: "🎓",
  airplane: "✈️",
  dog: "🐶",
  charity: "❤️",
  "credit-card-minus": "💳",
  "folder-outline": "📁"
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
  return presets[0]?.value || DEFAULT_CATEGORY_ICON;
}

export function getIconLabel(iconValue) {
  const normalized = String(iconValue || "").trim();
  if (PRESET_BY_VALUE[normalized]?.label) {
    return PRESET_BY_VALUE[normalized].label;
  }
  return "Chon icon";
}

function resolveIconName(iconValue) {
  const normalized = String(iconValue || "").trim();

  if (normalized.startsWith(ICON_PREFIX)) {
    const directName = normalized.slice(ICON_PREFIX.length);
    return directName || "folder-outline";
  }

  if (LEGACY_EMOJI_TO_ICON[normalized]) {
    return LEGACY_EMOJI_TO_ICON[normalized];
  }

  return "folder-outline";
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
  const iconColor = resolveIconColor(iconValue, color);
  const emoji = ICON_TO_EMOJI[iconName] || "📁";

  return <Text style={[{ fontSize: size, color: iconColor }, style]}>{emoji}</Text>;
}
