import React, { useEffect, useState } from "react";
import { Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import apiClient from "../../services/apiClient";
import { API_ENDPOINTS } from "../../constants/api";
import { useAppColors } from "../../constants/colors";
import { formatCurrencyInput, getApiErrorMessage, parseCurrencyInput } from "../../utils/format";
import { formatJarMoney } from "../../utils/jar";
import { getSafeAreaBottom, getSafeAreaTop } from "../../utils/safeArea";
import AppIcon from "../ui/AppIcon";
import { scale } from "../../utils/layoutScale";

export default function JarTransferView() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const colors = useAppColors();

  const [jars, setJars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [fromJar, setFromJar] = useState(null);
  const [toJar, setToJar] = useState(null);
  const [amount, setAmount] = useState("");

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  useEffect(() => {
    fetchJars();
  }, []);

  const fetchJars = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(API_ENDPOINTS.GET_JARS);
      const data = Array.isArray(res.data) ? res.data : [];
      setJars(data);
      
      // Auto select first and second jar if available
      if (data.length >= 2) {
        setFromJar(data[0]);
        setToJar(data[1]);
      } else if (data.length === 1) {
        setFromJar(data[0]);
      }
    } catch (err) {
      console.error("Lỗi tải hũ để chuyển khoản:", err);
      Alert.alert("Lỗi", getApiErrorMessage(err, "Không thể tải danh sách hũ chi tiêu."));
    } finally {
      setLoading(false);
    }
  };

  const onTransfer = async () => {
    if (!fromJar) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn hũ nguồn.");
      return;
    }
    if (!toJar) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn hũ đích.");
      return;
    }
    if (fromJar.id === toJar.id) {
      Alert.alert("Lỗi chọn hũ", "Hũ nguồn và hũ đích không được trùng nhau.");
      return;
    }

    const numericAmount = parseCurrencyInput(amount);
    if (!amount.trim() || numericAmount <= 0) {
      Alert.alert("Số tiền không hợp lệ", "Vui lòng nhập số tiền chuyển > 0.");
      return;
    }

    if (numericAmount > (fromJar.currentBalance || 0)) {
      Alert.alert(
        "Số dư không đủ",
        `Số dư của hũ "${fromJar.name}" hiện tại là ${formatJarMoney(fromJar.currentBalance)}, không đủ để chuyển ${formatJarMoney(numericAmount)}.`
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fromJarId: fromJar.id,
        toJarId: toJar.id,
        amount: numericAmount,
      };

      await apiClient.post(API_ENDPOINTS.TRANSFER_JAR, payload);
      Alert.alert("Thành công", `Đã chuyển khoản thành công ${formatJarMoney(numericAmount)} từ hũ "${fromJar.name}" sang hũ "${toJar.name}".`);
      navigation.goBack();
    } catch (err) {
      console.error("Lỗi chuyển tiền hũ:", err);
      Alert.alert("Thất bại", getApiErrorMessage(err, "Không thể thực hiện giao dịch chuyển tiền."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectFrom = (item) => {
    setFromJar(item);
    setShowFromPicker(false);
    if (toJar && toJar.id === item.id) {
      // Clear or switch destination if it matches the source
      const other = jars.find(j => j.id !== item.id);
      setToJar(other || null);
    }
  };

  const handleSelectTo = (item) => {
    setToJar(item);
    setShowToPicker(false);
    if (fromJar && fromJar.id === item.id) {
      // Clear or switch source if it matches the destination
      const other = jars.find(j => j.id !== item.id);
      setFromJar(other || null);
    }
  };

  const renderJarSelectItem = ({ item, onSelect }) => (
    <Pressable style={[styles.pickerItem, { borderBottomColor: colors.CARD_BORDER }]} onPress={() => onSelect(item)}>
      <View style={[styles.itemIconBox, { backgroundColor: (item.color || colors.PRIMARY) + "18" }]}>
        <Text style={styles.itemIcon}>{item.icon || "🏺"}</Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.TEXT }]}>{item.name}</Text>
        <Text style={[styles.itemBalance, { color: colors.TEXT_SECONDARY }]}>Số dư: {formatJarMoney(item.currentBalance)}</Text>
      </View>
      <View style={[styles.colorIndicator, { backgroundColor: item.color || colors.PRIMARY }]} />
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.BG, paddingTop: getSafeAreaTop(insets) }]}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: getSafeAreaBottom(insets) + scale(100) }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.descText, { color: colors.TEXT_SECONDARY }]}>
          Chuyển số dư linh hoạt giữa các hũ chi tiêu để cân đối hạn mức và nguồn vốn chi tiêu của bạn.
        </Text>

        {/* Source Jar Selector */}
        <Text style={[styles.label, { color: colors.TEXT }]}>Từ hũ (Nguồn chuyển)</Text>
        <Pressable style={[styles.selectorCard, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]} onPress={() => setShowFromPicker(true)}>
          {fromJar ? (
            <View style={styles.selectedRow}>
              <View style={[styles.iconContainer, { backgroundColor: (fromJar.color || colors.PRIMARY) + "18" }]}>
                <Text style={styles.iconText}>{fromJar.icon || "🏺"}</Text>
              </View>
              <View style={styles.selectedInfo}>
                <Text style={[styles.selectedName, { color: colors.TEXT }]}>{fromJar.name}</Text>
                <Text style={[styles.selectedBalance, { color: colors.TEXT_SECONDARY }]}>Số dư khả dụng: {formatJarMoney(fromJar.currentBalance)}</Text>
              </View>
              <AppIcon name="chevron-down" size={16} color={colors.TEXT_MUTED} />
            </View>
          ) : (
            <Text style={[styles.placeholderText, { color: colors.TEXT_MUTED }]}>Chọn hũ nguồn...</Text>
          )}
        </Pressable>

        {/* Transfer Icon indicator */}
        <View style={styles.arrowWrapper}>
          <View style={[styles.arrowLine, { backgroundColor: colors.CARD_BORDER }]} />
          <View style={[styles.arrowCircle, { backgroundColor: colors.ROSE_MIST || "rgba(239,94,131,0.1)", borderColor: colors.CARD_BORDER }]}>
            <AppIcon name="swap-vertical" size={16} color={colors.PRIMARY} />
          </View>
          <View style={[styles.arrowLine, { backgroundColor: colors.CARD_BORDER }]} />
        </View>

        {/* Destination Jar Selector */}
        <Text style={[styles.label, { color: colors.TEXT }]}>Đến hũ (Nhận chuyển)</Text>
        <Pressable style={[styles.selectorCard, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]} onPress={() => setShowToPicker(true)}>
          {toJar ? (
            <View style={styles.selectedRow}>
              <View style={[styles.iconContainer, { backgroundColor: (toJar.color || colors.PRIMARY) + "18" }]}>
                <Text style={styles.iconText}>{toJar.icon || "🏺"}</Text>
              </View>
              <View style={styles.selectedInfo}>
                <Text style={[styles.selectedName, { color: colors.TEXT }]}>{toJar.name}</Text>
                <Text style={[styles.selectedBalance, { color: colors.TEXT_SECONDARY }]}>Số dư khả dụng: {formatJarMoney(toJar.currentBalance)}</Text>
              </View>
              <AppIcon name="chevron-down" size={16} color={colors.TEXT_MUTED} />
            </View>
          ) : (
            <Text style={[styles.placeholderText, { color: colors.TEXT_MUTED }]}>Chọn hũ nhận...</Text>
          )}
        </Pressable>

        {/* Amount Input */}
        <Text style={[styles.label, { color: colors.TEXT, marginTop: 24 }]}>Số tiền chuyển (VND)</Text>
        <TextInput
          style={[styles.amountInput, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER, color: colors.PRIMARY }]}
          value={amount}
          onChangeText={(val) => setAmount(formatCurrencyInput(val))}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={colors.TEXT_MUTED}
        />

        <Pressable
          style={[styles.transferButton, { backgroundColor: colors.PRIMARY, shadowColor: colors.PRIMARY }, (submitting || loading) && styles.disabledButton]}
          onPress={onTransfer}
          disabled={submitting || loading}
        >
          <Text style={styles.transferButtonText}>
            {submitting ? "Đang xử lý..." : "Xác nhận chuyển tiền"}
          </Text>
        </Pressable>
      </ScrollView>

      {/* From Jar Picker Modal */}
      <Modal visible={showFromPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.CARD }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.CARD_BORDER }]}>
              <Text style={[styles.modalTitle, { color: colors.TEXT }]}>Chọn hũ nguồn</Text>
              <Pressable onPress={() => setShowFromPicker(false)}>
                <Text style={[styles.closeBtn, { color: colors.PRIMARY }]}>Đóng</Text>
              </Pressable>
            </View>
            <FlatList
              data={jars}
              keyExtractor={(item) => String(item.id)}
              renderItem={(props) => renderJarSelectItem({ ...props, onSelect: handleSelectFrom })}
              contentContainerStyle={styles.modalList}
              ListEmptyComponent={<Text style={[styles.emptyPickerText, { color: colors.TEXT_MUTED }]}>Không có hũ nào khả dụng</Text>}
            />
          </View>
        </View>
      </Modal>

      {/* To Jar Picker Modal */}
      <Modal visible={showToPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.CARD }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.CARD_BORDER }]}>
              <Text style={[styles.modalTitle, { color: colors.TEXT }]}>Chọn hũ nhận</Text>
              <Pressable onPress={() => setShowToPicker(false)}>
                <Text style={[styles.closeBtn, { color: colors.PRIMARY }]}>Đóng</Text>
              </Pressable>
            </View>
            <FlatList
              data={jars}
              keyExtractor={(item) => String(item.id)}
              renderItem={(props) => renderJarSelectItem({ ...props, onSelect: handleSelectTo })}
              contentContainerStyle={styles.modalList}
              ListEmptyComponent={<Text style={[styles.emptyPickerText, { color: colors.TEXT_MUTED }]}>Không có hũ nào khả dụng</Text>}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: scale(16),
  },
  descText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  selectorCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedName: {
    fontSize: 15,
    fontWeight: "800",
  },
  selectedBalance: {
    fontSize: 12,
    marginTop: 2,
  },
  placeholderText: {
    fontSize: 14,
  },
  arrowWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  arrowLine: {
    flex: 1,
    height: 1,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 12,
    borderWidth: 1,
  },
  amountInput: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 22,
    fontWeight: "800",
  },
  transferButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 32,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.6,
  },
  transferButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  closeBtn: {
    fontSize: 14,
    fontWeight: "700",
  },
  modalList: {
    paddingBottom: 24,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemIcon: {
    fontSize: 18,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
  },
  itemBalance: {
    fontSize: 11,
    marginTop: 2,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 12,
  },
  emptyPickerText: {
    fontSize: 14,
    textAlign: "center",
    marginVertical: 24,
  },
});
