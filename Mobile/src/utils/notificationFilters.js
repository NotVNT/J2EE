const NOTIFICATION_READ_FILTERS = {
  ALL: "ALL",
  UNREAD: "UNREAD"
};

const NOTIFICATION_CATEGORY_FILTERS = {
  ALL: "ALL",
  FINANCIAL: "FINANCIAL",
  BUDGET: "BUDGET",
  SYSTEM: "SYSTEM"
};

const FINANCIAL_TYPES = new Set(["EXPENSE", "INCOME", "SPENDING_ALERT"]);
const BUDGET_TYPES = new Set(["BUDGET_WARNING", "BUDGET_EXCEEDED", "BUDGET_ALERT"]);

function matchesReadFilter(notification, readFilter = NOTIFICATION_READ_FILTERS.ALL) {
  return readFilter !== NOTIFICATION_READ_FILTERS.UNREAD || !notification?.isRead;
}

function matchesCategoryFilter(notification, categoryFilter = NOTIFICATION_CATEGORY_FILTERS.ALL) {
  const type = notification?.type;

  if (categoryFilter === NOTIFICATION_CATEGORY_FILTERS.FINANCIAL) {
    return FINANCIAL_TYPES.has(type);
  }

  if (categoryFilter === NOTIFICATION_CATEGORY_FILTERS.BUDGET) {
    return BUDGET_TYPES.has(type);
  }

  if (categoryFilter === NOTIFICATION_CATEGORY_FILTERS.SYSTEM) {
    return !FINANCIAL_TYPES.has(type) && !BUDGET_TYPES.has(type);
  }

  return true;
}

function filterNotifications(notifications = [], options = {}) {
  const readFilter = options.readFilter || NOTIFICATION_READ_FILTERS.ALL;
  const categoryFilter = options.categoryFilter || NOTIFICATION_CATEGORY_FILTERS.ALL;

  return notifications.filter(
    (notification) =>
      matchesReadFilter(notification, readFilter) &&
      matchesCategoryFilter(notification, categoryFilter)
  );
}

function getNextSelectionForVisibleNotifications(visibleNotifications = [], selectedIds = new Set()) {
  const visibleIds = visibleNotifications
    .map((notification) => notification?.id)
    .filter((id) => id !== null && id !== undefined);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const nextSelectedIds = new Set(selectedIds);

  if (allVisibleSelected) {
    visibleIds.forEach((id) => nextSelectedIds.delete(id));
  } else {
    visibleIds.forEach((id) => nextSelectedIds.add(id));
  }

  return nextSelectedIds;
}

module.exports = {
  NOTIFICATION_CATEGORY_FILTERS,
  NOTIFICATION_READ_FILTERS,
  filterNotifications,
  getNextSelectionForVisibleNotifications
};
