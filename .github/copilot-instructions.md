---
title: "GitHub Copilot Instructions for Money Manager"
category: "Development"
applyTo: "**"
---

# GitHub Copilot Instructions

This file provides GitHub Copilot with project-specific guidance for intelligent code suggestions across the Money Manager codebase.

## Project Quick Reference

**Money Manager**: Full-stack financial management app with 3 subscription tiers (FREE/BASIC/PREMIUM)

**Tech Stack**:
- Backend: Spring Boot 4.0.3, Java 21, Maven, MySQL, JPA/Hibernate
- Frontend: React 19, Vite, Tailwind CSS 4.x, React Router v7, Axios
- Mobile: React Native 0.79, Expo 53, AsyncStorage
- Auth: JWT with Spring Security
- Payments: PayOS
- AI: Google Gemini API

## Code Generation Guidelines

### Backend Code Suggestions

**Always Include**:
1. Type declarations (use Java generics)
2. Try-catch error handling
3. Input validation at controller level
4. Subscription plan checks in service methods
5. DTO usage for API responses
6. Meaningful error messages

**Pattern - Subscription Enforcement**:
```java
@Service
public class ExpenseService {
    public Expense createExpense(Expense expense, Long userId) {
        Profile profile = profileService.getById(userId);
        
        // Check subscription limit
        int monthlyCount = expenseRepository.countByProfileAndMonth(profile, YearMonth.now());
        int limit = getMonthlyLimit(profile.getSubscriptionPlan());
        
        if (monthlyCount >= limit) {
            throw new SubscriptionLimitException(
                "Monthly limit of " + limit + " reached for " + profile.getSubscriptionPlan()
            );
        }
        
        return expenseRepository.save(expense);
    }
}
```

**Pattern - API Response with Error Handling**:
```java
@PostMapping("/expenses")
public ResponseEntity<?> createExpense(@RequestBody ExpenseDTO dto) {
    try {
        Expense expense = expenseService.createExpense(dto.toEntity(), getCurrentUserId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Expense created", expense));
    } catch (SubscriptionLimitException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(new ApiResponse<>(false, e.getMessage(), "LIMIT_EXCEEDED"));
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ApiResponse<>(false, "Invalid input", "INVALID_INPUT"));
    }
}
```

### Frontend Code Suggestions

**Always Include**:
1. Type safety (use TypeScript or PropTypes)
2. Subscription status checks
3. Error handling
4. Loading states
5. Proper hooks usage (useMemo, useCallback, useContext)
6. Debouncing for user interactions

**Pattern - Feature Gating**:
```jsx
function ExcelExportButton() {
    const { subscriptionPlan } = useContext(AppContext);
    
    if (subscriptionPlan === "FREE") {
        return (
            <Tooltip title="Available in BASIC plan or higher">
                <button disabled className="opacity-50 cursor-not-allowed">
                    Export to Excel
                </button>
            </Tooltip>
        );
    }
    
    return <button onClick={handleExport} className="btn-primary">Export</button>;
}
```

**Pattern - API Error Handling**:
```jsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handleExport = async () => {
    setLoading(true);
    setError(null);
    try {
        const data = await apiClient.post('/api/export/excel');
        downloadFile(data);
    } catch (err) {
        if (err.response?.status === 403) {
            setError("This feature requires BASIC plan or higher");
        } else {
            setError(err.response?.data?.message || "Export failed");
        }
    } finally {
        setLoading(false);
    }
};
```

### Mobile Code Suggestions

**Always Include**:
1. Network state awareness
2. AsyncStorage for persistence
3. Error boundaries
4. Loading states
5. Offline handling
6. Proper navigation

**Pattern - Offline-First Transaction**:
```javascript
export const addExpense = async (expense) => {
    try {
        // Save locally first
        const stored = await AsyncStorage.getItem('pendingExpenses');
        const pending = stored ? JSON.parse(stored) : [];
        pending.push({ ...expense, synced: false, id: Date.now() });
        await AsyncStorage.setItem('pendingExpenses', JSON.stringify(pending));
        
        // Try to sync
        if (isOnline) {
            await apiClient.post('/api/expenses', expense);
            // Mark as synced
        }
        return true;
    } catch (error) {
        console.error('Failed to add expense:', error);
        return false;
    }
};
```

## Subscription Tier Enforcement Points

### Critical Backend Service Methods
- `CategoryService.create()` — Validate against category limit (10/30/unlimited)
- `ExpenseService.create()`, `IncomeService.create()` — Validate monthly transaction count (100/1000/unlimited)
- `ExcelService.generateReport()` — Require BASIC or PREMIUM tier
- `EmailService.sendReport()` — Require BASIC or PREMIUM tier
- `FilterController.getTransactions()` — Restrict date range by plan (3/12/unlimited months)

### Frontend Components to Hide/Disable
- Excel export button (FREE tier only)
- Email report scheduling (FREE tier only)
- Advanced analytics (FREE tier only)
- Category creation beyond limit (show upgrade message)
- Transaction creation when limit reached (show warning)

### Expected Error Responses
```json
{
  "success": false,
  "message": "Feature requires BASIC plan",
  "code": "SUBSCRIPTION_REQUIRED",
  "timestamp": "2026-05-06T10:30:00Z"
}
```
**Status Code**: 403 Forbidden for plan violations

## Subscription Tier Limits Reference

| Plan | Categories | Monthly Transactions | History Depth | Excel Export | Email Reports |
|------|-----------|----------------------|----------------|--------------|---------------|
| FREE | 10 | 100 | 3 months | ❌ | ❌ |
| BASIC | 30 | 1,000 | 12 months | ✅ | ✅ |
| PREMIUM | Unlimited | Unlimited | Unlimited months | ✅ | ✅ |

## File Organization Reference

### Backend File Locations & Responsibilities
- `src/main/java/com/moneymanager/entity/ProfileEntity.java` — Central user entity with subscription fields (subscriptionPlan, subscriptionStatus, subscriptionActivatedAt, subscriptionExpiresAt, autoRenew)
- `src/main/java/com/moneymanager/entity/ExpenseEntity.java`, `IncomeEntity.java` — Transaction entities
- `src/main/java/com/moneymanager/service/CategoryService.java` — Category operations with plan limits
- `src/main/java/com/moneymanager/service/ExpenseService.java` — Expense handling with monthly limit checks
- `src/main/java/com/moneymanager/service/ExcelService.java` — Excel export (BASIC+ only)
- `src/main/java/com/moneymanager/controller/PaymentController.java` — PayOS payment processing
- `src/main/java/com/moneymanager/security/JwtAuthenticationFilter.java` — JWT token validation
- `pom.xml` — Maven dependencies and Spring Boot 4.0.3 configuration

### Frontend File Locations & Responsibilities
- `src/context/AppContext.jsx` — Global app state with user and subscription info
- `src/components/Dashboard.jsx` — Main dashboard with spending analytics
- `src/pages/Payment.jsx` — Subscription upgrade and payment management
- `src/pages/Expense.jsx`, `Income.jsx` — Transaction management pages
- `src/pages/Category.jsx` — Category management with limit enforcement
- `src/util/apiEndpoints.js` — Centralized API endpoint configuration
- `src/util/paymentPlans.js` — Subscription tier data and limits
- `src/services/axiosConfig.jsx` — Axios instance with JWT handling
- `package.json` — React 19, Vite, Tailwind CSS 4.x dependencies

### Mobile File Locations & Responsibilities
- `src/services/api.js` — API client with JWT token handling and interceptors
- `src/storage/transactionStorage.js` — AsyncStorage utilities for local transaction caching
- `src/context/AppContext.js` — Global app state for user and subscription
- `src/screens/PaymentScreen.js` — Payment processing and subscription upgrade
- `src/screens/ExpenseScreen.js`, `IncomeScreen.js` — Transaction entry screens
- `src/navigation/RootStack.js` — Navigation structure with bottom tabs
- `app.json` — Expo configuration with React Native 0.79

## Entity Model - Key Relationships

### ProfileEntity (Central User Entity)
- `id` (UUID/Long)
- `username`, `email` (unique)
- `subscriptionPlan` (ENUM: FREE, BASIC, PREMIUM)
- `subscriptionStatus` (ENUM: active, expired, cancelled)
- `subscriptionActivatedAt`, `subscriptionExpiresAt` (LocalDateTime)
- `autoRenew` (Boolean)
- **Relations**: 1-to-Many with Category, Expense, Income, Budget, SavingGoal, Payment, Notification

### ExpenseEntity / IncomeEntity
- `id`, `profileId` (FK), `categoryId` (FK)
- `amount` (BigDecimal), `description`, `date` (LocalDate)
- `receipt` (URL, optional for Expense)
- `source` (optional for Income)
- **Must enforce**: Monthly transaction limits at service layer

### CategoryEntity
- `id`, `profileId` (FK)
- `name`, `type` (ENUM: EXPENSE or INCOME)
- `icon` (emoji), `color` (hex)
- **Must enforce**: Category count limits at service layer

### Supporting Entities
- `BudgetEntity` — Monthly budget allocation per category
- `SavingGoalEntity` + `SavingGoalContributionEntity` — Saving goals with contributions
- `PaymentEntity` — PayOS transaction records
- `NotificationEntity` + `NotificationReadEntity` — User notifications
- `RoleEntity` — User roles (USER, ADMIN)

## External API Integrations

### PayOS Payment Processing
- **Create Payment Link**: `POST /api/payment/create-link`
- **Webhook Handler**: `POST /api/payment/webhook`
- **Key Class**: `PaymentService`, `PaymentController`
- **Action**: Verify webhook signature, update ProfileEntity subscription status
- **Store**: Payment details in `PaymentEntity`

### Google Gemini API (Receipt Analysis)
- **Service**: `ReceiptAnalysisService`
- **Called From**: `ExpenseService.createFromReceipt()`
- **Task**: Extract merchant, amount, date from receipt images
- **Handling**: Rate limit with exponential backoff, fallback to manual entry
- **Restriction**: Consider limiting to BASIC+ tiers to manage API costs

### MySQL & JPA/Hibernate Database
- **Indexes**: Must have on `profile_id`, `transaction_date`, `category_id`
- **Pagination**: Implement on transaction lists (default 20-50 items per page)
- **Soft Deletes**: Use for audit trails where applicable
- **Query Optimization**: Use JPA projections for read-heavy queries
- **Connection Pool**: HikariCP configuration in application.properties

## Architecture Patterns & Best Practices

### Backend (Spring Boot)
```
Controller → Service → Repository → Entity
     ↓         ↓         ↓
  DTO      Plan Check   JPA
          Validation
```

### Frontend (React + Vite)
- Lazy load pages with React.lazy() and Suspense
- Memoize expensive computations with useMemo()
- Use React.memo() for pure components
- Debounce search/filter inputs (300-500ms)
- Check subscription status before rendering features

### Mobile (React Native + Expo)
- Offline-first: save to AsyncStorage immediately
- Queue operations when offline
- Batch sync when reconnecting
- Handle conflicts gracefully
- Show sync status to user

## Security Checklist for Code Suggestions

When generating code, ensure:
- ✅ **Always enforce subscription at backend service layer** - never rely on frontend
- ✅ Validate all user inputs (controller/request handler level)
- ✅ Use HTTP 403 status for plan violations
- ✅ Hash passwords with BCrypt
- ✅ Validate JWT token on every protected endpoint
- ✅ Verify PayOS webhook signatures before processing
- ✅ Never expose system internals in error messages
- ✅ Don't log sensitive data (passwords, credit cards, tokens)
- ✅ Use parameterized queries (JPA handles this automatically)
- ✅ Implement rate limiting on payment endpoints
- ✅ Store API keys in environment variables only

## Performance Optimization Suggestions

**When to suggest pagination**:
- Transaction lists (100+ records expected)
- Category lists, budget lists
- Notification history

**When to suggest memoization (Frontend)**:
- Dashboard calculations
- Expensive chart data processing
- User preference computations

**When to suggest caching (Backend)**:
- Subscription status during request
- User profile on login
- Category lists (per user)

**When to suggest database optimization**:
- Transaction queries taking >500ms
- Monthly aggregation queries
- Report generation

**When to suggest lazy loading**:
- React Router pages not in initial route
- Heavy components below the fold
- Chart libraries

## Testing Scenarios to Suggest

When generating test code, include tests for:
1. **FREE tier attempting premium feature** → Returns 403, shows correct error
2. **Monthly transaction limit exceeded** → Rejects with "limit exceeded" message
3. **Expired subscription using premium feature** → Denies with renewal prompt
4. **Offline mobile edit then sync** → Handles conflicts and marks as synced
5. **Concurrent payment requests** → Prevents duplicate charges
6. **JWT token expiration** → Auto-refresh or redirect to login
7. **PayOS webhook with invalid signature** → Rejects without processing
8. **Database performance** → Can handle 1000+ transactions per user

## Common Error Codes & Messages

When generating error handling, use consistent codes:

| Code | HTTP Status | Scenario |
|------|------------|----------|
| `SUBSCRIPTION_REQUIRED` | 403 | Feature requires higher tier |
| `LIMIT_EXCEEDED` | 400 | Monthly/category limit hit |
| `UNAUTHORIZED` | 401 | JWT invalid/expired |
| `INVALID_INPUT` | 400 | Validation failed |
| `PAYMENT_FAILED` | 400 | PayOS error |
| `RESOURCE_NOT_FOUND` | 404 | Entity doesn't exist |
| `DUPLICATE_RESOURCE` | 409 | Unique constraint violated |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## Development Commands Reference

### Build & Run Backend
```bash
cd Backend/moneymanager
mvn clean install
mvn spring-boot:run  # Runs on localhost:8080
mvn test
```

### Build & Run Frontend
```bash
cd Frontend
npm install
npm run dev    # Runs on localhost:5173
npm run build
npm run lint
```

### Build & Run Mobile
```bash
cd Mobile
npm install
npm start      # Starts Expo
npm run android
npm run ios
```

## What NOT to Suggest

❌ Don't suggest skipping error handling
❌ Don't suggest trust frontend-only for security
❌ Don't suggest loading all data into memory
❌ Don't suggest `any` types in TypeScript
❌ Don't suggest exposing internal error details
❌ Don't suggest API calls without JWT validation
❌ Don't suggest hardcoding API keys or secrets
❌ Don't suggest skipping subscription checks
❌ Don't suggest synchronous API calls in mobile

## References & Detailed Guidelines

For more detailed information, consult:
- **`.claude/rules/`** — Comprehensive Claude guidelines
- **`.copilot/rules/`** — Detailed Copilot rules documentation
- **`CLAUDE.md`** — High-level Claude guidance
- **`COPILOT.md`** — High-level Copilot guidance
- **Architecture files** — Project structure and patterns
