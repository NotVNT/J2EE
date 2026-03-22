export const BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1.0";
export const CLOUDINARY_CLOUD_NAME =
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dcr9ovybu";
export const CLOUDINARY_UPLOAD_PRESET =
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "moneymanager";

export const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: "/login",
    REGISTER: "/register",
    ACTIVATE: "/activate",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",

    // User profile endpoints
    ACTIVATE_ACCOUNT: (token) => `/activate?token=${token}`,
    GET_USER_INFO: "/profile",
    UPDATE_AUTO_RENEW: "/profile/subscription/auto-renew",

    // Payment endpoints
    CREATE_PAYMENT: "/payments/payos/create",
    CONFIRM_PAYMENT_WEBHOOK: "/payments/payos/confirm-webhook",
    GET_PAYMENT_BY_ORDER_CODE: (orderCode) => `/payments/${orderCode}`,
    SYNC_PAYMENT_STATUS: (orderCode) => `/payments/${orderCode}/status`,

    // Category endpoints
    GET_ALL_CATEGORIES: "/categories",
    ADD_CATEGORY: "/categories",
    UPDATE_CATEGORY: (categoryId) => `/categories/${categoryId}`,
    CATEGORY_BY_TYPE: (type) => `/categories/type/${type}`,

    // Income endpoints
    GET_ALL_INCOMES: "/incomes",
    ADD_INCOME: "/incomes",
    DELETE_INCOME: (incomeId) => `/incomes/${incomeId}`,
    INCOME_EXCEL_DOWNLOAD: "excel/download/income",
    EMAIL_INCOME: "/email/income-excel",

    // Expense endpoints
    GET_ALL_EXPENSE: "/expenses",
    ADD_EXPENSE: "/expenses",
    DELETE_EXPENSE: (expenseId) => `/expenses/${expenseId}`,
    EXPENSE_EXCEL_DOWNLOAD: "excel/download/expense",
    EMAIL_EXPENSE: "/email/expense-excel",

    // Filter & Dashboard endpoints
    APPLY_FILTERS: "/filter",
    DASHBOARD_DATA: "/dashboard",

    // Budget endpoints
    GET_BUDGETS: "/budgets",
    SET_BUDGET: "/budgets",
    DELETE_BUDGET: (budgetId) => `/budgets/${budgetId}`,

    // AI assistant endpoints
    GEMINI_CHAT: "/gemini/chat",


    // Admin endpoints
    ADMIN_OVERVIEW: "/admin/overview",
    ADMIN_PAYMENTS: "/admin/payments",

    // Image upload
    UPLOAD_IMAGE: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
}
