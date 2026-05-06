MoneyManager Mobile (React Native + Expo)
Ứng dụng mobile được tách riêng từ dự án web hiện tại, dùng lại backend Spring Boot hiện có.

Cài Node.js LTS và Expo CLI (qua npx expo ...).
Từ thư mục Mobile, cài dependency:
    npm install
Tạo file .env từ .env.example và cập nhật EXPO_PUBLIC_API_BASE_URL.
Chạy app:
    npm run start
Nếu bạn muốn chạy bằng development build trên Android, cài build trước:
    npm run android
Sau khi build đã được cài trên emulator hoặc thiết bị, khởi động Metro cho dev client:
    npx expo start --dev-client
Mở app bằng build development đã cài sẵn trên Android/iOS.
Lưu ý: `npx expo start --android` sẽ báo lỗi nếu chưa có development build trong máy/emulator.

Chỉ chạy lệnh tại thời điểm hiện tại:       npx expo start --go  
