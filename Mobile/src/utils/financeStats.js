function safeAmount(value) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
}

function getTransactionDate(item) {
  const value = item?.date || item?.createdAt;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateKey(date) {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addToBuckets(items, bucketMap, amountKey) {
  items.forEach((item) => {
    const date = getTransactionDate(item);
    const key = amountKey === "month" ? toMonthKey(date) : toDateKey(date);
    if (!bucketMap.has(key)) return;

    const target = bucketMap.get(key);
    target.value += Math.max(0, safeAmount(item?.amount));
  });
}

export function toMonthKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function buildRecentMonthKeys(count = 6, baseDate = new Date()) {
  const keys = [];
  const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);

  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(start.getFullYear(), start.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    keys.push(`${year}-${month}`);
  }

  return keys;
}

export function formatMonthKeyLabel(monthKey) {
  if (!monthKey || !monthKey.includes("-")) {
    return "-";
  }

  const [year, month] = monthKey.split("-");
  return `Tháng ${Number(month)}/${year}`;
}

export function formatMonthShortLabel(monthKey) {
  if (!monthKey || !monthKey.includes("-")) {
    return "-";
  }

  const [year, month] = monthKey.split("-");
  return `${month}/${String(year).slice(-2)}`;
}

export function buildMonthlyFinanceSeries({ incomes = [], expenses = [], monthsBack = 6 }) {
  const monthKeys = buildRecentMonthKeys(monthsBack);
  const map = new Map(
    monthKeys.map((key) => [key, { monthKey: key, income: 0, expense: 0, balance: 0 }])
  );

  incomes.forEach((item) => {
    const key = toMonthKey(item?.date);
    if (!map.has(key)) return;

    const target = map.get(key);
    target.income += Math.max(0, safeAmount(item?.amount));
  });

  expenses.forEach((item) => {
    const key = toMonthKey(item?.date);
    if (!map.has(key)) return;

    const target = map.get(key);
    target.expense += Math.max(0, safeAmount(item?.amount));
  });

  return monthKeys.map((key) => {
    const item = map.get(key) || { monthKey: key, income: 0, expense: 0 };
    return {
      ...item,
      balance: item.income - item.expense
    };
  });
}

export function buildReportWeekBuckets(selectedMonth, selectedYear, now = new Date()) {
  const isCurrentMonth =
    now.getFullYear() === selectedYear && now.getMonth() + 1 === selectedMonth;
  const anchor = isCurrentMonth ? now : new Date(selectedYear, selectedMonth - 1, 1);
  const mondayOffset = (anchor.getDay() + 6) % 7;
  let start = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - mondayOffset);

  if (start.getMonth() + 1 !== selectedMonth || start.getFullYear() !== selectedYear) {
    start = new Date(selectedYear, selectedMonth - 1, 1);
  }

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    return {
      key: toDateKey(date),
      label: `${date.getDate()}/${date.getMonth() + 1}`,
      summaryLabel: `Ngày ${date.getDate()}`,
      value: 0,
    };
  });
}

export function buildReportMonthBuckets(selectedMonth, selectedYear) {
  return Array.from({ length: 5 }, (_, index) => {
    const label = `T${index + 1}`;
    return {
      key: String(index),
      label,
      summaryLabel: `Tuần ${index + 1}`,
      value: 0,
    };
  });
}

export function buildReportSixMonthBuckets(selectedMonth, selectedYear) {
  const monthKeys = buildRecentMonthKeys(6, new Date(selectedYear, selectedMonth - 1, 1));
  return monthKeys.map((monthKey) => ({
    key: monthKey,
    label: formatMonthShortLabel(monthKey),
    summaryLabel: formatMonthShortLabel(monthKey),
    value: 0,
  }));
}

export function buildReportChartSeries({
  expenses = [],
  incomes = [],
  selectedMonth,
  selectedYear,
  range = "month",
  now = new Date(),
}) {
  let buckets;
  let title;
  let subtitle;
  let totalLabel;

  if (range === "week") {
    buckets = buildReportWeekBuckets(selectedMonth, selectedYear, now);
    title = "Biểu đồ theo tuần";
    subtitle = "Thu chi phân theo từng ngày trong tuần";
    totalLabel = "tổng tuần";
  } else if (range === "sixMonths") {
    buckets = buildReportSixMonthBuckets(selectedMonth, selectedYear);
    title = "Biểu đồ 6 tháng";
    subtitle = "Thu chi phân theo từng tháng gần nhất";
    totalLabel = "6 tháng";
  } else {
    buckets = buildReportMonthBuckets(selectedMonth, selectedYear);
    title = "Biểu đồ theo tháng";
    subtitle = "Thu chi phân theo từng tuần trong tháng";
    totalLabel = "tổng tháng";
  }

  const expenseBuckets = new Map(buckets.map((bucket) => [bucket.key, { ...bucket }]));
  const incomeBuckets = new Map(buckets.map((bucket) => [bucket.key, { ...bucket }]));

  if (range === "sixMonths") {
    addToBuckets(expenses, expenseBuckets, "month");
    addToBuckets(incomes, incomeBuckets, "month");
  } else if (range === "week") {
    addToBuckets(expenses, expenseBuckets, "date");
    addToBuckets(incomes, incomeBuckets, "date");
  } else {
    expenses.forEach((tx) => {
      const date = getTransactionDate(tx);
      if (!date || date.getFullYear() !== selectedYear || date.getMonth() + 1 !== selectedMonth) {
        return;
      }

      const day = date.getDate();
      const bucket = day <= 7 ? "0" : day <= 14 ? "1" : day <= 21 ? "2" : day <= 28 ? "3" : "4";
      expenseBuckets.get(bucket).value += Math.max(0, safeAmount(tx?.amount));
    });

    incomes.forEach((tx) => {
      const date = getTransactionDate(tx);
      if (!date || date.getFullYear() !== selectedYear || date.getMonth() + 1 !== selectedMonth) {
        return;
      }

      const day = date.getDate();
      const bucket = day <= 7 ? "0" : day <= 14 ? "1" : day <= 21 ? "2" : day <= 28 ? "3" : "4";
      incomeBuckets.get(bucket).value += Math.max(0, safeAmount(tx?.amount));
    });
  }

  const expense = buckets.map((bucket) => expenseBuckets.get(bucket.key) || bucket);
  const income = buckets.map((bucket) => incomeBuckets.get(bucket.key) || bucket);

  return {
    title,
    subtitle,
    totalLabel,
    labels: buckets.map((bucket) => bucket.label),
    expense,
    income,
    expenseTotal: expense.reduce((sum, bucket) => sum + bucket.value, 0),
    incomeTotal: income.reduce((sum, bucket) => sum + bucket.value, 0),
  };
}
