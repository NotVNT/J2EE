# GitHub Copilot Instructions — Money Manager

---

## 1. Project Overview

**Money Manager** is a full-stack personal finance application with three subscription tiers (FREE, BASIC, PREMIUM). Features include expense/income tracking, budgets, saving goals, financial forecasting, Excel/email reports, and an embedded AI assistant called **Nova Money**.

**Platforms**: Web (React 19 + Vite), Mobile (React Native + Expo), Backend (Spring Boot 4.0.3 / Java 21).

---

## 2. Technology Stack

### Backend — `Backend/moneymanager/`
| Technology | Version / Notes |
|---|---|
| Spring Boot | 4.0.3 |
| Java | 21 |
| Build | Maven |
| Database | MySQL + JPA/Hibernate |
| Cache | Redis (API key rotation, rate limiting, spam protection) |
| Auth | Spring Security + JWT |
| AI — Agent | Google Gemini (gemini-3.1-flash-lite) |
| AI — Chat | OpenRouter (GPT-OSS 120B) |
| Payment | PayOS |
| Excel | Apache POI |
| Email | Spring Mail via Brevo (Sendinblue) SMTP |
| File Storage | AWS S3 |
| PDF | AWS Lambda |

### Frontend — `Frontend/`
| Technology | Version |
|---|---|
| React | 19.2 |
| Vite | 8 (beta) |
| Tailwind CSS | 4.2 |
| React Router | v7 |
| Axios | 1.13 |
| Recharts | 3.8 |
| Lucide React | 0.577 |
| @dnd-kit | 6/10 (drag-and-drop widgets) |
| react-markdown | 10 + remark-gfm + rehype-sanitize |
| react-hot-toast | 2.6 |
| emoji-picker-react | 4.18 |

### Mobile — `Mobile/`
| Technology | Version |
|---|---|
| React Native | 0.79.6 |
| Expo | 53 |
| React Navigation | v7 (bottom tabs + native stack) |
| AsyncStorage | 2.1 |

---

## 3. Subscription Plan Rules — MOST IMPORTANT

**RULE: Backend MUST enforce all plan restrictions. Frontend is UX-only (hide features). Never trust frontend validation alone.**

| Feature | FREE | BASIC | PREMIUM |
|---|:---:|:---:|:---:|
| Categories | 10 | 30 | Unlimited |
| Transactions / month | 100 | 1,000 | Unlimited |
| History filter depth | 3 months | 12 months | Unlimited |
| Excel export | ❌ | ✅ | ✅ |
| Email reports | ❌ | ✅ | ✅ |
| Nova Money Chat mode | ✅ | ✅ | ✅ |
| Nova Money Agent mode | ❌ | ✅ | ✅ |
| Receipt import (Vision) | ❌ | ❌ | ✅ |
| AI Smart Spending Tips | ❌ | ❌ | ✅ |
| Financial Forecasting | ❌ | ❌ | ✅ |

### Backend Enforcement Points
- `CategoryService.create()` — category count limit
- `ExpenseService.create()`, `IncomeService.create()` — monthly transaction limit
- `ExcelService`, `EmailService` — BASIC+ gate
- `FilterController` — date range restriction
- `ReceiptService` — PREMIUM gate
- `AICoachService` — PREMIUM gate
- `ForecastService` — PREMIUM gate

### Error Response for Plan Violations
```json
HTTP 403 Forbidden
{
  "success": false,
  "message": "Feature requires BASIC plan or higher",
  "code": "SUBSCRIPTION_REQUIRED"
}
```

---

## 4. AI Features — Nova Money

### Architecture
Nova Money is an embedded AI assistant accessible via floating chat button on all authenticated pages.

```
User message
    │
    ├─► Agent mode (Gemini, BASIC+)
    │       POST /ai/parse-intent
    │       → Intent JSON + extractedFields
    │       → Show AIConfirmationForm to user
    │       → User confirms: POST /ai/confirm-action
    │       → Backend executes CRUD/export
    │       → Returns operationId for undo
    │
    └─► Chat mode (GPT-OSS 120B, ALL plans)
            POST /ai/chat
            → Conversational reply (no data changes)
```

### Supported Agent Intents
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

### API Key Rotation (Redis)
Both Gemini and OpenRouter providers maintain a pool of API keys in Redis. Per-key quota and cooldown state are tracked. On quota exhaustion or error, the system auto-fails over to the next available key. Keys auto-recover after cooldown.

### Context Awareness
The system prompt for intent parsing includes real page data (category list, recent transactions, budgets, etc.) fetched from the database, so Gemini can resolve references like "delete the food category" to a real entity ID.

### Nova Money Widget — `Frontend/src/components/ChatWidget.jsx`
- Floating button bottom-right, visible on all authenticated pages
- Avatar image: `src/assets/logo/AI_favicon.png` (button, chat header, message bubbles)
- **Greeting bubble**: 30 funny random messages, appears 5s after page load, rotates every 20s, hides when chat opens
- **Pending intent guard**: Blocks new messages while a CRUD confirmation is awaiting user action
- **Expanded mode**: 800px wide full-screen-ish layout
- Markdown rendering via `react-markdown` + `remark-gfm` + `rehype-sanitize`

---

## 5. Data Model

### ProfileEntity (central)
```java
subscriptionPlan: ENUM { FREE, BASIC, PREMIUM }
subscriptionStatus: ENUM { active, expired, cancelled }
subscriptionActivatedAt: LocalDateTime
subscriptionExpiresAt: LocalDateTime
autoRenew: Boolean
```

### Key Entities
- `ExpenseEntity`, `IncomeEntity` — transactions (FK: profileId, categoryId)
- `CategoryEntity` — user-defined with icon + color
- `BudgetEntity` — monthly spending limit per category
- `SavingGoalEntity` + `SavingGoalContributionEntity` — goal tracking
- `PaymentEntity` — PayOS transaction records
- `NotificationEntity` + `NotificationReadEntity` — in-app alerts
- `RoleEntity` — USER, ADMIN

---

## 6. Code Generation Guidelines

### Backend ✅ DO
```java
// Always enforce plan at service layer
ProfileEntity profile = profileService.getCurrentProfile();
if (profile.getSubscriptionPlan() == SubscriptionPlan.FREE) {
    throw new SubscriptionLimitException("Feature requires BASIC plan or higher");
}

// Return DTOs, not entities
@PostMapping("/expenses")
public ResponseEntity<ApiResponse<ExpenseDTO>> create(@Valid @RequestBody ExpenseCreateDTO dto) { ... }

// Explicit types
List<ExpenseEntity> expenses = repository.findByProfileIdOrderByDateDesc(profileId, pageable);
```

### Backend ❌ DON'T
- Return raw Entity in API responses → always use DTO
- Skip plan restriction checks
- Log passwords, tokens, API keys
- Hardcode secrets (use `application.properties` / env vars)

### Frontend ✅ DO
```jsx
// Subscription gate
const { user } = useContext(AppContext);
const isFreePlan = !user?.subscriptionPlan || user?.subscriptionPlan === "FREE";
const isBasicPlus = user?.subscriptionPlan === "BASIC" || user?.subscriptionPlan === "PREMIUM";

// Agent mode gate (BASIC+)
if (provider === "gemini" && isFreePlan) {
    // show upgrade prompt, do not send request
}

// All icons from lucide-react
import { Wallet, Coins, Target } from "lucide-react";
```

### Frontend ❌ DON'T
- Use icon libraries other than lucide-react
- Trust plan checks alone — backend always re-validates
- Import logo from old paths (`devbot.png` deleted, use `AI_favicon.png`)

---

## 7. Assets Reference

| Asset | Path | Usage |
|---|---|---|
| Website favicon | `Frontend/public/favicon.png` | Browser tab icon (`index.html`) |
| App logo | `Frontend/src/assets/logo/favicon.png` | Sidebar, Header, Login, Signup, LandingPage, AccountActivation |
| AI avatar | `Frontend/src/assets/logo/AI_favicon.png` | ChatWidget button, header, message bubbles |

> `favicon.svg` and `devbot.png` are **deleted**. Do not reference them.

---

## 8. Security Rules

- Never trust frontend-only validation — backend enforces everything
- HTTP 403 for plan violations, HTTP 401 for auth failures, HTTP 429 for rate limit
- Validate PayOS webhook signatures before processing
- Secrets via environment variables only — never hardcode
- BCrypt for passwords, constant-time OTP comparison
- Rate limiting: 15 AI requests/min per IP; Redis per-account email spam protection (>5/min → 10min lock, >10 → 5hr lock)

---

## 9. Common Error Codes

| Code | HTTP | Meaning |
|---|---|---|
| `SUBSCRIPTION_REQUIRED` | 403 | Feature needs higher plan |
| `LIMIT_EXCEEDED` | 400 | Monthly or category limit hit |
| `UNAUTHORIZED` | 401 | JWT invalid or expired |
| `INVALID_INPUT` | 400 | Validation failed |
| `PAYMENT_FAILED` | 400 | PayOS error |
| `RESOURCE_NOT_FOUND` | 404 | Entity not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## 10. Development Commands

```bash
# Backend (port 8080)
cd Backend/moneymanager && mvn spring-boot:run

# Frontend (port 5173)
cd Frontend && npm install && npm run dev

# Mobile
cd Mobile && npm install && npm start
```

---

**Last Updated**: 2026-05-18  
**Version**: 2.0
