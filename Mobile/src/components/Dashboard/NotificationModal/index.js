import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from "react-native";
import { API_ENDPOINTS } from "../../../constants/api";
import { useAppColors } from "../../../constants/colors";
import apiClient from "../../../services/apiClient";
import { scale, useDynamicViewport } from "../../../utils/layoutScale";
import {
  NOTIFICATION_CATEGORY_FILTERS,
  NOTIFICATION_READ_FILTERS,
  filterNotifications,
  getNextSelectionForVisibleNotifications
} from "../../../utils/notificationFilters";
import NotificationEmptyState from "./NotificationEmptyState";
import NotificationItem from "./NotificationItem";
import AppIcon from "../../ui/AppIcon";
import { NotificationFilters, SelectionBar } from "./NotificationControls";
import styles from "./styles";

export default function NotificationModal({ visible, onClose, onUnreadCountChange }) {
  const colors = useAppColors();
  const { insets } = useDynamicViewport();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [readFilter, setReadFilter] = useState(NOTIFICATION_READ_FILTERS.ALL);
  const [categoryFilter, setCategoryFilter] = useState(NOTIFICATION_CATEGORY_FILTERS.ALL);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification?.isRead).length,
    [notifications]
  );
  const filteredNotifications = useMemo(
    () => filterNotifications(notifications, { readFilter, categoryFilter }),
    [categoryFilter, notifications, readFilter]
  );
  const visibleIds = useMemo(
    () => filteredNotifications.map((notification) => notification?.id).filter((id) => id !== null && id !== undefined),
    [filteredNotifications]
  );
  const selectedCount = selectedIds.size;
  const hasVisibleNotifications = filteredNotifications.length > 0;
  const allVisibleSelected = hasVisibleNotifications && visibleIds.every((id) => selectedIds.has(id));

  useEffect(() => {
    const visibleIdSet = new Set(visibleIds);
    setSelectedIds((previous) => {
      const next = new Set([...previous].filter((id) => visibleIdSet.has(id)));
      return next.size === previous.size ? previous : next;
    });
  }, [visibleIds]);

  const updateUnreadCount = useCallback((items) => {
    const count = items.filter((notification) => !notification?.isRead).length;
    onUnreadCountChange?.(count);
  }, [onUnreadCountChange]);

  const fetchNotifications = useCallback(async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setLoading(true);
    setError("");

    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_NOTIFICATIONS);
      const items = Array.isArray(response.data) ? response.data : [];
      setNotifications(items);
      setSelectedIds(new Set());
      updateUnreadCount(items);
    } catch {
      setError("Không thể tải thông báo. Vui lòng thử lại.");
      setNotifications([]);
      setSelectedIds(new Set());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [updateUnreadCount]);

  useEffect(() => {
    if (visible) fetchNotifications();
  }, [fetchNotifications, visible]);

  const markAsRead = useCallback(async (notification) => {
    if (!notification?.id || notification.isRead) return;

    const nextNotifications = notifications.map((item) =>
      item.id === notification.id ? { ...item, isRead: true } : item
    );
    setNotifications(nextNotifications);
    updateUnreadCount(nextNotifications);

    try {
      await apiClient.put(API_ENDPOINTS.MARK_NOTIFICATION_READ(notification.id));
    } catch {
      setNotifications(notifications);
      updateUnreadCount(notifications);
      setError("Không thể cập nhật trạng thái thông báo.");
    }
  }, [notifications, updateUnreadCount]);

  const markAllAsRead = useCallback(async () => {
    if (!unreadCount) return;

    const previousNotifications = notifications;
    const nextNotifications = notifications.map((item) => ({ ...item, isRead: true }));
    setNotifications(nextNotifications);
    updateUnreadCount(nextNotifications);

    try {
      await apiClient.put(API_ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ);
    } catch {
      setNotifications(previousNotifications);
      updateUnreadCount(previousNotifications);
      setError("Không thể đánh dấu tất cả là đã đọc.");
    }
  }, [notifications, unreadCount, updateUnreadCount]);

  const toggleSelectNotification = useCallback((id) => {
    if (id === null || id === undefined) return;

    setSelectedIds((previous) => {
      const next = new Set(previous);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAllVisible = useCallback(() => {
    setSelectedIds((previous) => getNextSelectionForVisibleNotifications(filteredNotifications, previous));
  }, [filteredNotifications]);

  const deleteNotificationsByIds = useCallback(async (ids) => {
    if (!ids.length) return;

    const previousNotifications = notifications;
    const idSet = new Set(ids);
    const nextNotifications = notifications.filter((notification) => !idSet.has(notification?.id));
    setNotifications(nextNotifications);
    setSelectedIds((previous) => new Set([...previous].filter((id) => !idSet.has(id))));
    updateUnreadCount(nextNotifications);

    try {
      if (ids.length === 1) {
        await apiClient.delete(API_ENDPOINTS.DELETE_NOTIFICATION(ids[0]));
      } else {
        await apiClient.post(API_ENDPOINTS.DELETE_NOTIFICATIONS_BULK, ids);
      }
    } catch {
      setNotifications(previousNotifications);
      updateUnreadCount(previousNotifications);
      setError(ids.length === 1 ? "Không thể xóa thông báo." : "Không thể xóa các thông báo đã chọn.");
    }
  }, [notifications, updateUnreadCount]);

  const confirmDeleteNotification = useCallback((notification) => {
    if (!notification?.id) return;

    Alert.alert("Xóa thông báo?", "Thông báo này sẽ được xóa khỏi hộp thư của bạn.", [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: () => deleteNotificationsByIds([notification.id]) }
    ]);
  }, [deleteNotificationsByIds]);

  const confirmDeleteSelected = useCallback(() => {
    if (!selectedCount) return;

    const ids = Array.from(selectedIds);
    Alert.alert(
      "Xóa thông báo đã chọn?",
      `Bạn đang chọn ${selectedCount} thông báo. Hành động này không thể hoàn tác.`,
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", style: "destructive", onPress: () => deleteNotificationsByIds(ids) }
      ]
    );
  }, [deleteNotificationsByIds, selectedCount, selectedIds]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={[styles.overlay, { paddingTop: Math.max(insets.top, scale(20)), paddingBottom: Math.max(insets.bottom, scale(20)) }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Đóng thông báo" />

        <View style={[styles.sheet, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]} pointerEvents="auto">
          <View style={[styles.header, { backgroundColor: colors.INFO_LIGHT }]}>
            <View style={styles.headerTitleBlock}>
              <Text style={[styles.title, { color: colors.TEXT }]}>Thông báo</Text>
              <View style={styles.headerMetaRow}>
                <Text style={[styles.headerMetaText, { color: colors.TEXT_SECONDARY }]}>
                  {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : "Đã đọc hết thông báo"}
                </Text>
                {unreadCount > 0 ? (
                  <Pressable style={[styles.markAllButton, { backgroundColor: colors.CARD }]} onPress={markAllAsRead}>
                    <Text style={[styles.markAllText, { color: colors.PRIMARY }]}>Đọc tất cả</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
            <Pressable style={[styles.closeButton, { backgroundColor: colors.CARD }]} onPress={onClose} accessibilityRole="button" accessibilityLabel="Đóng">
              <AppIcon name="close" size={20} color={colors.TEXT} />
            </Pressable>
          </View>

          <NotificationFilters
            categoryFilter={categoryFilter}
            colors={colors}
            readFilter={readFilter}
            setCategoryFilter={setCategoryFilter}
            setReadFilter={setReadFilter}
          />

          {!loading && hasVisibleNotifications ? (
            <SelectionBar
              allVisibleSelected={allVisibleSelected}
              colors={colors}
              onDeleteSelected={confirmDeleteSelected}
              onToggleAll={toggleSelectAllVisible}
              selectedCount={selectedCount}
            />
          ) : null}

          {error ? <Text style={[styles.errorText, { color: colors.EXPENSE, backgroundColor: colors.EXPENSE_LIGHT }]}>{error}</Text> : null}

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.PRIMARY} />
              <Text style={[styles.loadingText, { color: colors.TEXT_SECONDARY }]}>Đang tải thông báo...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredNotifications}
              keyExtractor={(item, index) => String(item?.id ?? index)}
              renderItem={({ item }) => (
                <NotificationItem
                  item={item}
                  onDelete={confirmDeleteNotification}
                  onPress={markAsRead}
                  onToggleSelect={toggleSelectNotification}
                  selected={selectedIds.has(item?.id)}
                />
              )}
              contentContainerStyle={[styles.listContent, filteredNotifications.length === 0 && styles.emptyListContent]}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchNotifications({ silent: true })} tintColor={colors.PRIMARY} colors={[colors.PRIMARY]} />}
              ListEmptyComponent={<NotificationEmptyState colors={colors} hasNotifications={notifications.length > 0} />}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}
