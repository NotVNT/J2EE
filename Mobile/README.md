# MoneyManager Mobile (React Native + Expo)

Ứng dụng mobile được tách riêng từ dự án web hiện tại, dùng lại backend Spring Boot hiện có.

## 1) Khởi động nhanh

1. Cài Node.js LTS và Expo CLI (qua `npx expo ...`).
2. Từ thư mục `Mobile`, cài dependency:
   - `npm install`
3. Tạo file `.env` từ `.env.example` và cập nhật `EXPO_PUBLIC_API_BASE_URL`.
4. Chạy app:
   - `npm run start`
5. Mở bằng Expo Go hoặc emulator Android/iOS.

## 2) Cấu trúc chính

- `src/context/AuthContext.js`: quản lý đăng nhập, token, user session.
- `src/services/http.js`: axios client + interceptor Bearer token.
- `src/navigation/AppNavigator.js`: `Auth stack` + `Bottom tabs` + stack mở rộng.
- `src/screens/*`: đầy đủ màn hình cho `Auth`, `Dashboard`, `Expense`, `Income`, `Budget`, `Saving Goal`, `Category`, `Filter`, `Payment`, `Profile`.

## 3) Mapping từ web sang mobile

- API endpoint giữ nguyên theo backend hiện tại.
- Auth token chuyển từ `localStorage/sessionStorage` sang `AsyncStorage`.
- Routing web (`react-router-dom`) chuyển sang `React Navigation`.
- UI component web/Tailwind chuyển dần sang RN styles (StyleSheet).

## 4) Chức năng đã có trên mobile

1. Auth: đăng nhập, đăng ký, quên mật khẩu.
2. Dashboard: tổng quan thu chi + số dư + điều hướng nhanh.
3. Expense/Income: danh sách, thêm mới, xóa.
4. Budget: tạo/xóa ngân sách theo danh mục + tiến độ sử dụng.
5. Saving Goal: tạo mục tiêu, đóng góp, xóa.
6. Category: tạo và xem danh mục thu/chi.
7. Filter: lọc giao dịch theo loại/ngày/từ khóa/sắp xếp.
8. Payment: OTP thanh toán, tạo link PayOS, đồng bộ trạng thái.
9. Profile: cập nhật hồ sơ, đổi mật khẩu, auto-renew.

## 5) Việc nên làm tiếp theo

1. Bổ sung import hóa đơn bằng ảnh (`expo-image-picker`).
2. Thêm biểu đồ chuyên sâu tương đương web (line/pie chart).
3. Hoàn thiện luồng OTP giao dịch cho add/delete income/expense.
4. Tách service + hooks để tối ưu maintainability.
5. Đóng gói release Android/iOS.


npx expo start --dev-client