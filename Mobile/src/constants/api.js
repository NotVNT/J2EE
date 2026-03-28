const fallbackBaseUrl = "https://money-manager-ln9d.onrender.com/api/v1.0";

export const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || fallbackBaseUrl;

export const API_ENDPOINTS = {
  HEALTH: "/health",
  LOGIN: "/login",
  GET_USER_INFO: "/profile",
  DASHBOARD_DATA: "/dashboard",
  GET_ALL_EXPENSE: "/expenses",
  ADD_EXPENSE: "/expenses",
  DELETE_EXPENSE: (expenseId) => `/expenses/${expenseId}`,
  CATEGORY_BY_TYPE: (type) => `/categories/type/${type}`
};
