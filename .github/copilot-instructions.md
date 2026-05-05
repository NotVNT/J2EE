# GitHub Copilot Instructions

This file provides guidance to GitHub Copilot when working with code in this repository.

---

## Quick Reference

- **Project Type**: Full-stack financial management application
- **Backend**: Spring Boot 4.0.3 (Java 21, Maven)
- **Frontend**: React 19.2.0 + Vite 8.0
- **Mobile**: React Native 0.79.6 + Expo 53.0.12
- **Database**: MySQL 8.0+
- **Auth**: JWT-based stateless authentication
- **Key Services**: PayOS (payments), Gemini (AI), Brevo (email)

---

## Project Structure

```
MoneyManager/
├── .claude/                 # Claude Code configurations
├── .github/                 # GitHub configurations
├── Backend/moneymanager/    # Spring Boot REST API
├── Frontend/                # React + Vite web app
├── Mobile/                  # React Native + Expo app
├── Dockerfile               # Docker build
├── .env.example             # Environment template
├── .gitignore               # Git ignore rules
└── CLAUDE.md, COPILOT.md    # AI assistant guides
```

---

## Core Principles

### 1. **Subscription-Driven Architecture**

Three-tier model enforced at the service layer:

| Plan | Categories | Tx/Month | History | Features |
|------|-----------|----------|---------|----------|
| **FREE** | 10 | 100 | 3 months | Basic tracking |
| **BASIC** | 30 | 1000 | 12 months | Excel export |
| **PREMIUM** | Unlimited | Unlimited | Unlimited | Receipt AI import |

**Always validate**: Before allowing restricted operations, call `SubscriptionService.ensureCan*()`:
```java
subscriptionService.ensureCanCreateCategory(profile);
subscriptionService.ensureCanCreateTransaction(profile);
subscriptionService.ensureCanExport(profile);
subscriptionService.ensureCanImportReceipt(profile);
```

### 2. **Stateless JWT Authentication**

- **Token Format**: `Authorization: Bearer {token}`
- **Signing**: HMAC SHA-512 with `JWT_SECRET`
- **Generation**: `JwtUtil` class
- **Validation**: `JwtRequestFilter` in Spring Security chain
- **Storage**: localStorage/sessionStorage (Frontend), AsyncStorage (Mobile)

**Public Endpoints** (no JWT required):
```
/status, /health
/register, /activate
/login
/forgot-password, /reset-password
/gemini/test
/payments/payos/webhook
```

### 3. **Service Layer Abstraction**

External integrations are abstracted via services:
- **PaymentService**: PayOS payment gateway
- **GeminiService**: Google Gemini AI (chat, receipt analysis)
- **EmailService**: Brevo SMTP relay

Never call external APIs directly from controllers.

---

## Backend Development

### Package Structure

```java
src/main/java/com/example/moneymanager/
├── config/        // Spring Security, CORS, PayOS, Gemini configs
├── controller/    // REST endpoints (11+ controllers)
├── service/       // Business logic (22+ services)
├── entity/        // JPA entities
├── dto/           // API contracts
├── repository/    // Spring Data JPA
├── security/      // JwtUtil, JwtRequestFilter
└── util/          // Helper utilities
```

### Key Patterns

**Subscription Validation**:
```java
@PostMapping("/create-category")
public ResponseEntity<?> createCategory(@RequestBody CategoryDTO dto, @AuthenticationPrincipal UserDetails user) {
    ProfileEntity profile = getProfileFromUser(user);
    subscriptionService.ensureCanCreateCategory(profile);  // ← Always validate first
    // ... proceed
}
```

**DTO for API Contracts**:
```java
// Never expose entities directly in responses
// Always convert: Entity → DTO before sending
```

**Error Handling**:
```java
try {
    // operation
} catch (SubscriptionException e) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(Map.of("error", "Upgrade required", "plan", "PREMIUM"));
} catch (Exception e) {
    logger.error("Unexpected error", e);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
}
```

### Build & Run

```bash
cd Backend/moneymanager

# Build
mvn clean package

# Run (requires .env)
mvn spring-boot:run

# Test
mvn test
mvn test -Dtest=ClassName#methodName

# Docker
docker build -t moneymanager-backend .
docker run -p 8080:8080 --env-file .env moneymanager-backend
```

**API Base**: `http://localhost:8080/api/v1.0`

---

## Frontend Development

### Tech Stack
- **React**: 19.2.0
- **Vite**: 8.0 (code splitting, fast HMR)
- **React Router**: 7.13.1
- **Tailwind CSS**: 4.2.1
- **Axios**: HTTP client with JWT interceptor
- **Recharts**: Data visualization

### Route Structure

**Public Routes** (no auth):
- `/` - Home
- `/login` - User login
- `/signup` - Registration
- `/forgot-password` - Password reset
- `/account-activation` - Email verification

**Protected Routes** (JWT required):
- `/dashboard` - Financial overview
- `/income` - Income tracking
- `/expense` - Expense tracking
- `/budget` - Budget management
- `/categories` - Category management
- `/saving-goals` - Saving goals
- `/profile` - User profile
- `/payment` - Subscription upgrade

### Key Components

**HTTP Client** (`util/axiosConfig.jsx`):
```javascript
// Automatically attaches JWT token to all requests
// Handles 401 responses by redirecting to login
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1.0'
});
```

**Global State** (`context/AppContext.jsx`):
```javascript
{
  profile: { id, username, email, subscriptionPlan, subscriptionStatus },
  isAuthenticated: boolean,
  loading: boolean,
  error: string | null
}
```

**Component Pattern**:
```jsx
function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    axiosInstance.get('/expenses')
      .then(res => setExpenses(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) return <div>Loading...</div>;
  return (/* render */);
}
```

### Build & Run

```bash
cd Frontend

# Install dependencies
npm install

# Dev server (port 3000)
npm run dev

# Production build
npm run build

# Lint
npm run lint
```

---

## Mobile Development

### Tech Stack
- **React Native**: 0.79.6
- **Expo**: 53.0.12
- **React Navigation**: 7.x
- **AsyncStorage**: 2.1.2
- **Axios**: HTTP client

### Navigation Structure

```
AuthContext
├── unauthenticated → AuthStack
│   └── LoginScreen
└── authenticated → BottomTabs
    ├── Dashboard
    ├── Expense
    └── Profile
```

### Token Management

**AsyncStorage** (`storage/tokenStorage.js`):
```javascript
const saveToken = async (token) => {
  await AsyncStorage.setItem('AUTH_TOKEN', token);
};

const loadToken = async () => {
  return await AsyncStorage.getItem('AUTH_TOKEN');
};

const removeToken = async () => {
  await AsyncStorage.removeItem('AUTH_TOKEN');
};
```

**HTTP Service** (`services/http.js`):
```javascript
// Automatically attaches token from AsyncStorage
// Handles 401 by redirecting to LoginScreen
const httpInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL
});
```

### Platform-Specific API URLs

```env
# .env
# Android Emulator
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8080/api/v1.0

# iOS Simulator
# EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1.0

# Physical Device (replace with your machine IP)
# EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8080/api/v1.0
```

### Build & Run

```bash
cd Mobile

npm install

# Expo dev server
npm start

# Android emulator
npm run android

# iOS simulator
npm run ios

# Web version
npm run web
```

---

## Database Schema

### Entity Relationships

```
ProfileEntity (1) → (many)
├── ExpenseEntity
├── IncomeEntity
├── BudgetEntity
├── CategoryEntity
├── SavingGoalEntity
└── PaymentEntity

CategoryEntity (1) → (many)
├── ExpenseEntity
├── IncomeEntity
└── BudgetEntity

SavingGoalEntity (1) → (many) SavingGoalContributionEntity
```

### Key Entities

**ProfileEntity** - User account and subscription:
- `id`, `username`, `email`, `passwordHash`
- `subscriptionPlan` (FREE, BASIC, PREMIUM)
- `subscriptionStatus` (INACTIVE, ACTIVE, EXPIRED)
- `subscriptionActivatedAt`, `subscriptionExpiresAt`
- `autoRenew`, `createdAt`, `updatedAt`

**ExpenseEntity** - Individual transaction:
- `id`, `profile`, `category`
- `amount`, `currency`, `description`
- `date`, `createdAt`, `updatedAt`

**CategoryEntity** - Expense/Income category:
- `id`, `profile`, `name`, `type` (EXPENSE/INCOME)
- `emoji`, `color`, `createdAt`, `updatedAt`

**PaymentEntity** - PayOS transaction:
- `id`, `profile`, `orderId`, `planType`
- `amount`, `currency`, `status` (PENDING/PAID/FAILED/CANCELLED)
- `createdAt`, `updatedAt`, `paidAt`

### Performance Optimization

- **Connection Pool**: HikariCP (2-10 connections, 5-min idle timeout)
- **Batch Size**: 30 (Hibernate)
- **Fetch Size**: 100
- **Indexes**: (profile_id, date), (category_id), unique(orderId)
- **N+1 Prevention**: Use `@Fetch(FetchMode.JOIN)` or custom `JOIN FETCH` queries

---

## Environment Variables

### Backend (.env at project root or Backend/moneymanager/.env)

```env
# Database
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/moneymanager
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=password

# Server
SERVER_PORT=8080
MONEY_MANAGER_FRONTEND_URL=http://localhost:3000

# Security
JWT_SECRET=your-secret-key-here

# Email (Brevo SMTP - uses port 2525 for Render free tier)
BREVO_USERNAME=...
BREVO_PASSWORD=...
BREVO_FROM_EMAIL=...

# Payment (PayOS - Vietnamese gateway)
PAYOS_CLIENT_ID=...
PAYOS_API_KEY=...
PAYOS_CHECKSUM_KEY=...
PAYOS_RETURN_URL=http://localhost:3000/payment/success
PAYOS_CANCEL_URL=http://localhost:3000/payment/cancel
PAYOS_WEBHOOK_URL=https://your-domain.com/api/v1.0/payments/payos/webhook

# AI (Google Gemini)
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
```

### Frontend (.env.local or Frontend/.env)

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1.0
```

### Mobile (Mobile/.env)

```env
# Android Emulator
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8080/api/v1.0
```

---

## Security Checklist

- [ ] JWT validation on all protected endpoints
- [ ] Subscription checks before restricted operations
- [ ] Input validation on all endpoints
- [ ] No hardcoded secrets (use `.env`)
- [ ] Parameterized queries (prevent SQL injection)
- [ ] XSS prevention (proper escaping in React)
- [ ] CORS properly configured
- [ ] Error messages don't expose internals
- [ ] Secure token storage (AsyncStorage, localStorage)
- [ ] HTTPS in production

---

## AI Features (Gemini)

**PREMIUM-only** feature. Always validate:

```java
subscriptionService.ensureCanImportReceipt(profile);  // Gate the feature
```

### Chat Endpoint
- `POST /gemini/chat` - Financial advice chatbot
- Returns: `{ response: string, timestamp: ISO8601 }`

### Receipt Analysis
- `POST /gemini/analyze-receipt` - OCR receipt image
- Input: `{ imageBase64: string }`
- Returns:
  ```json
  {
    "amount": 150000,
    "currency": "VND",
    "date": "2024-05-05",
    "vendor": "Coffee Shop",
    "category": "Food & Dining",
    "description": "Morning coffee",
    "confidence": 0.95
  }
  ```

---

## Payment System (PayOS)

### Payment Flow

```
User clicks "Upgrade" 
  ↓
POST /payments/create { planType: "BASIC" }
  ↓
Backend returns { paymentLink: "https://payos.vn/..." }
  ↓
Frontend redirects to PayOS
  ↓
User completes payment
  ↓
PayOS webhook POST /payments/payos/webhook
  ↓
Backend validates signature & updates subscription
  ↓
Frontend redirected to /payment/success
```

### Webhook Security

Always validate PayOS webhook signature:
```java
boolean isValid = paymentService.validateWebhookSignature(payload);
if (!isValid) throw new SecurityException("Invalid signature");
```

---

## Code Quality Standards

### General
- Follow SOLID principles
- Clean Code practices
- Design patterns where appropriate
- Comprehensive error handling
- Meaningful error messages
- Comments for complex logic

### Backend (Java/Spring Boot)
- DTO layer for API contracts
- Service layer abstraction
- Repository pattern for data access
- Transaction management
- Subscription validation before operations

### Frontend (React)
- Component composition
- Custom hooks for logic reuse
- Proper state management
- Error boundaries
- Loading and error states
- Accessibility (ARIA labels, keyboard nav)

### Mobile (React Native)
- Platform-specific considerations
- Proper navigation structure
- AsyncStorage for persistence
- Error handling for network requests
- Resource cleanup (prevent memory leaks)

---

## Deployment

### Docker

Multi-stage build targeting 500MB RAM (Render free tier):

```bash
# Build
docker build -t moneymanager-backend .

# Run
docker run -p 8080:8080 --env-file .env moneymanager-backend
```

### Environment Variables in Production

Generate strong JWT_SECRET:
```bash
openssl rand -base64 32
```

Never commit `.env` — use environment variables in deployment platform.

### Health Check

```
GET /health      # Health check
GET /status      # API status
```

---

## Useful References

- **Project Rules**: See `.claude/rules/` for detailed documentation
- **Backend Architecture**: `.claude/rules/backend-architecture.md`
- **Frontend Architecture**: `.claude/rules/frontend-architecture.md`
- **Mobile Architecture**: `.claude/rules/mobile-architecture.md`
- **Subscription System**: `.claude/rules/subscription-system.md`
- **Authentication**: `.claude/rules/authentication-security.md`
- **Database**: `.claude/rules/database-schema.md`
- **Deployment**: `.claude/rules/deployment.md`
- **Tech Stack**: `.claude/rules/tech-stack.md`

---

## Global Rules

- Reference `.claude/instructions/global-rules.md` for strict guidelines
- Always verify with official documentation
- Avoid fabricating information or non-existent APIs
- Direct and concise responses
- Handle missing information with ONE clarifying question
- Never commit secrets or credentials
- Prioritize security and performance
- Follow project conventions over personal preferences

---

**Last Updated**: May 5, 2026  
**For**: GitHub Copilot assistance in this repository
