const test = require("node:test");
const assert = require("node:assert/strict");

const {
  NOTIFICATION_CATEGORY_FILTERS,
  NOTIFICATION_READ_FILTERS,
  filterNotifications,
  getNextSelectionForVisibleNotifications
} = require("./notificationFilters");

const notifications = [
  { id: 1, type: "EXPENSE", isRead: false },
  { id: 2, type: "INCOME", isRead: true },
  { id: 3, type: "BUDGET_WARNING", isRead: false },
  { id: 4, type: "SYSTEM", isRead: false },
  { id: 5, type: "PAYMENT", isRead: true }
];

test("filterNotifications returns every notification by default", () => {
  assert.deepEqual(filterNotifications(notifications).map((item) => item.id), [1, 2, 3, 4, 5]);
});

test("filterNotifications can show unread notifications only", () => {
  const filtered = filterNotifications(notifications, {
    readFilter: NOTIFICATION_READ_FILTERS.UNREAD
  });

  assert.deepEqual(filtered.map((item) => item.id), [1, 3, 4]);
});

test("filterNotifications groups financial, budget, and system notifications", () => {
  assert.deepEqual(
    filterNotifications(notifications, {
      categoryFilter: NOTIFICATION_CATEGORY_FILTERS.FINANCIAL
    }).map((item) => item.id),
    [1, 2]
  );
  assert.deepEqual(
    filterNotifications(notifications, {
      categoryFilter: NOTIFICATION_CATEGORY_FILTERS.BUDGET
    }).map((item) => item.id),
    [3]
  );
  assert.deepEqual(
    filterNotifications(notifications, {
      categoryFilter: NOTIFICATION_CATEGORY_FILTERS.SYSTEM
    }).map((item) => item.id),
    [4, 5]
  );
});

test("getNextSelectionForVisibleNotifications toggles all visible ids", () => {
  assert.deepEqual(
    getNextSelectionForVisibleNotifications(notifications.slice(0, 3), new Set([5])),
    new Set([5, 1, 2, 3])
  );
  assert.deepEqual(
    getNextSelectionForVisibleNotifications(notifications.slice(0, 3), new Set([1, 2, 3, 5])),
    new Set([5])
  );
});
