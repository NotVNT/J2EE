import React, { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { COLORS, useAppColors } from "../../constants/colors";
import { formatCurrencyInput, formatMoney, parseCurrencyInput } from "../../utils/format";

const COMMON_EMOJIS = ["🍚", "☕", "⛽", "🛒", "🧋", "🍜", "🍔", "🥤", "🏥", "📱", "👗", "🎮", "🎬", "📚", "🏋️", "🚕", "✈️", "🎁", "💊", "🧴"];

export function JarPickerModal({ template, jars, onConfirm, onClose, styles }) {
  const colors = useAppColors();
  const [selectedJarId, setSelectedJarId] = useState(template.jarId ?? (jars[0]?.id ?? ""));
  const [showPicker, setShowPicker] = useState(false);

  const selectedJar = jars.find((j) => j.id === Number(selectedJarId)) || jars[0];

  return (
    <Modal visible animationType="fade" transparent>
      <View style={[styles.modalOverlay, { backgroundColor: colors.OVERLAY }]}>
        <View style={[styles.jarPickerContent, { backgroundColor: colors.CARD }]}>
          <Text style={[styles.jarPickerTitle, { color: colors.TEXT }]}>Trừ tiền từ hũ nào?</Text>
          <Text style={[styles.jarPickerDesc, { color: colors.TEXT_SECONDARY }]}>
            Ghi nhận khoản: {template.emoji} {template.name} — {formatMoney(template.amount)}
          </Text>

          <Text style={[styles.modalLabel, { color: colors.TEXT_SECONDARY }]}>Chọn hũ chi tiêu</Text>
          <Pressable style={[styles.jarSelectCard, { backgroundColor: colors.BG, borderColor: colors.CARD_BORDER }]} onPress={() => setShowPicker(!showPicker)}>
            <View style={styles.jarSelectRow}>
              <View style={[styles.jarSelectIconBox, { backgroundColor: (selectedJar?.color || colors.PRIMARY) + "18" }]}>
                <Text style={styles.jarSelectIcon}>{selectedJar?.icon || "🏺"}</Text>
              </View>
              <Text style={[styles.jarSelectName, { color: colors.TEXT }]}>{selectedJar?.name || "Chọn hũ..."}</Text>
              <Text style={[styles.jarSelectArrow, { color: colors.TEXT_MUTED }]}>▼</Text>
            </View>
          </Pressable>

          {showPicker && (
            <View style={[styles.jarOptionsList, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}>
              <ScrollView nestedScrollEnabled style={{ maxHeight: 150 }}>
                {jars.map((jar) => (
                  <Pressable
                    key={jar.id}
                    style={[styles.jarOptionItem, { borderBottomColor: colors.BG }]}
                    onPress={() => {
                      setSelectedJarId(jar.id);
                      setShowPicker(false);
                    }}
                  >
                    <Text style={styles.jarOptionIcon}>{jar.icon || "🏺"}</Text>
                    <Text style={[styles.jarOptionName, { color: colors.TEXT }]}>{jar.name}</Text>
                    <Text style={[styles.jarOptionBalance, { color: colors.TEXT_MUTED }]}>({formatMoney(jar.currentBalance)})</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.modalBtnRow}>
            <Pressable style={[styles.cancelBtn, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]} onPress={onClose}>
              <Text style={[styles.cancelBtnText, { color: colors.TEXT_SECONDARY }]}>Hủy</Text>
            </Pressable>
            <Pressable style={[styles.confirmBtn, { backgroundColor: colors.PRIMARY }]} onPress={() => onConfirm(selectedJarId)}>
              <Text style={[styles.confirmBtnText, { color: colors.WHITE }]}>Xác nhận</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function TemplateFormModal({ template, categories, jars, onSave, onClose, styles }) {
  const colors = useAppColors();
  const isNew = !template?.id;
  const [emoji, setEmoji] = useState(template?.emoji || "🍚");
  const [name, setName] = useState(template?.name || "");
  const [amount, setAmount] = useState(template?.amount ? formatCurrencyInput(String(template.amount)) : "");
  const [categoryId, setCategoryId] = useState(template?.categoryId || (categories[0]?.id ?? ""));
  const [jarId, setJarId] = useState(template?.jarId ?? "");

  const [showEmojiGrid, setShowEmojiGrid] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showJarPicker, setShowJarPicker] = useState(false);

  const selectedCategory = categories.find((category) => category.id === Number(categoryId)) || categories[0];
  const selectedJar = jars.find((jar) => jar.id === Number(jarId));

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên mẫu.");
      return;
    }

    const parsedAmount = parseCurrencyInput(amount);
    if (parsedAmount <= 0) {
      Alert.alert("Số tiền không hợp lệ", "Vui lòng nhập số tiền lớn hơn 0.");
      return;
    }

    onSave({
      ...template,
      emoji,
      name: name.trim(),
      amount: parsedAmount,
      categoryId: categoryId ? Number(categoryId) : null,
      jarId: jarId ? Number(jarId) : null,
    });
  };

  return (
    <Modal visible animationType="slide" transparent>
      <View style={[styles.modalOverlay, { backgroundColor: colors.OVERLAY }]}>
        <View style={[styles.formContent, { backgroundColor: colors.CARD }]}>
          <Text style={[styles.formTitle, { color: colors.TEXT }]}>{isNew ? "Thêm mẫu chi tiêu nhanh" : "Chỉnh sửa mẫu chi tiêu"}</Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            <Text style={[styles.modalLabel, { color: colors.TEXT_SECONDARY }]}>Biểu tượng & Tên mẫu</Text>
            <View style={styles.emojiNameRow}>
              <Pressable style={[styles.emojiBubbleBtn, { backgroundColor: colors.BG, borderColor: colors.CARD_BORDER }]} onPress={() => setShowEmojiGrid(!showEmojiGrid)}>
                <Text style={styles.emojiBubbleText}>{emoji}</Text>
                <Text style={[styles.emojiBubbleArrow, { color: colors.TEXT_MUTED }]}>▾</Text>
              </Pressable>
              <TextInput
                style={[styles.nameInput, { backgroundColor: colors.BG, borderColor: colors.CARD_BORDER, color: colors.TEXT }]}
                value={name}
                onChangeText={setName}
                placeholder="VD: Cơm trưa, Siêu thị"
                placeholderTextColor={colors.TEXT_MUTED}
              />
            </View>

            {showEmojiGrid && (
              <View style={[styles.emojiPresetsCard, { backgroundColor: colors.BG, borderColor: colors.CARD_BORDER }]}>
                <View style={styles.emojiPresetsGrid}>
                  {COMMON_EMOJIS.map((item) => (
                    <Pressable
                      key={item}
                      style={[styles.emojiPresetCell, { backgroundColor: colors.CARD }]}
                      onPress={() => {
                        setEmoji(item);
                        setShowEmojiGrid(false);
                      }}
                    >
                      <Text style={styles.emojiPresetText}>{item}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <Text style={[styles.modalLabel, { color: colors.TEXT_SECONDARY }]}>Số tiền mặc định (VND)</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.BG, borderColor: colors.CARD_BORDER, color: colors.TEXT }]}
              value={amount}
              onChangeText={(val) => setAmount(formatCurrencyInput(val))}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.TEXT_MUTED}
            />

            {categories.length > 0 && (
              <>
                <Text style={[styles.modalLabel, { color: colors.TEXT_SECONDARY }]}>Danh mục liên kết (Tùy chọn)</Text>
                <Pressable style={[styles.selectCard, { backgroundColor: colors.BG, borderColor: colors.CARD_BORDER }]} onPress={() => setShowCategoryPicker(!showCategoryPicker)}>
                  <View style={styles.selectRow}>
                    <Text style={[styles.selectValue, { color: colors.TEXT }]}>{selectedCategory?.name || "Chọn danh mục..."}</Text>
                    <Text style={[styles.selectArrow, { color: colors.TEXT_MUTED }]}>▾</Text>
                  </View>
                </Pressable>

                {showCategoryPicker && (
                  <View style={[styles.dropdownCard, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}>
                    <ScrollView nestedScrollEnabled style={{ maxHeight: 150 }}>
                      {categories.map((category) => (
                        <Pressable
                          key={category.id}
                          style={[styles.dropdownItem, { borderBottomColor: colors.BG }]}
                          onPress={() => {
                            setCategoryId(category.id);
                            setShowCategoryPicker(false);
                          }}
                        >
                          <Text style={[styles.dropdownItemText, { color: colors.TEXT }]}>{category.name}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </>
            )}

            {jars.length > 0 && (
              <>
                <Text style={[styles.modalLabel, { color: colors.TEXT_SECONDARY }]}>Hũ mặc định liên kết (Tùy chọn)</Text>
                <Pressable style={[styles.selectCard, { backgroundColor: colors.BG, borderColor: colors.CARD_BORDER }]} onPress={() => setShowJarPicker(!showJarPicker)}>
                  <View style={styles.selectRow}>
                    <Text style={[styles.selectValue, { color: colors.TEXT }]}>{selectedJar ? `🏦 ${selectedJar.name}` : "Không liên kết hũ"}</Text>
                    <Text style={[styles.selectArrow, { color: colors.TEXT_MUTED }]}>▾</Text>
                  </View>
                </Pressable>

                {showJarPicker && (
                  <View style={[styles.dropdownCard, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}>
                    <ScrollView nestedScrollEnabled style={{ maxHeight: 150 }}>
                      <Pressable
                        style={[styles.dropdownItem, { borderBottomColor: colors.BG }]}
                        onPress={() => {
                          setJarId("");
                          setShowJarPicker(false);
                        }}
                      >
                        <Text style={[styles.dropdownItemText, { color: colors.PRIMARY }]}>Không liên kết hũ</Text>
                      </Pressable>
                      {jars.map((jar) => (
                        <Pressable
                          key={jar.id}
                          style={[styles.dropdownItem, { borderBottomColor: colors.BG }]}
                          onPress={() => {
                            setJarId(jar.id);
                            setShowJarPicker(false);
                          }}
                        >
                          <Text style={[styles.dropdownItemText, { color: colors.TEXT }]}>🏦 {jar.name}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          <View style={styles.modalBtnRow}>
            <Pressable style={[styles.cancelBtn, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]} onPress={onClose}>
              <Text style={[styles.cancelBtnText, { color: colors.TEXT_SECONDARY }]}>Hủy</Text>
            </Pressable>
            <Pressable style={[styles.confirmBtn, { backgroundColor: colors.PRIMARY }]} onPress={handleSubmit}>
              <Text style={[styles.confirmBtnText, { color: colors.WHITE }]}>Lưu mẫu</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
