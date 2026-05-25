import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../constants/colors";

export default function ModelSelectorPill({
  label,
  value,
  options = [],
  onSelect,
  title = "MODEL CHAT",
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option) => {
    if (option.disabled) return;
    setIsOpen(false);
    onSelect?.(option.value);
  };

  return (
    <View style={styles.wrapper}>

      <Pressable style={styles.modelPill} onPress={() => setIsOpen((current) => !current)}>
        <View style={styles.modelIconCircle}>
          <Text style={styles.modelIcon}>🤖</Text>
        </View>
        <Text style={styles.modelLabel} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>

      {isOpen && (
        <View style={styles.dropdown}>
          <Text style={styles.dropdownTitle}>{title}</Text>
          {options.map((option) => {
            const selected = option.value === value;

            return (
              <Pressable
                key={option.value}
                style={[
                  styles.optionRow,
                  selected && styles.optionRowSelected,
                  option.disabled && styles.optionRowDisabled,
                ]}
                onPress={() => handleSelect(option)}
              >
                <View style={styles.checkSlot}>
                  {selected && (
                    <View style={styles.checkCircle}>
                      <Text style={styles.checkText}>✓</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.optionIcon}>{option.icon}</Text>

                <View style={styles.optionCopy}>
                  <View style={styles.optionTitleRow}>
                    <Text
                      style={[styles.optionLabel, option.disabled && styles.optionLabelDisabled]}
                      numberOfLines={1}
                    >
                      {option.label}
                    </Text>
                    {option.badge ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{option.badge}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text
                    style={[
                      styles.optionDescription,
                      option.disabled && styles.optionLabelDisabled,
                    ]}
                    numberOfLines={1}
                  >
                    {option.description}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "center",
    marginTop: 14,
    minWidth: 238,
    position: "relative",
    zIndex: 20,
    elevation: 20,
  },
  modelPill: {
    alignSelf: "center",
    height: 40,
    minWidth: 214,
    maxWidth: 260,
    paddingLeft: 16,
    paddingRight: 14,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(250, 241, 255, 0.94)",
    borderWidth: 1,
    borderColor: COLORS.CHAT_BORDER,
    shadowColor: COLORS.CHAT_PURPLE,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  modelIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(139, 61, 255, 0.14)",
  },
  modelIcon: {
    fontSize: 12,
    color: COLORS.CHAT_PURPLE,
  },
  modelLabel: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.CHAT_PURPLE,
  },

  dropdown: {
    position: "absolute",
    top: 48,
    left: -10,
    right: -10,
    paddingTop: 16,
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.CHAT_BORDER,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    shadowColor: COLORS.CHAT_PURPLE,
    shadowOpacity: 0.16,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  dropdownTitle: {
    marginBottom: 8,
    color: COLORS.CHAT_PURPLE,
    fontSize: 10,
    fontWeight: "800",
  },
  optionRow: {
    minHeight: 48,
    borderRadius: 10,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionRowSelected: {
    backgroundColor: "rgba(139, 61, 255, 0.07)",
  },
  optionRowDisabled: {
    opacity: 0.48,
  },
  checkSlot: {
    width: 18,
    alignItems: "center",
  },
  checkCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.CHAT_PURPLE,
  },
  checkText: {
    color: COLORS.WHITE,
    fontSize: 10,
    fontWeight: "900",
  },
  optionIcon: {
    width: 18,
    color: COLORS.GOLD,
    fontSize: 15,
    textAlign: "center",
  },
  optionCopy: {
    flex: 1,
    minWidth: 0,
  },
  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  optionLabel: {
    flexShrink: 1,
    color: COLORS.CHAT_PURPLE,
    fontSize: 12,
    fontWeight: "800",
  },
  optionLabelDisabled: {
    color: COLORS.CHAT_MUTED,
  },
  optionDescription: {
    marginTop: 2,
    color: COLORS.CHAT_MUTED,
    fontSize: 10,
    fontWeight: "600",
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: COLORS.CHAT_PURPLE_SOFT,
  },
  badgeText: {
    color: COLORS.CHAT_PURPLE,
    fontSize: 8,
    fontWeight: "900",
  },
});
