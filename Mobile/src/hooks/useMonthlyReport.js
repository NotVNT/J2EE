import { useState, useEffect, useCallback, useMemo } from "react";
import { API_ENDPOINTS } from "../constants/api";
import apiClient from "../services/apiClient";
import { MONTH_LABELS } from "../utils/forecastDataUtils";

function getAccountStartDate(accountCreatedAt, fallbackDate) {
  if (!accountCreatedAt) return fallbackDate;

  const parsedDate = new Date(accountCreatedAt);
  if (Number.isNaN(parsedDate.getTime())) return fallbackDate;

  return parsedDate;
}

function buildReportMonthOptions({ accountCreatedAt, currentYear, currentMonth }) {
  const options = [];
  const currentDate = new Date(currentYear, currentMonth - 1, 1);
  const accountStartDate = getAccountStartDate(accountCreatedAt, currentDate);
  let cursorDate = new Date(accountStartDate.getFullYear(), accountStartDate.getMonth(), 1);

  if (cursorDate > currentDate) {
    cursorDate = currentDate;
  }

  while (cursorDate <= currentDate) {
    options.push({
      month: cursorDate.getMonth() + 1,
      year: cursorDate.getFullYear(),
      label: `${MONTH_LABELS[cursorDate.getMonth()]} ${cursorDate.getFullYear()}`
    });

    cursorDate = new Date(cursorDate.getFullYear(), cursorDate.getMonth() + 1, 1);
  }

  return options;
}

async function fetchReportByMonth(year, month) {
  const response = await apiClient.get(API_ENDPOINTS.MONTHLY_REPORT_BY_MONTH(year, month));
  return response.data;
}

export default function useMonthlyReport(accountCreatedAt) {
  const now = useMemo(() => new Date(), []);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchReportByMonth(selectedYear, selectedMonth);
      if (response.success) {
        setReport(response.data);
      } else {
        setError(response.message || "Không thể tải báo cáo tháng.");
      }
    } catch {
      setError("Không có dữ liệu báo cáo cho tháng này.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const selectMonth = useCallback((month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  }, []);

  const monthOptions = useMemo(
    () => buildReportMonthOptions({
      accountCreatedAt,
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth() + 1
    }),
    [accountCreatedAt, now]
  );

  const monthPickerLabel = `${MONTH_LABELS[selectedMonth - 1]} ${selectedYear}`;

  return {
    selectedMonth,
    selectedYear,
    report,
    loading,
    error,
    monthOptions,
    monthPickerLabel,
    selectMonth,
  };
}
