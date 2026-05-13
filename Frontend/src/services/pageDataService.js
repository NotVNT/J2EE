import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";

const cache = new Map();
const CACHE_TTL = 30000;

const getCached = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const setCached = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

const fetchCategories = async () => {
  const cached = getCached("categories");
  if (cached) return cached;
  const { data } = await axiosConfig.get(API_ENDPOINTS.GET_ALL_CATEGORIES);
  setCached("categories", data);
  return data;
};

const fetchExpenses = async () => {
  const cached = getCached("expenses");
  if (cached) return cached;
  const { data } = await axiosConfig.get(API_ENDPOINTS.GET_ALL_EXPENSE);
  setCached("expenses", data);
  return data;
};

const fetchIncomes = async () => {
  const cached = getCached("incomes");
  if (cached) return cached;
  const { data } = await axiosConfig.get(API_ENDPOINTS.GET_ALL_INCOMES);
  setCached("incomes", data);
  return data;
};

const fetchBudgets = async () => {
  const cached = getCached("budgets");
  if (cached) return cached;
  const { data } = await axiosConfig.get(API_ENDPOINTS.GET_BUDGETS);
  setCached("budgets", data);
  return data;
};

const fetchSavingGoals = async () => {
  const cached = getCached("savingGoals");
  if (cached) return cached;
  const { data } = await axiosConfig.get(API_ENDPOINTS.GET_SAVING_GOALS);
  setCached("savingGoals", data);
  return data;
};

const fetchDashboard = async () => {
  const cached = getCached("dashboard");
  if (cached) return cached;
  const { data } = await axiosConfig.get(API_ENDPOINTS.DASHBOARD_DATA);
  setCached("dashboard", data);
  return data;
};

export const getPageData = async (pageName) => {
  try {
    switch (pageName) {
      case "category":
        return { categories: await fetchCategories() };
      case "expense":
        return {
          expenses: await fetchExpenses(),
          categories: await fetchCategories()
        };
      case "income":
        return {
          incomes: await fetchIncomes(),
          categories: await fetchCategories()
        };
      case "budget":
        return {
          budgets: await fetchBudgets(),
          categories: await fetchCategories()
        };
      case "savingGoals":
        return { savingGoals: await fetchSavingGoals() };
      case "dashboard":
        return { dashboard: await fetchDashboard() };
      default:
        return null;
    }
  } catch {
    return null;
  }
};

export const clearPageDataCache = () => {
  cache.clear();
};
