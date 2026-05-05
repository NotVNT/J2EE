# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fullstack financial management application with three sub-projects sharing one backend:
- **Backend**: Spring Boot REST API (Java 21, Maven)
- **Frontend**: React + Vite web application
- **Mobile**: React Native + Expo application

## Build & Run Commands

### Backend

```bash
cd Backend/moneymanager
mvn clean package          # build JAR
mvn spring-boot:run        # run locally (requires .env)
mvn test                   # run all tests
mvn test -Dtest=ClassName#methodName   # run single test
```

API base: `http://localhost:8080/api/v1.0`

Docker (from project root):
```bash
docker build -t moneymanager-backend .
docker run -p 8080:8080 --env-file .env moneymanager-backend
```

### Frontend

```bash
cd Frontend
npm install
npm run dev      # dev server (port 3000)
npm run build    # production build
npm run lint
```

### Mobile

```bash
cd Mobile
npm install
npm start          # Expo dev server
npm run android    # Android emulator
npm run ios        # iOS simulator
npm run web
```

## Environment Variables

**Backend** (`.env` at project root or `Backend/moneymanager/.env`):
```
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/moneymanager
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=password
SERVER_PORT=8080
JWT_SECRET=your-secret-key
MONEY_MANAGER_FRONTEND_URL=http://localhost:3000
BREVO_USERNAME=...         # Brevo SMTP relay
BREVO_PASSWORD=...
BREVO_FROM_EMAIL=...
PAYOS_CLIENT_ID=...        # Vietnamese payment gateway
PAYOS_API_KEY=...
PAYOS_CHECKSUM_KEY=...
PAYOS_RETURN_URL=http://localhost:3000/payment/success
PAYOS_CANCEL_URL=http://localhost:3000/payment/cancel
PAYOS_WEBHOOK_URL=https://your-domain.com/api/v1.0/payments/payos/webhook
GEMINI_API_KEY=...         # Google Gemini AI
GEMINI_MODEL=gemini-2.5-flash
```

**Mobile** (`Mobile/.env`):
```
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8080/api/v1.0   # Android emulator
# EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1.0  # iOS simulator
# EXPO_PUBLIC_API_BASE_URL=http://<local-ip>:8080/api/v1.0 # Physical device
```

## Architecture

### Backend Package Structure

```
src/main/java/com/example/moneymanager/
├── config/        Spring Security, CORS, PayOS, Gemini configs
├── controller/    REST endpoints (11+ controllers)
├── service/       Business logic (22+ services)
├── entity/        JPA entities
├── dto/           API request/response contracts
├── repository/    Spring Data JPA repositories
├── security/      JwtUtil + JwtRequestFilter
└── util/          Helpers
```

### Subscription System

Three-tier plan model enforced at the service layer:
- **FREE** (default): 10 categories, 100 tx/month, 3-month history
- **BASIC**: 30 categories, 1000 tx/month, 12-month history, Excel export
- **PREMIUM**: Unlimited + receipt import via AI

`SubscriptionService` is the enforcement point — call its `ensureCan*()` methods before any restricted operation:
- `ensureCanCreateCategory(profile)`
- `ensureCanCreateTransaction(profile)`
- `ensureCanExport(profile)`
- `ensureCanImportReceipt(profile)`

To add a new gated feature: add a field to `PlanFeatures` inner class, update `getPlanFeatures()` switch statement, add a new `ensureCan*()` method, then call it in the relevant controller.

`ProfileEntity` stores subscription state: `subscriptionPlan`, `subscriptionStatus` (INACTIVE/ACTIVE/EXPIRED), `subscriptionActivatedAt`, `subscriptionExpiresAt`, `autoRenew`.

### Authentication

- Backend: stateless JWT — `JwtUtil` generates/validates tokens, `JwtRequestFilter` extracts from `Authorization: Bearer` header
- Frontend: token in localStorage/sessionStorage; Axios interceptor in `util/axiosConfig.jsx` attaches it automatically
- Mobile: token in AsyncStorage; `services/http.js` Axios instance attaches it; `AuthContext` manages login state

### Public Endpoints (no JWT required)

```
/status, /health
/register, /activate
/login
/forgot-password, /reset-password
/gemini/test
/payments/payos/webhook
```

### Payment Flow (PayOS)

`PaymentController` → `PaymentService.createPayment()` → generates PayOS payment link.  
Webhook at `/payments/payos/webhook` receives PAID status → updates `PaymentEntity` → activates subscription on `ProfileEntity`.

### AI Features (Gemini)

`GeminiService` / `GeminiController`: chat endpoint for financial advice and receipt image analysis. PREMIUM only — guarded by `ensureCanImportReceipt()`.

### Email

`EmailService` via Brevo SMTP relay (port 2525 — Render free tier blocks 587/465). Sends: account activation, password reset, Excel report exports.

### Frontend Routing

React Router v7 with Vite code splitting:
- Public: Home, Login, Signup, ForgotPassword, AccountActivation
- Protected: Dashboard, Income, Expense, Budget, Categories, Profile, Settings
- Admin: AdminDashboard, AdminPayments, AdminSubscription, AdminSettings

Global state via `AppContext` (profile + subscription info).

### Mobile Navigation

```
AuthContext (AsyncStorage token)
  ├── unauthenticated → AuthStack (Login screen)
  └── authenticated   → BottomTabs (Dashboard, Expense, …)
```

### Database Entities

- `ProfileEntity` (1) → (many) `ExpenseEntity`, `IncomeEntity`, `BudgetEntity`, `CategoryEntity`, `SavingGoalEntity`
- `CategoryEntity` (1) → (many) `ExpenseEntity`, `IncomeEntity`, `BudgetEntity`
- `SavingGoalEntity` (1) → (many) `SavingGoalContributionEntity`
- `PaymentEntity` → links to `ProfileEntity`, tracks PayOS transactions

HikariCP pool: 2–10 connections, 5-min idle timeout. Hibernate batch size: 30, fetch size: 100.

### Docker / Deployment

Multi-stage build targeting 500MB RAM (Render free tier):
- Stage 1: `maven:3.9-eclipse-temurin-21` builds the JAR
- Stage 2: `eclipse-temurin:21-jre-alpine` runs it with `JAVA_OPTS="-XX:TieredStopAtLevel=1 -XX:+UseSerialGC -Xmx350m -XX:CICompilerCount=2"`

## Tech Stack

| Layer | Tech | Version |
|-------|------|---------|
| Backend | Spring Boot | 4.0.3 |
| | Java | 21 |
| | Database | MySQL |
| | JWT | JJWT 0.11.5 |
| | Payment | PayOS SDK 2.0.1 |
| Frontend | React | 19.2.0 |
| | Vite | 8.0 beta |
| | Tailwind CSS | 4.2.1 |
| | React Router | 7.13.1 |
| | Recharts | 3.8.0 |
| Mobile | React Native | 0.79.6 |
| | Expo | 53.0.12 |
| | React Navigation | 7.x |
| | AsyncStorage | 2.1.2 |
