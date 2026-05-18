# Money Manager

Full-stack personal finance application — Web + Mobile. Supports income/expense tracking, budgets, saving goals, financial forecasting, Excel/email reports, and an embedded AI assistant (Nova Money).

---

## Architecture Overview

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

## Tech Stack

### Backend — `Backend/moneymanager/`

| Category | Technology | Version |
|---|---|---|
| Framework | Spring Boot | 4.0.3 |
| Language | Java | 21 |
| Build | Maven | - |
| Database | MySQL + JPA/Hibernate | - |
| Cache / Key Store | Redis | - |
| Auth | Spring Security + JWT | - |
| Payment | PayOS | - |
| AI — Gemini | Google Gemini API | gemini-2.0-flash-lite |
| AI — Chat | OpenRouter (GPT-OSS 120B) | - |
| Excel | Apache POI | - |
| Email | Spring Mail (Brevo SMTP) | - |
| File Storage | AWS S3 | - |
| PDF Generation | AWS Lambda | - |
| Lombok | Lombok | - |

**Pattern**: `@Controller → @Service → @Repository` + DTO layer

### Frontend — `Frontend/`

| Category | Technology | Version |
|---|---|---|
| Framework | React | 19.2 |
| Build | Vite | 8.0 (beta) |
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

| Category | Technology | Version |
|---|---|---|
| Framework | React Native | 0.79.6 |
| Build Platform | Expo | 53 |
| Navigation | React Navigation (bottom tabs + native stack) | 7 |
| Local Storage | AsyncStorage | 2.1 |
| HTTP | Axios | 1.13 |

---

## Subscription Plans

Three tiers control feature access. Restrictions are enforced **at the backend service layer** — frontend only hides UI elements.

| Feature | FREE | BASIC | PREMIUM |
|---|:---:|:---:|:---:|
| Categories | 10 | 30 | Unlimited |
| Transactions / month | 100 | 1,000 | Unlimited |
| History filter depth | 3 months | 12 months | Unlimited |
| Excel export | ❌ | ✅ | ✅ |
| Email reports | ❌ | ✅ | ✅ |
| Nova Money Chat mode | ✅ | ✅ | ✅ |
| Nova Money Agent mode | ❌ | ✅ | ✅ |
| Receipt import (Gemini Vision) | ❌ | ❌ | ✅ |
| AI Smart Spending Tips | ❌ | ❌ | ✅ |
| Financial Forecasting | ❌ | ❌ | ✅ |

**Backend enforcement points**: `CategoryService.create()`, `ExpenseService.create()`, `IncomeService.create()`, `FilterController`, `ExcelService`, `EmailService`, `ReceiptService`, `AICoachService`, `ForecastService`

**Subscription flow**: User pays via PayOS → webhook `PAID` → backend activates plan on `ProfileEntity` (`subscriptionPlan`, `subscriptionStatus`, `subscriptionActivatedAt`, `subscriptionExpiresAt`, `autoRenew`)

---

## AI Features — Nova Money

### Overview

Nova Money is the embedded AI assistant, accessible from the floating chat button on every authenticated page. It has two operating modes selectable by the user:

```
┌─────────────────────────────────────────┐
│           Nova Money Widget             │
├────────────────────┬────────────────────┤
│   Agent Mode       │   Chat Mode        │
│   (Gemini)         │   (GPT-OSS)        │
│   BASIC+           │   All plans        │
│                    │                    │
│ Intent parsing →   │ Free-form Q&A      │
│ CRUD / export      │ Finance advice     │
│ operations         │ No data changes    │
└────────────────────┴────────────────────┘
```

### AI Infrastructure

| Provider | Model | Used For | Rate Limiting |
|---|---|---|---|
| Google Gemini | gemini-2.0-flash-lite | Agent mode (intent parsing + execution) | Redis key rotation |
| OpenRouter | GPT-OSS 120B | Chat mode (conversation) | Redis key rotation |
| Google Gemini Vision | gemini-2.0-flash-lite | Receipt image analysis | Redis key rotation |

**API Key Rotation (Redis)**  
Each provider has a pool of API keys stored in Redis. The system tracks per-key quota usage and cooldown state. When a key hits its quota or returns an error, it is automatically skipped and the next available key is used. Keys auto-recover after their cooldown period expires.

---

### Agent Mode — Intent → CRUD Pipeline

**Available from BASIC plan.** User types a natural-language command → Gemini parses the intent → frontend shows a confirmation form → user approves → backend executes → undo available for a few minutes.

**Pipeline**:
```
User message
    │
    ▼
POST /ai/parse-intent
(Gemini, system prompt includes current page data)
    │
    ▼
Intent JSON returned
    │
    ├── CRUD / Action intent → show AIConfirmationForm to user
    │       │
    │       ▼  (user confirms)
    │   POST /ai/confirm-action
    │       │
    │       ▼
    │   Backend executes → returns operationId for undo
    │
    └── ANSWER_QUESTION → render answer inline (no confirmation)
```

**Supported intents**:

| Group | Intents |
|---|---|
| Expense | `CREATE_EXPENSE`, `UPDATE_EXPENSE`, `DELETE_EXPENSE` |
| Income | `CREATE_INCOME`, `UPDATE_INCOME`, `DELETE_INCOME` |
| Category | `CREATE_CATEGORY`, `UPDATE_CATEGORY`, `DELETE_CATEGORY` |
| Budget | `CREATE_BUDGET`, `UPDATE_BUDGET`, `DELETE_BUDGET` |
| Saving Goal | `CREATE_SAVING_GOAL`, `UPDATE_SAVING_GOAL`, `DELETE_SAVING_GOAL` |
| Export | `EXPORT_EXCEL_INCOME`, `EXPORT_EXCEL_EXPENSE` |
| Email | `EMAIL_INCOME_REPORT`, `EMAIL_EXPENSE_REPORT` |
| Q&A | `ANSWER_QUESTION` |
| Guard | `INVALID_REQUEST` |

**Context-awareness**: The system prompt includes real data from the user's current page (e.g., their category list when on the Category page) so Gemini can resolve references like "delete the food category" to an actual ID.

**Undo**: After a successful CRUD operation, the backend stores an `operationId`. The frontend shows an undo button; calling `POST /ai/undo/{operationId}` within the allowed window reverses the action.

---

### Chat Mode — Free-form Conversation

**Available to all plans (FREE included).** Uses GPT-OSS 120B via OpenRouter. Does not perform any data operations — pure conversational Q&A.

Capabilities:
- Personal finance advice
- Spending psychology analysis
- Emotional support about money
- Long-term goal planning
- General financial questions

Conversation history: last 20 messages are sent as context on each request.

---

### Smart Spending Tips (AI Coach)

**PREMIUM only.** Analyzes the user's last 3 months of transactions and returns personalized Vietnamese-language saving tips. Powered by Gemini.

---

### Receipt Import (Gemini Vision)

**PREMIUM only.** User uploads a receipt image (≤ 10 MB, JPEG/PNG/WebP) → Gemini Vision extracts merchant name, items, and total amount → auto-populates the create-expense form.

---

### Nova Money Widget — UI Details

The floating chat button sits bottom-right on all authenticated pages.

- **Greeting bubble**: After 5 seconds of inactivity, a speech bubble appears with a random funny message (30 messages in rotation, changes every 20 seconds). Disappears when chat opens.
- **Avatar**: Uses `AI_favicon.png` throughout — floating button, chat header, and per-message avatars.
- **Two-panel layout**: Chat panel supports normal and expanded (800px wide) modes.
- **Markdown rendering**: AI responses support tables, code blocks, lists, blockquotes via `react-markdown` + `remark-gfm` + `rehype-sanitize`.
- **Typing indicator**: Three-dot bounce animation while waiting for response.
- **Pending intent guard**: While a CRUD confirmation form is open, new messages are blocked until the user confirms or cancels.

---

## Other Features

### Financial Forecasting
Predicts next month's spending based on 6 months of history. Detects anomalies (2+ standard deviations from mean). Category-level trend analysis. **PREMIUM only.**

### Budget Management
Monthly spending limits per category. Tracks % used. Alerts when budget is exceeded.

### Saving Goals
Create goals with target amount and deadline. Log contributions. Tracks ACTIVE / COMPLETED / CANCELLED status. Auto-calculates required monthly contribution.

### Dashboard Widgets
Drag-and-drop customizable widget layout (via `@dnd-kit`). Monthly report card with A–F spending grade, category breakdown, savings progress.

### Excel Export
XLSX reports via Apache POI. Vietnamese locale, color-coded rows (green = income, red = expense), alternating row colors, VND-formatted totals. **BASIC+ only.**

### Email Reports
Excel report sent as email attachment via Spring Mail (Brevo SMTP). Includes monthly report card with spending score. **BASIC+ only.**

### OTP Authentication
6-digit OTP (BCrypt-hashed) for account activation and password reset. 210-second validity, 180-second resend cooldown, 5 max attempts, constant-time comparison.

### Google OAuth2
Sign in with Google. Validates Google ID token, auto-creates profile for new users, issues JWT.

### PayOS Payment
Creates payment links, handles webhooks, auto-syncs payment status every 30 seconds, activates subscription on successful payment.

### Spam Protection
Two-layer protection:
- **Redis-based**: Per-account email send counter. Over 5/minute → 10-minute lock. Over 10 → 5-hour lock.
- **In-memory rate limiter**: Per-IP limits per endpoint (login: 5/min, forgot-password: 5/min, resend OTP: 3/min, AI chat: 15/min). Returns HTTP 429 when exceeded.

### File Upload
Profile photos uploaded to AWS S3. Magic bytes validation (JPEG/PNG/GIF/WebP only).

### PDF Invoice
AWS Lambda generates PDF invoice after successful payment.

### Notifications
In-app + email notifications with per-type toggles. Budget alerts, saving goal reminders, payment confirmations.

### Admin Panel
Role `ADMIN` only. User management (CRUD), payment monitoring, subscription management, broadcast notifications, overview statistics.

### Mobile App
React Native (Expo). Bottom tab navigation (Dashboard + Expenses). JWT auth stored in AsyncStorage. Pull-to-refresh.

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
