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

Nova Money là trợ lý AI tích hợp sẵn, có hai chế độ hoạt động với model khác nhau tùy theo gói:

```
┌─────────────────────────────────────────┐
│              Nova Money                 │
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
| FREE | Gemini | ❌ Không có |
| BASIC | Gemini | Gemini |
| PREMIUM | GPT-OSS 120B, Gemini | Gemini |

### AI Infrastructure

| Provider | Model | Dùng cho | Plan yêu cầu |
|---|---|---|---|
| Google Gemini | gemini-3.1-flash-lite | Agent mode (intent parsing + execution) | PREMIUM |
| OpenRouter | GPT-OSS 120B | Chat mode | PREMIUM |

**API Key Rotation (Redis cho Gemini)**  
Google Gemini có một pool API key lưu trong Redis. Hệ thống theo dõi quota và trạng thái cooldown từng key. Khi một key vượt quota hoặc lỗi, tự động failover sang key tiếp theo. Các key tự phục hồi sau cooldown. Provider khác (OpenRouter) sử dụng single key.

---

### Agent Mode — Intent → CRUD Pipeline

**Có sẵn từ gói BASIC.** Người dùng nhập lệnh ngôn ngữ tự nhiên → AI parse intent → frontend hiển thị confirmation form → người dùng xác nhận → backend thực thi → undo khả dụng trong vài phút.

**Supported Intents**: `CREATE_EXPENSE`, `UPDATE_EXPENSE`, `DELETE_EXPENSE`, `CREATE_INCOME`, `UPDATE_INCOME`, `DELETE_INCOME`, `CREATE_CATEGORY`, `UPDATE_CATEGORY`, `DELETE_CATEGORY`, `CREATE_BUDGET`, `UPDATE_BUDGET`, `DELETE_BUDGET`, `CREATE_SAVING_GOAL`, `UPDATE_SAVING_GOAL`, `DELETE_SAVING_GOAL`, `EXPORT_EXCEL_INCOME`, `EXPORT_EXCEL_EXPENSE`, `EMAIL_INCOME_REPORT`, `EMAIL_EXPENSE_REPORT`, `ANSWER_QUESTION`, `INVALID_REQUEST`

**Context-aware**: System prompt bao gồm dữ liệu thực tế từ trang hiện tại để AI có thể resolve ID thực tế.

**Undo**: Sau CRUD thành công, backend lưu `operationId`. Frontend hiển thị nút undo; gọi API `/ai/undo/{operationId}` sẽ đảo ngược hành động.

---

### Chat Mode — Q&A Tự Do

**Có sẵn cho tất cả các gói.** Không thực hiện bất kỳ data operation nào. Capabilities:
- Lời khuyên tài chính cá nhân
- Phân tích tâm lý chi tiêu
- Lập kế hoạch mục tiêu dài hạn
Conversation history: 20 tin nhắn cuối được gửi kèm làm context mỗi request.

---

### AI Smart Tips (AI Coach)

**Chỉ PREMIUM.** Phân tích giao dịch 3 tháng gần nhất và trả về mẹo tiết kiệm cá nhân hóa.

### Receipt Import (Gemini)

**Chỉ PREMIUM.** Người dùng upload ảnh/PDF hóa đơn → Gemini trích xuất thông tin → tự động điền vào form tạo chi tiêu.

### Nova Money UI — Widget & Full-page

- **Trang AI Chat Chuyên Biệt** (`/ai-chat`): Giao diện toàn màn hình, thiết kế hiện đại (matching UI reference), responsive, cung cấp không gian trò chuyện rộng rãi với AI.
- **Floating Widget**: Nút góc phải dưới màn hình trên các trang khác. Có **Greeting bubble** hiện lên thông điệp hài hước sau 5 giây.
- **Markdown rendering**: Hỗ trợ table, code block, list, blockquote.
- **Pending Intent Guard**: Khi form xác nhận CRUD đang mở, block nhắn tin tiếp cho đến khi xử lý xong.
- **Model Selector**: Cho phép người dùng PREMIUM linh hoạt chọn model (GPT-OSS, Gemini).

---

## Tính Năng Cốt Lõi

### Quản Lý Thu Nhập & Chi Tiêu
Theo dõi và thao tác CRUD chi tiết cho các khoản thu nhập và chi tiêu:
- **Thu nhập (`/income`)**: Cho phép thêm thu nhập, tự động phân bổ thu nhập thành các phần nhỏ vào các Hũ Chi Tiêu (Jars) dựa trên thiết lập tỷ lệ %.
- **Chi tiêu (`/expense`)**: Ghi nhận chi tiêu, hỗ trợ gán danh mục, upload hóa đơn (OCR) và đặc biệt tích hợp tính năng **Chi Tiêu Nhanh (Templates)** để thao tác 1-click. Khi tạo chi tiêu, người dùng được chọn trực tiếp Hũ trừ tiền.

### Quản Lý Danh Mục (`/category`)
Tạo, sửa, xóa các danh mục thu chi. Phân loại dễ dàng qua hệ thống biểu tượng (Emoji Picker) và màu sắc.

### Bộ Lọc Nâng Cao (`/filter`)
Trang chuyên biệt hỗ trợ tìm kiếm và lọc giao dịch lịch sử theo nhiều chiều (thời gian, loại, danh mục). Giới hạn theo gói: 3 tháng (FREE), 12 tháng (BASIC), Không giới hạn (PREMIUM).

### Báo Cáo Tài Chính (`/reports`)
Trang báo cáo tổng hợp chi tiết theo từng tháng. 
Sử dụng `MonthlyReportCard` với thang điểm tài chính (Spending score A–F), phân tích danh mục qua biểu đồ trực quan, và đo lường tiến trình tiết kiệm. Đặc biệt, người dùng PREMIUM có thể nhấn nút để nhận **AI Analysis** chuyên sâu từ Gemini.

### Dự Báo Tài Chính (`/forecast`)
Dự đoán chi tiêu cho 6 tháng tới (tháng hiện tại + 5 tháng) dựa trên 6 tháng lịch sử. Anomaly detection. AI Insights hiển thị dự báo chi tiết cho tương lai. **Chỉ PREMIUM.**

### Quản Lý Ngân Sách (`/budget`)
Giới hạn chi tiêu hàng tháng cho mỗi danh mục. Theo dõi % sử dụng và cảnh báo khi vượt mức.

### Hệ Thống Các Hũ Chi Tiêu (`/jars`)
Phân bổ thu nhập vào nhiều "ví phụ" riêng biệt theo tỷ lệ phần trăm (Ví sinh hoạt, tiết kiệm, giải trí,...).
- **Hạn mức Hũ**: FREE (1 Hũ), BASIC (6 Hũ), PREMIUM (Không giới hạn). 
- **Phân bổ**: Khi có thu nhập mới, tự động phân bổ tiền vào các Hũ theo tỷ lệ định trước (0-100%).
- **Chuyển tiền**: Cho phép luân chuyển số dư giữa các Hũ.
- **Thanh toán từ Hũ**: Mọi khoản chi tiêu đều có thể được chỉ định trừ tiền từ một Hũ cụ thể.

### Mục Tiêu Tiết Kiệm (`/saving-goals`)
Quản lý mục tiêu (ví dụ: Mua xe, Đi du lịch) với số tiền mong đợi và deadline. Ghi lại các khoản đóng góp và theo dõi tiến độ. Tích hợp AI Agent nhận diện chính xác trạng thái mục tiêu hiện tại.

### Dashboard Tổng Quan (`/dashboard`)
Widgets hỗ trợ kéo thả (`@dnd-kit`), thống kê số dư, chi tiêu gần đây, và truy cập nhanh vào các tính năng.

### Các Tiện Ích & Tuỳ Chọn Khác
- **Low Performance Mode**: Tắt animations trên thiết bị yếu.
- **Xuất Báo Cáo Excel / PDF Invoice**: Báo cáo chi tiêu/thu nhập thành Excel đa sắc thái; hóa đơn PDF cho các lượt thanh toán (AWS Lambda).
- **Báo Cáo Email định kỳ**: Báo cáo gửi qua Spring Mail (Brevo SMTP).
- **Xác Thực OTP & Google OAuth2**: Hỗ trợ đăng nhập qua Google hoặc xác thực 2 bước bằng mã OTP.
- **Thanh Toán PayOS**: Tự động kích hoạt gói Premium ngay khi thanh toán qua mã QR (webhook payload).
- **Spam Protection**: Giới hạn rate limiting bảo vệ API.
- **Admin Dashboard**: Quản lý người dùng, thống kê doanh thu và broadcast thông báo (Dành riêng cho ADMIN).
- **React Native Mobile App**: Ứng dụng điện thoại với Bottom tab navigation, đồng bộ hóa 100% với phiên bản Web.

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
