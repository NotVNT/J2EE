import React from "react";
import { StyleSheet, Text, View, Pressable, FlatList } from "react-native";
import { COLORS } from "../../constants/colors";

const QUICK_ACTIONS = [
  {
    label: "💰 Gợi ý tiết kiệm",
    text: "Gợi ý cách tiết kiệm dựa trên thói quen chi tiêu của tôi",
  },
  {
    label: "🧠 Tâm lý chi tiêu",
    text: "Tại sao tôi hay mua sắm bốc đồng và làm sao để kiểm soát?",
  },
  {
    label: "💬 Đang lo về tiền",
    text: "Tôi đang stress và lo lắng về tài chính, bạn có thể lắng nghe không?",
  },
  {
    label: "🎯 Lên kế hoạch",
    text: "Giúp tôi lên kế hoạch tiết kiệm cho một mục tiêu lớn",
  },
];

export default function QuickPromptChips({ onSelect }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thử gõ nhanh các lệnh sau:</Text>
      <FlatList
        data={QUICK_ACTIONS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.label}
        contentContainerStyle={styles.chipsScroll}
        renderItem={({ item }) => (
          <Pressable style={styles.chip} onPress={() => onSelect(item)}>
            <Text style={styles.chipText}>{item.label}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 12,
  },
  title: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.CHAT_MUTED,
    paddingHorizontal: 24,
    marginBottom: 6,
  },
  chipsScroll: {
    paddingHorizontal: 24,
    gap: 8,
  },
  chip: {
    height: 52,
    paddingHorizontal: 20,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.CHAT_BUBBLE,
    borderWidth: 1,
    borderColor: COLORS.CHAT_BORDER,
    shadowColor: COLORS.CHAT_SHADOW,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  chipText: {
    color: COLORS.CHAT_PURPLE,
    fontSize: 13,
    fontWeight: "600",
  },
});
