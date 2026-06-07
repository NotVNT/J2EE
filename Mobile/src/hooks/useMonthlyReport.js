import { useState, useEffect, useCallback, useMemo } from "react";
import { API_ENDPOINTS } from "../constants/api";
import apiClient from "../services/apiClient";

async function fetchReportByMonth(year, month) {
  const response = await apiClient.get(API_ENDPOINTS.MONTHLY_REPORT_BY_MONTH(year, month));
  return response.data;
}

export default function useMonthlyReport() {
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

  const goToPrevMonth = useCallback(() => {
    setSelectedMonth((prev) => {
      if (prev === 1) {
        setSelectedYear((y) => y - 1);
        return 12;
      }
      return prev - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setSelectedMonth((prev) => {
      if (prev === 12) {
        setSelectedYear((y) => y + 1);
        return 1;
      }
      return prev + 1;
    });
  }, []);

  return {
    selectedMonth,
    selectedYear,
    report,
    loading,
    error,
    goToPrevMonth,
    goToNextMonth,
  };
}
