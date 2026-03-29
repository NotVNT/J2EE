import React, { useState } from "react";
import { Alert, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { todayIso } from "./format";

const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function pad2(num) {
  return String(num).padStart(2, "0");
}

function parseDate(value) {
  if (!value || !ISO_PATTERN.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatDateToIso(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return todayIso();
  }

  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function normalizeIsoDate(value, fallback = todayIso()) {
  const parsed = parseDate(value);
  return parsed ? formatDateToIso(parsed) : fallback;
}

export function isIsoDate(value) {
  return Boolean(parseDate(value));
}

export function PickDateField({
  label,
  value,
  onChange,
  placeholder = "YYYY-MM-DD",
  minimumDate,
  maximumDate
}) {
  const [visible, setVisible] = useState(false);
  const [draftDate, setDraftDate] = useState(parseDate(value) || new Date());

  const minDateObj = minimumDate ? parseDate(minimumDate) : undefined;
  const maxDateObj = maximumDate ? parseDate(maximumDate) : undefined;

  const displayValue = value || placeholder;

  const openPicker = () => {
    setDraftDate(parseDate(value) || new Date());
    setVisible(true);
  };

  const confirmDate = (selected) => {
    if (!selected) {
      setVisible(false);
      return;
    }

    const normalized = formatDateToIso(selected);
    const parsed = parseDate(normalized);

    if (minDateObj && parsed && parsed < minDateObj) {
      Alert.alert("Ngày không hợp lệ", `Ngày cần lớn hơn hoặc bằng ${minimumDate}.`);
      return;
    }

    if (maxDateObj && parsed && parsed > maxDateObj) {
      Alert.alert("Ngày không hợp lệ", `Ngày cần nhỏ hơn hoặc bằng ${maximumDate}.`);
      return;
    }

    onChange?.(normalized);
    setVisible(false);
  };

  const onNativeChange = (_event, selectedDate) => {
    if (Platform.OS === "android") {
      confirmDate(selectedDate);
      return;
    }

    if (selectedDate) {
      setDraftDate(selectedDate);
    }
  };

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Pressable style={styles.field} onPress={openPicker}>
        <Text style={[styles.fieldText, !value && styles.placeholder]}>{displayValue}</Text>
        <Text style={styles.pickIcon}>📅</Text>
      </Pressable>

      {visible && Platform.OS === "android" ? (
        <DateTimePicker
          value={draftDate}
          mode="date"
          display="calendar"
          minimumDate={minDateObj}
          maximumDate={maxDateObj}
          onChange={onNativeChange}
        />
      ) : null}

      {visible && Platform.OS !== "android" ? (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
          <View style={styles.overlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{label || "Chọn ngày"}</Text>

              <DateTimePicker
                value={draftDate}
                mode="date"
                display="spinner"
                minimumDate={minDateObj}
                maximumDate={maxDateObj}
                onChange={onNativeChange}
                style={styles.iosPicker}
              />

              <View style={styles.actionRow}>
                <Pressable style={styles.cancelButton} onPress={() => setVisible(false)}>
                  <Text style={styles.cancelText}>Hủy</Text>
                </Pressable>
                <Pressable style={styles.confirmButton} onPress={() => confirmDate(draftDate)}>
                  <Text style={styles.confirmText}>Xác nhận</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10
  },
  label: {
    color: "#344054",
    marginBottom: 6,
    fontWeight: "700"
  },
  field: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d0d5dd",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  fieldText: {
    color: "#101828"
  },
  placeholder: {
    color: "#98a2b3"
  },
  pickIcon: {
    fontSize: 16
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    justifyContent: "center",
    padding: 16
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14
  },
  modalTitle: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 10
  },
  iosPicker: {
    marginBottom: 8
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginRight: 10
  },
  cancelText: {
    color: "#334155",
    fontWeight: "700"
  },
  confirmButton: {
    backgroundColor: "#0f766e",
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14
  },
  confirmText: {
    color: "#ffffff",
    fontWeight: "800"
  }
});
