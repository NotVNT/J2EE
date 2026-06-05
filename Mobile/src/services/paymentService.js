import { API_ENDPOINTS } from "../constants/api";
import apiClient from "./apiClient";

export async function createPaymentLink(payload) {
  const response = await apiClient.post(API_ENDPOINTS.CREATE_PAYMENT, payload);
  return response.data;
}

export async function fetchPaymentHistory() {
  const response = await apiClient.get(API_ENDPOINTS.GET_PAYMENTS);
  return Array.isArray(response.data) ? response.data : [];
}

export async function syncPaymentStatus(orderCode) {
  const response = await apiClient.get(API_ENDPOINTS.SYNC_PAYMENT_STATUS(orderCode));
  return response.data;
}

export async function deletePayment(orderCode) {
  const response = await apiClient.delete(API_ENDPOINTS.DELETE_PAYMENT(orderCode));
  return response.data;
}
