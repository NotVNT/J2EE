function safeAmount(value) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
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
