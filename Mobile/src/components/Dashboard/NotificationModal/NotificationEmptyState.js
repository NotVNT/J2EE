import React from "react";
import { Text, View } from "react-native";
import styles from "./styles";

export default function NotificationEmptyState({ colors, hasNotifications }) {
  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.ROSE_MIST }]}>
        <Text style={styles.emptyIconText}>🔔</Text>
      </View>
      <Text style={[styles.emptyTitle, { color: colors.TEXT }]}>Chưa có thông báo nào</Text>
      <Text style={[styles.emptyMessage, { color: colors.TEXT_SECONDARY }]}>
        {hasNotifications
          ? "Không có thông báo nào khớp với bộ lọc hiện tại."
          : "Khi có cập nhật mới từ hệ thống, thông báo sẽ xuất hiện tại đây."}
      </Text>
    </View>
  );
}
