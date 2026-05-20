```
┌─────────────────┐     REST API / JWT      ┌──────────────────────┐
│   Frontend      │ ◄──────────────────────► │   Backend            │
│   React 19      │                          │   Spring Boot 4.0.3  │
│   Vite 8        │                          │   Java 21 / MySQL    │
└─────────────────┘                          └──────────┬───────────┘
                                                        │
┌─────────────────┐     REST API / JWT                  │
│   Mobile        │ ◄──────────────────────────────────►│
│   React Native  │                          ┌──────────┴───────────┐
│   Expo 53       │                          │   Dịch Vụ Bên Ngoài  │
└─────────────────┘                          │   Redis · MySQL      │
                                             │   PayOS · Gemini API │
                                             │   OpenRouter · S3    │
                                             │   AWS Lambda · SMTP  │
                                             └──────────────────────┘
```

---

## Công Nghệ Sử Dụng

### Backend — `Backend/moneymanager/`

| Danh Mục | Công Nghệ | Phiên Bản |
|---|---|---|
| Framework | Spring Boot | 4.0.3 |
| Ngôn Ngữ | Java | 21 |
| Công Cụ Build | Maven | - |
| Cơ Sở Dữ Liệu | MySQL + JPA/Hibernate | - |
| Cache / Lưu Trữ Khóa | Redis | - |
| Xác Thực | Spring Security + JWT | - |
| Thanh Toán | PayOS | - |
| AI — Gemini | Google Gemini API | gemini-2.0-flash-lite |
| AI — Chat | OpenRouter (GPT-OSS 120B) | - |
| Excel | Apache POI | - |
| Email | Spring Mail (Brevo SMTP) | - |
| Lưu Trữ File | AWS S3 | - |
| Tạo PDF | AWS Lambda | - |
| Lombok | Lombok | - |

**Mô Hình**: `@Controller → @Service → @Repository` + lớp DTO

### Frontend — `Frontend/`

| Danh Mục | Công Nghệ | Phiên Bản |
|---|---|---|
| Framework | React | 19.2 |
| Công Cụ Build | Vite | 8.0 (beta) |
| CSS | Tailwind CSS | 4.2 |
| Định Tuyến | React Router | 7 |
| HTTP | Axios | 1.13 |
| Biểu Đồ | Recharts | 3.8 |
| Biểu Tượng | Lucide React | 0.577 |
| Kéo & Thả | @dnd-kit | 6/10 |
| Markdown | react-markdown + remark-gfm + rehype-sanitize | - |
| Thông Báo | react-hot-toast | 2.6 |
| Bộ Chọn Emoji | emoji-picker-react | 4.18 |

### Mobile — `Mobile/`

| Danh Mục | Công Nghệ | Phiên Bản |
|---|---|---|
| Framework | React Native | 0.79.6 |
| Nền Tảng Build | Expo | 53 |
| Điều Hướng | React Navigation (thanh tab dưới + native stack) | 7 |
| Lưu Trữ Cục Bộ | AsyncStorage | 2.1 |
| HTTP | Axios | 1.13 |

---

## Các Gói Đăng Ký

Ba cấp độ kiểm soát quyền truy cập tính năng. Các hạn chế được thực thi **ở tầng dịch vụ backend** — frontend chỉ ẩn các phần tử giao diện.

| Tính Năng | MIỄN PHÍ | CƠ BẢN | PREMIUM |
|---|:---:|:---:|:---:|
| Danh Mục | 10 | 30 | Không Giới Hạn |
| Giao Dịch / tháng | 100 | 1.000 | Không Giới Hạn |
| Độ Sâu Bộ Lọc Lịch Sử | 3 tháng | 12 tháng | Không Giới Hạn |
| Xuất Excel | ❌ | ✅ | ✅ |
| Báo Cáo Email | ❌ | ✅ | ✅ |
| Chế Độ Chat Nova Money | ✅ | ✅ | ✅ |
| Chế Độ Agent Nova Money | ❌ | ✅ | ✅ |
| Nhập Hóa Đơn (Gemini Vision) | ❌ | ❌ | ✅ |
| Mẹo Tiết Kiệm AI | ❌ | ❌ | ✅ |
| Dự Báo Tài Chính | ❌ | ❌ | ✅ |

**Các Điểm Thực Thi Backend**: `CategoryService.create()`, `ExpenseService.create()`, `IncomeService.create()`, `FilterController`, `ExcelService`, `EmailService`, `ReceiptService`, `AICoachService`, `ForecastService`

**Luồng Đăng Ký**: Người dùng thanh toán qua PayOS → webhook `PAID` → backend kích hoạt gói trên `ProfileEntity` (`subscriptionPlan`, `subscriptionStatus`, `subscriptionActivatedAt`, `subscriptionExpiresAt`, `autoRenew`)

---

## Tính Năng AI — Nova Money

### Tổng Quan

Nova Money là trợ lý AI tích hợp sẵn, có thể truy cập từ nút chat nổi trên mọi trang đã xác thực. Nó có hai chế độ hoạt động mà người dùng có thể chọn:

```
┌─────────────────────────────────────────┐
│       Tiện Ích Nova Money               │
├────────────────────┬────────────────────┤
│   Chế Độ Agent     │   Chế Độ Chat      │
│   (Gemini)         │   (GPT-OSS)        │
│   CƠ BẢN+          │   Tất Cả Gói       │
│                    │                    │
│ Phân Tích Ý Định → │ Q&A Tự Do          │
│ Hoạt Động CRUD /   │ Lời Khuyên Tài Chính│
│ Xuất Báo Cáo       │ Không Thay Đổi Dữ Liệu│
└────────────────────┴────────────────────┘
```

### Cơ Sở Hạ Tầng AI

| Nhà Cung Cấp | Mô Hình | Được Sử Dụng Cho | Yêu Cầu Gói |
|---|---|---|---|
| Google Gemini | gemini-3.1-flash-lite | Chế độ Agent (phân tích ý định + thực thi) | CƠ BẢN+ |
| OpenRouter | GPT-OSS 120B | Chế độ Chat (trò chuyện) | Tất cả gói |
| NineRouter | EXPERIMENTAL | Chế độ Agent thử nghiệm (hiệu suất cao hơn) | PREMIUM |

**Xoay Vòng Khóa API (Redis)**  
Mỗi nhà cung cấp có một nhóm khóa API được lưu trữ trong Redis. Hệ thống theo dõi sử dụng hạn ngạch cho mỗi khóa và trạng thái cooldown. Khi một khóa vượt quá hạn ngạch hoặc trả về lỗi, khóa đó sẽ bị bỏ qua tự động và khóa có sẵn tiếp theo sẽ được sử dụng. Các khóa tự phục hồi sau khi thời gian cooldown hết hạn.

---

### Chế Độ Agent — Đường Ống Ý Định → CRUD

**Có sẵn từ gói CƠ BẢN.** Người dùng nhập lệnh bằng ngôn ngữ tự nhiên → Gemini phân tích ý định → frontend hiển thị biểu mẫu xác nhận → người dùng chấp phát hành → backend thực thi → hoàn tác có sẵn trong vài phút.

**Đường Ống**:
```
Tin nhắn của người dùng
    │
    ▼
POST /ai/parse-intent
(Gemini, hệ thống prompt bao gồm dữ liệu trang hiện tại)
    │
    ▼
Intent JSON trả về
    │
    ├── Ý định CRUD / Hành động → hiển thị AIConfirmationForm cho người dùng
    │       │
    │       ▼  (người dùng xác nhận)
    │   POST /ai/confirm-action
    │       │
    │       ▼
    │   Backend thực thi → trả về operationId để hoàn tác
    │
    └── ANSWER_QUESTION → hiển thị câu trả lời inline (không xác nhận)
```

**Các Ý Định Được Hỗ Trợ**:

| Nhóm | Ý Định |
|---|---|
| Chi Tiêu | `CREATE_EXPENSE`, `UPDATE_EXPENSE`, `DELETE_EXPENSE` |
| Thu Nhập | `CREATE_INCOME`, `UPDATE_INCOME`, `DELETE_INCOME` |
| Danh Mục | `CREATE_CATEGORY`, `UPDATE_CATEGORY`, `DELETE_CATEGORY` |
| Ngân Sách | `CREATE_BUDGET`, `UPDATE_BUDGET`, `DELETE_BUDGET` |
| Mục Tiêu Tiết Kiệm | `CREATE_SAVING_GOAL`, `UPDATE_SAVING_GOAL`, `DELETE_SAVING_GOAL` |
| Xuất Báo Cáo | `EXPORT_EXCEL_INCOME`, `EXPORT_EXCEL_EXPENSE` |
| Email | `EMAIL_INCOME_REPORT`, `EMAIL_EXPENSE_REPORT` |
| Q&A | `ANSWER_QUESTION` |
| Bảo Vệ | `INVALID_REQUEST` |

**Nhận Thức Ngữ Cảnh**: Hệ thống prompt bao gồm dữ liệu thực tế từ trang hiện tại của người dùng (ví dụ: danh sách danh mục của họ khi ở trang Danh Mục) để Gemini có thể phân giải các tham chiếu như "xóa danh mục thực phẩm" thành một ID thực tế.

**Hoàn Tác**: Sau một hoạt động CRUD thành công, backend lưu trữ một `operationId`. Frontend hiển thị nút hoàn tác; gọi `POST /ai/undo/{operationId}` trong cửa sổ được phép sẽ đảo ngược hành động.

---

### Chế Độ Chat — Trò Chuyện Tự Do

**Có sẵn cho tất cả các gói (bao gồm MIỄN PHÍ).** Sử dụng GPT-OSS 120B qua OpenRouter. Không thực hiện bất kỳ hoạt động dữ liệu nào — chỉ là Q&A hội thoại thuần túy.

Khả Năng:
- Lời khuyên tài chính cá nhân
- Phân tích tâm lý chi tiêu
- Hỗ trợ cảm xúc về tiền bạc
- Lập kế hoạch mục tiêu dài hạn
- Câu hỏi tài chính chung

Lịch Sử Trò Chuyện: 20 tin nhắn cuối cùng được gửi dưới dạng ngữ cảnh trên mỗi yêu cầu.

---

### Mẹo Tiết Kiệm Thông Minh (AI Coach)

**Chỉ PREMIUM.** Phân tích các giao dịch trong 3 tháng cuối cùng của người dùng và trả về các mẹo tiết kiệm theo tiếng Việt được cá nhân hóa. Được Gemini hỗ trợ.

---

### Nhập Hóa Đơn (Gemini Vision)

**Chỉ PREMIUM.** Người dùng tải lên hình ảnh hóa đơn (≤ 10 MB, JPEG/PNG/WebP) → Gemini Vision trích xuất tên thương gia, mục hàng và tổng số tiền → tự động điền vào biểu mẫu tạo chi tiêu.

---

### Tiện Ích Nova Money — Chi Tiết Giao Diện

Nút chat nổi nằm ở góc dưới bên phải trên tất cả các trang đã xác thực.

- **Bong bóng lời chào**: Sau 5 giây không hoạt động, một bong bóng lời nói sẽ hiện lên với một thông điệp hài hước ngẫu nhiên (30 thông điệp quay vòng, thay đổi mỗi 20 giây). Biến mất khi chat mở.
- **Hình đại diện**: Sử dụng `AI_favicon.png` ở khắp nơi — nút nổi, tiêu đề chat và hình đại diện cho từng tin nhắn.
- **Bố cục hai bảng**: Bảng chat hỗ trợ các chế độ bình thường và mở rộng (800px rộng).
- **Kết Xuất Markdown**: Phản hồi AI hỗ trợ bảng, khối mã, danh sách, blockquote thông qua `react-markdown` + `remark-gfm` + `rehype-sanitize`.
- **Chỉ Số Nhập**: Hoạt ảnh ba chấm nảy lên trong khi chờ phản hồi.
- **Bảo Vệ Ý Định Đang Chờ**: Khi biểu mẫu xác nhận CRUD đang mở, tin nhắn mới bị chặn cho đến khi người dùng xác nhận hoặc hủy.
- **Chọn Model Agent**: Người dùng PREMIUM có thể chuyển giữa `Gemini 3.1 Flash Lite` (mặc định) và `EXPERIMENTAL` (NineRouter). Khi chọn EXPERIMENTAL lần đầu, modal cảnh báo sẽ hiện để xác nhận.

---

## Các Tính Năng Khác

### Dự Báo Tài Chính
Dự đoán chi tiêu của tháng tới dựa trên 6 tháng lịch sử. Phát hiện bất thường (2+ độ lệch chuẩn từ trung bình). Phân tích xu hướng ở cấp danh mục. **Chỉ PREMIUM.**

### Quản Lý Ngân Sách
Giới hạn chi tiêu hàng tháng cho mỗi danh mục. Theo dõi % sử dụng. Cảnh báo khi vượt ngân sách.

### Hệ Thống Các Hũ Chi Tiêu (Jars / Envelopes)

Cho phép người dùng phân bổ thu nhập vào nhiều "ví phụ" riêng biệt theo tỷ lệ phần trăm, giúp kiểm soát chi tiêu theo từng mục đích cụ thể (ví dụ: Sinh hoạt, Giải trí, Đầu tư, Tiết kiệm).

#### Giới Hạn Theo Gói

| Gói | Số Hũ Tối Đa |
|---|:---:|
| FREE | 1 Hũ |
| BASIC | 6 Hũ |
| PREMIUM | Không giới hạn |

Hũ mặc định **"Ví tổng"** được tạo tự động khi người dùng lần đầu truy cập tính năng. Tỷ lệ của Ví tổng được tính tự động bằng phần còn lại (100% − tổng tỷ lệ các Hũ khác).

#### Phân Bổ Thu Nhập

Mỗi Hũ có một **tỷ lệ phân bổ (%)** — khi thu nhập được ghi nhận, hệ thống tự động cộng phần tương ứng vào số dư từng Hũ. Tỷ lệ phân bổ phải nằm trong khoảng 0–100% và được xác thực ở cả frontend lẫn backend.

#### Chi Tiêu Theo Hũ

Khi thêm một khoản chi tiêu (thủ công hoặc qua **Chi Tiêu Nhanh**), người dùng chọn Hũ cần trừ tiền. Số dư Hũ tương ứng giảm ngay lập tức.

- **Chi Tiêu Nhanh (Quick Expense Templates)**: Khi nhấn vào mẫu chi tiêu nhanh, hộp thoại **"Trừ từ hũ nào?"** tự động hiện lên để người dùng chọn Hũ trước khi xác nhận.
- `jarId` được gửi kèm trong payload `POST /api/v1.0/expenses` để backend liên kết khoản chi tiêu với Hũ tương ứng.

#### Chuyển Tiền Giữa Các Hũ

Cho phép di chuyển số dư từ Hũ này sang Hũ khác thông qua nút **"Chuyển tiền"** trên trang Hũ chi tiêu.

**Quy tắc nghiệp vụ (thực thi ở backend)**:
- Không thể chuyển tiền vào cùng một Hũ (`fromJarId == toJarId`).
- Số tiền chuyển phải lớn hơn 0.
- Số dư Hũ nguồn phải đủ để thực hiện giao dịch.

#### Quản Lý Hũ

Mỗi Hũ có các thuộc tính tùy chỉnh:

| Thuộc Tính | Mô Tả |
|---|---|
| Tên | Tên hiển thị của Hũ |
| Biểu Tượng (Emoji) | Icon đại diện |
| Màu Sắc | Mã màu hex (10 màu có sẵn) |
| Tỷ Lệ Phân Bổ | Phần trăm thu nhập được phân bổ (0–100%) |
| Số Dư Hiện Tại | Tổng tiền đang có trong Hũ |

#### API Endpoints

| Method | Endpoint | Mô Tả |
|---|---|---|
| `GET` | `/api/v1.0/jars` | Lấy danh sách tất cả Hũ |
| `POST` | `/api/v1.0/jars` | Tạo Hũ mới |
| `PUT` | `/api/v1.0/jars/{id}` | Cập nhật Hũ |
| `DELETE` | `/api/v1.0/jars/{id}` | Xóa Hũ |
| `POST` | `/api/v1.0/jars/transfer` | Chuyển tiền giữa hai Hũ |

#### Các File Liên Quan

**Backend**
- `JarEntity.java` — Entity JPA cho Hũ chi tiêu
- `JarService.java` — Logic nghiệp vụ (tạo, cập nhật, xóa, chuyển tiền, tái tính tỷ lệ Ví tổng)
- `JarController.java` — REST controller

**Frontend**
- `src/pages/Jars.jsx` — Trang Hũ chi tiêu (tổng quan, biểu đồ phân bổ, danh sách Hũ)
- `src/components/JarForm.jsx` — Form tạo / chỉnh sửa Hũ
- `src/components/JarTransferModal.jsx` — Modal chuyển tiền giữa các Hũ
- `src/components/QuickExpenseTemplates.jsx` — Chi tiêu nhanh tích hợp chọn Hũ (JarPickerModal)

### Mục Tiêu Tiết Kiệm
Tạo mục tiêu với số tiền mục tiêu và thời hạn. Ghi lại những khoản đóng góp. Theo dõi trạng thái ĐANG HOẠT ĐỘNG / HOÀN THÀNH / ĐÃ HỦY. Tự động tính toán khoản đóng góp hàng tháng cần thiết.

**Tích hợp AI Agent**: Khi người dùng đang ở trang Mục Tiêu Tiết Kiệm, Nova Money nhận đầy đủ ngữ cảnh của từng mục tiêu (số tiền mục tiêu, đã tích lũy, còn thiếu, tiến độ %, cần/tháng, đã đóng tháng này, ngày hết hạn, trạng thái chậm/đúng tiến độ). AI có thể trả lời câu hỏi như *"còn thiếu bao nhiêu?"*, *"khi nào hoàn thành?"* và thực hiện CREATE / UPDATE / DELETE mục tiêu đúng theo ID.

### Tiện Ích Bảng Điều Khiển
Bố cục tiện ích có thể tùy chỉnh kéo và thả (qua `@dnd-kit`). Thẻ báo cáo hàng tháng với điểm chi tiêu A–F, phân tích danh mục, tiến trình tiết kiệm.

### Xuất Excel
Báo cáo XLSX qua Apache POI. Bản địa hóa Việt Nam, hàng có mã màu (xanh = thu nhập, đỏ = chi tiêu), màu hàng xen kẽ, tổng được định dạng VND. **Chỉ CƠ BẢN+.**

### Báo Cáo Email
Báo cáo Excel được gửi dưới dạng tệp đính kèm email qua Spring Mail (Brevo SMTP). Bao gồm thẻ báo cáo hàng tháng với điểm chi tiêu. **Chỉ CƠ BẢN+.**

### Xác Thực OTP
OTP 6 chữ số (BCrypt-hashed) để kích hoạt tài khoản và đặt lại mật khẩu. Hiệu lực 210 giây, cooldown 180 giây, tối đa 5 lần thử, so sánh thời gian không đổi.

### Google OAuth2
Đăng nhập bằng Google. Xác thực mã thông báo Google ID, tự động tạo hồ sơ cho người dùng mới, phát hành JWT.

### Thanh Toán PayOS
Tạo liên kết thanh toán, xử lý webhook, tự động đồng bộ hóa trạng thái thanh toán mỗi 30 giây, kích hoạt đăng ký sau khi thanh toán thành công.

### Bảo Vệ Chống Spam
Bảo vệ hai lớp:
- **Dựa trên Redis**: Bộ đếm gửi email theo tài khoản. Trên 5/phút → khóa 10 phút. Trên 10 → khóa 5 giờ.
- **Giới Hạn Tốc Độ Trong Bộ Nhớ**: Giới hạn mỗi IP cho mỗi điểm cuối (đăng nhập: 5/phút, quên mật khẩu: 5/phút, gửi lại OTP: 3/phút, AI chat: 15/phút). Trả về HTTP 429 khi vượt quá.

### Tải Lên File
Ảnh hồ sơ được tải lên AWS S3. Xác nhận magic bytes (JPEG/PNG/GIF/WebP chỉ).

### Hóa Đơn PDF
AWS Lambda tạo hóa đơn PDF sau khi thanh toán thành công.

### Thông Báo
Thông báo trong ứng dụng + email với các công tắc cho mỗi loại. Cảnh báo ngân sách, nhắc nhở mục tiêu tiết kiệm, xác nhận thanh toán.

### Bảng Điều Khiển Quản Trị
Chỉ vai trò `ADMIN`. Quản lý người dùng (CRUD), giám sát thanh toán, quản lý đăng ký, thông báo phát sóng, thống kê tổng quan.

### Ứng Dụng Mobile
React Native (Expo). Điều hướng tab dưới (Bảng Điều Khiển + Màn Hình Chi Tiêu). Xác thực JWT được lưu trữ trong AsyncStorage. Kéo để làm mới.

---

## Cổng Mặc Định

| Dịch Vụ | Cổng |
|---|---|
| Backend (Spring Boot) | 8080 |
| Frontend (Vite dev) | 5173 |
| MySQL | 3306 |
| Redis | 6379 |

---

## Bắt Đầu Nhanh

```bash
# Backend
cd Backend/moneymanager
mvn spring-boot:run

# Frontend
cd Frontend
npm install
npm run dev

# Mobile
cd Mobile
npm install
npm start
```
