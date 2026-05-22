# Money Manager - Quản Lý Tài Chính Cá Nhân

Ứng dụng quản lý tài chính cá nhân toàn diện cho Web và Mobile. Hỗ trợ theo dõi thu nhập/chi tiêu, lập ngân sách, quản lý mục tiêu tiết kiệm, dự báo tài chính, xuất báo cáo Excel/Email, và trợ lý AI tích hợp (Nova Money).

---

## Kiến Trúc Hệ Thống

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
│   Expo 53       │                          │   External Services  │
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
| Build Tool | Maven | - |
| Database | MySQL + JPA/Hibernate | - |
| Cache / API Key Store | Redis | - |
| Authentication | Spring Security + JWT | - |
| Thanh Toán | PayOS | - |
| AI — Agent | Google Gemini API | gemini-3.1-flash-lite |
| AI — Chat | OpenRouter (GPT-OSS 120B) | - |
| Excel | Apache POI | - |
| Email | Spring Mail (Brevo SMTP) | - |
| File Storage | AWS S3 | - |
| PDF Generation | AWS Lambda | - |
| Lombok | Lombok | - |

**Pattern**: `@Controller → @Service → @Repository` + DTO layer

### Frontend — `Frontend/`

| Danh Mục | Công Nghệ | Phiên Bản |
|---|---|---|
| Framework | React | 19.2 |
| Build Tool | Vite | 8.0 (beta) |
| CSS | Tailwind CSS | 4.2 |
| Routing | React Router | 7 |
| HTTP | Axios | 1.13 |
| Charts | Recharts | 3.8 |
| Icons | Lucide React | 0.577 |
| Drag & Drop | @dnd-kit | 6/10 |
| Markdown | react-markdown + remark-gfm + rehype-sanitize | - |
| Notifications | react-hot-toast | 2.6 |
| Emoji Picker | emoji-picker-react | 4.18 |

### Mobile — `Mobile/`

| Danh Mục | Công Nghệ | Phiên Bản |
|---|---|---|
| Framework | React Native | 0.79.6 |
| Build Platform | Expo | 53 |
| Navigation | React Navigation (bottom tab + native stack) | 7 |
| Local Storage | AsyncStorage | 2.1 |
| HTTP | Axios | 1.13 |

---

## Các Gói Đăng Ký

Ba cấp độ kiểm soát quyền truy cập tính năng. Các hạn chế được thực thi **ở tầng service backend** — frontend chỉ ẩn UI.

| Tính Năng | FREE | BASIC | PREMIUM |
|---|:---:|:---:|:---:|
| Danh Mục | 10 | 30 | Không giới hạn |
| Giao Dịch / tháng | 100 | 1.000 | Không giới hạn |
| History Filter | 3 tháng | 12 tháng | Không giới hạn |
| Xuất Excel | ❌ | ✅ | ✅ |
| Báo Cáo Email | ❌ | ✅ | ✅ |
| Nova Money Chat | ✅ | ✅ | ✅ |
| Nova Money Agent | ❌ | ✅ | ✅ |
| Receipt Import (Gemini Vision) | ❌ | ❌ | ✅ |
| AI Smart Tips | ❌ | ❌ | ✅ |
| Dự Báo Tài Chính | ❌ | ❌ | ✅ |

**Backend enforcement points**: `CategoryService.create()`, `ExpenseService.create()`, `IncomeService.create()`, `FilterController`, `ExcelService`, `EmailService`, `ReceiptService`, `AICoachService`, `ForecastService`

**Subscription flow**: Người dùng thanh toán qua PayOS → webhook `PAID` → backend kích hoạt gói trên `ProfileEntity` (`subscriptionPlan`, `subscriptionStatus`, `subscriptionActivatedAt`, `subscriptionExpiresAt`, `autoRenew`)

---

## Tính Năng AI — Nova Money

### Tổng Quan

Nova Money là trợ lý AI tích hợp sẵn, có thể truy cập từ floating button góc phải dưới trên mọi trang đã xác thực. Hai chế độ hoạt động với model khác nhau tùy theo gói:

```
┌─────────────────────────────────────────┐
│         Nova Money Widget               │
├────────────────────┬────────────────────┤
│    Agent Mode      │    Chat Mode       │
│    BASIC+          │    Tất cả gói      │
│                    │                    │
│  Intent Parsing →  │  Q&A tự do         │
│  CRUD / Export     │  Lời khuyên TC     │
│                    │  No data changes   │
└────────────────────┴────────────────────┘
```

### Model Theo Gói Đăng Ký

| Gói | Chat Model | Agent Model |
|---|---|---|
| FREE | ✨ Nova Lite (NineRouter) | ❌ Không có |
| BASIC | ✨ Nova Lite (NineRouter) | ✨ Nova Lite (NineRouter) |
| PREMIUM | GPT-OSS 120B, Nova Lite, Gemini | Gemini, Nova Lite |

### AI Infrastructure

| Provider | Model | Dùng cho | Plan yêu cầu |
|---|---|---|---|
| Google Gemini | gemini-3.1-flash-lite | Agent mode (intent parsing + execution) | PREMIUM |
| OpenRouter | GPT-OSS 120B | Chat mode | PREMIUM |
| NineRouter | Nova Lite (Gemma 4 31B) | Chat và Agent mặc định cho tất cả gói | Tất cả gói |

**API Key Rotation (Redis cho Gemini)**  
Google Gemini có một pool API key lưu trong Redis. Hệ thống theo dõi quota và trạng thái cooldown từng key. Khi một key vượt quota hoặc lỗi, tự động failover sang key tiếp theo. Các key tự phục hồi sau cooldown. Các provider khác (OpenRouter, NineRouter) sử dụng single key.

---

### Agent Mode — Intent → CRUD Pipeline

**Có sẵn từ gói BASIC.** Người dùng nhập lệnh ngôn ngữ tự nhiên → AI parse intent (Nova Lite cho BASIC, Gemini hoặc Nova Lite cho PREMIUM) → frontend hiển thị confirmation form → người dùng xác nhận → backend thực thi → undo khả dụng trong vài phút.

**Pipeline**:
```
User message
    │
    ▼
POST /ai/parse-intent
(AI model + system prompt với dữ liệu trang hiện tại)
    │
    ▼
Intent JSON
    │
    ├── CRUD / Action intent → hiển thị AIConfirmationForm
    │       │
    │       ▼  (user confirms)
    │   POST /ai/confirm-action
    │       │
    │       ▼
    │   Backend executes → trả về operationId để undo
    │
    └── ANSWER_QUESTION → hiển thị inline answer (không cần confirm)
```

**Supported Intents**:

| Nhóm | Intent |
|---|---|
| Chi Tiêu | `CREATE_EXPENSE`, `UPDATE_EXPENSE`, `DELETE_EXPENSE` |
| Thu Nhập | `CREATE_INCOME`, `UPDATE_INCOME`, `DELETE_INCOME` |
| Danh Mục | `CREATE_CATEGORY`, `UPDATE_CATEGORY`, `DELETE_CATEGORY` |
| Ngân Sách | `CREATE_BUDGET`, `UPDATE_BUDGET`, `DELETE_BUDGET` |
| Mục Tiêu Tiết Kiệm | `CREATE_SAVING_GOAL`, `UPDATE_SAVING_GOAL`, `DELETE_SAVING_GOAL` |
| Xuất Báo Cáo | `EXPORT_EXCEL_INCOME`, `EXPORT_EXCEL_EXPENSE` |
| Email | `EMAIL_INCOME_REPORT`, `EMAIL_EXPENSE_REPORT` |
| Q&A | `ANSWER_QUESTION` |
| Guard | `INVALID_REQUEST` |

**Context-aware**: System prompt bao gồm dữ liệu thực tế từ trang hiện tại (ví dụ: danh sách danh mục khi ở trang Danh Mục) để AI có thể resolve "xóa danh mục thực phẩm" thành ID thực tế.

**Undo**: Sau CRUD thành công, backend lưu `operationId`. Frontend hiển thị nút undo; gọi `POST /ai/undo/{operationId}` trong cửa sổ cho phép sẽ đảo ngược hành động.

---

### Chat Mode — Q&A Tự Do

**Có sẵn cho tất cả các gói (bao gồm FREE).** Mặc định dùng `✨ Nova Lite` (NineRouter / Gemma 4 31B). PREMIUM có thể chuyển sang GPT-OSS 120B hoặc Gemini. Không thực hiện bất kỳ data operation nào.

Capabilities:
- Lời khuyên tài chính cá nhân
- Phân tích tâm lý chi tiêu
- Hỗ trợ cảm xúc về tiền bạc
- Lập kế hoạch mục tiêu dài hạn
- Câu hỏi tài chính chung

Conversation history: 20 tin nhắn cuối được gửi kèm làm context mỗi request.

---

### AI Smart Tips (AI Coach)

**Chỉ PREMIUM.** Phân tích giao dịch 3 tháng gần nhất và trả về mẹo tiết kiệm cá nhân hóa bằng tiếng Việt. Powered by Gemini.

---

### Receipt Import (Gemini)

**Chỉ PREMIUM.** Người dùng upload ảnh/PDF hóa đơn (≤ 10 MB, JPEG/PNG/WebP/PDF) → Gemini trích xuất tên cửa hàng, danh mục và tổng tiền → tự động điền vào form tạo chi tiêu.

---

### Nova Money Widget — UI Details

Floating button góc phải dưới trên tất cả các trang đã xác thực.

- **Greeting bubble**: Sau 5 giây, một bubble hiện lên với thông điệp hài hước ngẫu nhiên (30 messages, rotate mỗi 20 giây). Ẩn khi chat mở.
- **Avatar**: Dùng `AI_favicon.png` ở khắp nơi — floating button, chat header và từng message bubble.
- **Layout**: Chat panel hỗ trợ normal và expanded mode (800px wide).
- **Markdown rendering**: Response AI hỗ trợ table, code block, list, blockquote qua `react-markdown` + `remark-gfm` + `rehype-sanitize`.
- **Typing indicator**: Animation ba chấm nảy lên khi chờ response.
- **Pending Intent Guard**: Khi confirmation form đang mở, tin nhắn mới bị chặn cho đến khi user confirm hoặc cancel.
- **Model Selector**: Mặc định `✨ Nova Lite` cho tất cả gói. PREMIUM có thể chuyển sang `GPT-OSS 120B` (Chat) hoặc `Gemini 3.1 Flash Lite` (Agent). Khi PREMIUM chọn Nova Lite, `ExperimentalWarningModal` hiện để xác nhận. FREE/BASIC bị lock ở Nova Lite — các model khác hiện `(PREMIUM)` và bị disable. Render bởi `ModelSelector.jsx`.

---

## Các Tính Năng Khác

### Dự Báo Tài Chính
Dự đoán chi tiêu tháng tới dựa trên 6 tháng lịch sử. Anomaly detection (2+ standard deviations). Phân tích trend theo danh mục. **Chỉ PREMIUM.**

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

Mỗi Hũ có một **tỷ lệ phân bổ (%)** — khi thu nhập được ghi nhận, hệ thống tự động cộng phần tương ứng vào số dư từng Hũ. Tỷ lệ phân bổ phải nằm trong khoảng 0–100% và được validate ở cả frontend lẫn backend.

#### Chi Tiêu Theo Hũ

Khi thêm một khoản chi tiêu (thủ công hoặc qua **Chi Tiêu Nhanh**), người dùng chọn Hũ cần trừ tiền. Số dư Hũ tương ứng giảm ngay lập tức.

- **Chi Tiêu Nhanh (Quick Expense Templates)**: Khi nhấn vào template chi tiêu nhanh, dialog **"Trừ từ hũ nào?"** tự động hiện lên để người dùng chọn Hũ trước khi xác nhận.
- `jarId` được gửi kèm trong payload `POST /api/v1.0/expenses` để backend liên kết khoản chi tiêu với Hũ tương ứng.

#### Chuyển Tiền Giữa Các Hũ

Cho phép di chuyển số dư từ Hũ này sang Hũ khác thông qua nút **"Chuyển tiền"** trên trang Hũ chi tiêu.

**Business rules (enforce ở backend)**:
- Không thể chuyển tiền vào cùng một Hũ (`fromJarId == toJarId`).
- Số tiền chuyển phải lớn hơn 0.
- Số dư Hũ nguồn phải đủ để thực hiện giao dịch.

#### Quản Lý Hũ

Mỗi Hũ có các thuộc tính tùy chỉnh:

| Thuộc Tính | Mô Tả |
|---|---|
| Tên | Tên hiển thị của Hũ |
| Icon (Emoji) | Icon đại diện |
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
- `JarEntity.java` — JPA entity cho Hũ chi tiêu
- `JarService.java` — Business logic (tạo, cập nhật, xóa, chuyển tiền, tái tính tỷ lệ Ví tổng)
- `JarController.java` — REST controller

**Frontend**
- `src/pages/Jars.jsx` — Trang Hũ chi tiêu: tổng quan, PieChart / BarChart phân bổ, danh sách Hũ, xem và quản lý chi tiêu trong từng Hũ (thêm/sửa/xóa trực tiếp từ detail view)
- `src/components/JarForm.jsx` — Form tạo / chỉnh sửa Hũ
- `src/components/JarTransferModal.jsx` — Modal chuyển tiền giữa các Hũ
- `src/components/AddExpenseForm.jsx` — Form thêm chi tiêu (hỗ trợ chọn Hũ)
- `src/components/EditExpenseForm.jsx` — Form sửa chi tiêu (hỗ trợ chọn Hũ)
- `src/components/QuickExpenseTemplates.jsx` — Chi tiêu nhanh tích hợp chọn Hũ (JarPickerModal)

### Mục Tiêu Tiết Kiệm
Tạo mục tiêu với số tiền mục tiêu và thời hạn. Ghi lại các khoản đóng góp. Theo dõi trạng thái ACTIVE / COMPLETED / CANCELLED. Tự động tính khoản đóng góp hàng tháng cần thiết.

**AI Agent integration**: Khi người dùng ở trang Mục Tiêu Tiết Kiệm, Nova Money nhận đầy đủ context của từng mục tiêu (target amount, đã tích lũy, còn thiếu, progress %, cần/tháng, đã đóng tháng này, deadline, trạng thái on-track/behind). AI có thể trả lời *"còn thiếu bao nhiêu?"*, *"khi nào hoàn thành?"* và thực hiện CREATE / UPDATE / DELETE theo ID thực tế.

### Dashboard Widgets
Layout có thể tùy chỉnh drag-and-drop (qua `@dnd-kit`). `MonthlyReportCard` với spending score A–F, phân tích danh mục, tiến trình tiết kiệm. **PREMIUM** có thêm nút AI analysis trong report card — gọi Gemini nhận nhận xét sâu về tình hình tài chính tháng đó.

### Low Performance Mode
Toggle (lưu trong `localStorage`) tắt các animation nặng trên thiết bị yếu. State cung cấp toàn cục qua `PerformanceContext` (`usePerformance()` hook) và apply attribute `data-performance="low"` trên `<html>` để CSS override.

### Xuất Excel
Báo cáo XLSX qua Apache POI. Locale Việt Nam, hàng có màu (xanh = thu nhập, đỏ = chi tiêu), alternating row color, tổng định dạng VND. **Chỉ BASIC+.**

### Báo Cáo Email
Báo cáo Excel gửi dưới dạng email attachment qua Spring Mail (Brevo SMTP). Bao gồm monthly report card với spending score. **Chỉ BASIC+.**

### Xác Thực OTP
OTP 6 chữ số (BCrypt-hashed) để activate tài khoản và reset mật khẩu. Hiệu lực 210 giây, cooldown 180 giây, tối đa 5 lần thử, constant-time comparison.

### Google OAuth2
Đăng nhập bằng Google. Validate Google ID token, tự động tạo profile cho user mới, phát hành JWT.

### Thanh Toán PayOS
Tạo payment link, xử lý webhook, auto-sync trạng thái thanh toán mỗi 30 giây, kích hoạt subscription sau khi thanh toán thành công.

### Spam Protection
Hai lớp bảo vệ:
- **Redis-based**: Đếm email gửi theo account. Trên 5/phút → lock 10 phút. Trên 10 → lock 5 giờ.
- **In-memory rate limiting**: Giới hạn mỗi IP theo endpoint (login: 5/phút, forgot-password: 5/phút, OTP resend: 3/phút, AI chat: 15/phút). Trả về HTTP 429 khi vượt quá.

### File Upload
Ảnh profile upload lên AWS S3. Validate magic bytes (JPEG/PNG/GIF/WebP only).

### PDF Invoice
AWS Lambda tạo PDF invoice sau khi thanh toán thành công.

### Notifications
In-app + email notifications với toggle cho từng loại. Budget alerts, saving goal reminders, payment confirmations.

### Admin Dashboard
Chỉ role `ADMIN`. Quản lý users (CRUD), giám sát payments, quản lý subscriptions, broadcast notifications, thống kê tổng quan.

### Mobile App
React Native (Expo). Bottom tab navigation (Dashboard + Expenses). JWT auth lưu trong AsyncStorage. Pull-to-refresh.

---

## Default Ports

| Service | Port |
|---|---|
| Backend (Spring Boot) | 8080 |
| Frontend (Vite dev) | 5173 |
| MySQL | 3306 |
| Redis | 6379 |

---

## Quick Start

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
