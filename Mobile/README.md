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
- `src/navigation/AppNavigator.js`: `Auth stack` + `Bottom tabs`.
- `src/screens/*`: các màn hình mẫu `Login`, `Dashboard`, `Expense`, `AddExpense`.

## 3) Mapping từ web sang mobile

- API endpoint giữ nguyên theo backend hiện tại.
- Auth token chuyển từ `localStorage/sessionStorage` sang `AsyncStorage`.
- Routing web (`react-router-dom`) chuyển sang `React Navigation`.
- UI component web/Tailwind chuyển dần sang RN styles (StyleSheet).

## 4) Lộ trình đề xuất

1. Hoàn thiện luồng Auth (đăng ký/quên mật khẩu/activate).
2. Port các màn hình cốt lõi: Dashboard, Expense, Income, Budget.
3. Tối ưu UX mobile (pull-to-refresh, skeleton, offline handling).
4. Bổ sung upload ảnh hóa đơn bằng camera/gallery (`expo-image-picker`).
5. Đóng gói release Android/iOS.
