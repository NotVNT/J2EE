import http from "./http";
import { API_ENDPOINTS } from "../constants/api";

/**
 * Upload ảnh hóa đơn để backend phân tích (Gemini Vision OCR).
 * Trả về dữ liệu preview: merchant, location, receiptDate, items.
 *
 * @param {object} imageAsset - Kết quả từ expo-image-picker (có uri, mimeType, fileName)
 * @returns {Promise<object>} ReceiptImportAnalyzeResponseDTO
 */
export async function analyzeReceipt(imageAsset) {
  if (!imageAsset?.uri) {
    throw new Error("Không tìm thấy ảnh hóa đơn để phân tích.");
  }

  const fileName = imageAsset.fileName || imageAsset.uri.split("/").pop() || "receipt.jpg";
  const mimeType = imageAsset.mimeType || "image/jpeg";

  const formData = new FormData();
  formData.append("file", {
    uri: imageAsset.uri,
    name: fileName,
    type: mimeType,
  });

  const response = await http.post(API_ENDPOINTS.ANALYZE_EXPENSE_RECEIPT, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Accept: "application/json",
    },
  });

  return response.data;
}

/**
 * Xác nhận lưu các item từ hóa đơn thành các khoản chi thực tế.
 *
 * @param {object} payload - ReceiptImportConfirmRequestDTO
 * @param {string} payload.merchant
 * @param {string} payload.location
 * @param {string} payload.receiptDate - ISO date string
 * @param {number} [payload.jarId]
 * @param {Array} payload.items - Mảng ReceiptImportItemDTO đã được người dùng chỉnh sửa
 * @returns {Promise<object>} ReceiptImportResponseDTO
 */
export async function confirmReceiptImport(payload) {
  const response = await http.post(API_ENDPOINTS.CONFIRM_EXPENSE_RECEIPT_IMPORT, payload);
  return response.data;
}
