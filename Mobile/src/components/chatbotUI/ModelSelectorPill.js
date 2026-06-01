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
    position: "relative",
    zIndex: 200,
    elevation: 200
  },
  modelPill: {
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER,
    backgroundColor: COLORS.CARD,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 4,
    paddingRight: 14,
    shadowColor: COLORS.PRIMARY,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  modelIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.ROSE_MIST,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8
  },
  modelIcon: {
    fontSize: 13
  },
  modelLabel: {
    fontSize: 13,
    fontWeight: "750",
    color: COLORS.TEXT_SECONDARY
  },
  dropdown: {
    position: "absolute",
    top: 44,
    right: 0,
    width: 250,
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER,
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10
  },
  dropdownTitle: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.PRIMARY, // active pink
    letterSpacing: 1.2,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    textTransform: "uppercase"
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: "transparent"
  },
  optionRowSelected: {
    backgroundColor: "rgba(232, 89, 126, 0.06)",
    borderColor: "rgba(232, 89, 126, 0.2)"
  },
  optionRowDisabled: {
    opacity: 0.4
  },
  checkSlot: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6
  },
  checkCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.PRIMARY,
    alignItems: "center",
    justifyContent: "center"
  },
  checkText: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.WHITE
  },
  optionIcon: {
    fontSize: 16,
    marginRight: 8
  },
  optionCopy: {
    flex: 1
  },
  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.TEXT
  },
  optionLabelDisabled: {
    color: COLORS.TEXT_MUTED
  },
  badge: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  badgeText: {
    fontSize: 8,
    fontWeight: "800",
    color: COLORS.WHITE
  },
  optionDescription: {
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2
  }
});
