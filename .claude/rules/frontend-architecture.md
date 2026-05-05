---
title: Frontend Architecture
description: React Router v7, Vite code splitting, and application state management
applyTo: ["Frontend/src/**/*.jsx"]
---

# Frontend Architecture

## Technology Stack

- **React**: 19.2.0
- **Vite**: 8.0 beta (build tool, code splitting)
- **React Router**: 7.13.1 (navigation)
- **Tailwind CSS**: 4.2.1 (styling)
- **Axios**: HTTP client with JWT interceptor
- **Recharts**: 3.8.0 (data visualization)

## Route Structure

### Public Routes (No Authentication Required)

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | LandingPage | Homepage |
| `/login` | Login | User login |
| `/signup` | Signup | User registration |
| `/forgot-password` | ForgotPassword | Password reset request |
| `/account-activation` | AccountActivation | Email activation |
| `/reset-password` | ResetPassword | Password reset submission |

### Protected Routes (JWT Required)

| Route | Component | Purpose |
|-------|-----------|---------|
| `/dashboard` | Dashboard | Main overview |
| `/income` | Income | Income tracking |
| `/expense` | Expense | Expense tracking |
| `/budget` | Budget | Budget management |
| `/categories` | Category | Category management |
| `/profile` | Profile | User profile |
| `/settings` | Settings | App settings |
| `/saving-goals` | SavingGoals | Saving goal tracking |
| `/payment` | Payment | Subscription payment |
| `/payment/success` | PaymentSuccess | Payment confirmation |
| `/payment/cancel` | PaymentCancel | Payment cancellation |

### Admin Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/admin/dashboard` | AdminDashboard | Admin overview |
| `/admin/payments` | AdminPayments | Payment management |
| `/admin/subscription` | AdminSubscription | Subscription management |
| `/admin/settings` | AdminSettings | Admin settings |

**Access control**: `AdminRoute` wrapper component checks admin role

## Global State Management

### AppContext

**File**: `context/AppContext.jsx`

**State**:
```javascript
{
  profile: {
    id: number,
    username: string,
    email: string,
    subscriptionPlan: "FREE" | "BASIC" | "PREMIUM",
    subscriptionStatus: "INACTIVE" | "ACTIVE" | "EXPIRED"
  },
  isAuthenticated: boolean,
  loading: boolean,
  error: string | null
}
```

**Usage**:
```javascript
const { profile, isAuthenticated, subscriptionPlan } = useContext(AppContext);
```

**Sync pattern**: 
- Fetch profile on app load from JWT token
- Update on login/logout
- Refresh periodically or on critical actions

## HTTP Client Setup

### Axios Configuration

**File**: `util/axiosConfig.jsx`

**Features**:
- Base URL: Pulled from `VITE_API_BASE_URL`
- JWT interceptor: Automatically adds `Authorization: Bearer {token}`
- Error interceptor: Handles 401 (redirect to login)
- Request interceptor: Adds common headers

**Export instance**: `axiosInstance`

```javascript
// Usage in components
import axiosInstance from '@/util/axiosConfig';

const response = await axiosInstance.get('/expenses');
```

## Component Structure

### Layout Components

- **Header**: Top navigation bar
- **Sidebar**: Left navigation menu (collapsible on mobile)
- **Menubar**: Mobile navigation alternative

### Feature Components

| Folder | Purpose |
|--------|---------|
| `/pages` | Full-page views (routed) |
| `/components` | Reusable UI components |
| `/components/landing` | Landing page specific |

### Data-Driven Components

| Component | Purpose |
|-----------|---------|
| Dashboard | Overall financial overview |
| ExpenseList | Table of expenses |
| IncomeList | Table of income |
| BudgetCard / BudgetList | Budget tracking UI |
| CategoryList | Category management |
| SavingGoalCard / List | Saving goal tracking |
| RecentTransactions | Activity feed |

### Chart Components

- **CustomLineChart**: Time-series data
- **CustomPieChart**: Category breakdown
- **CustomTooltip**: Unified tooltip style
- **CustomLegend**: Unified legend style
- **ExpenseOverview**: Dashboard chart
- **IncomeOverview**: Dashboard chart
- **FinanceOverview**: Combined chart

### Utility Components

- **Modal**: Reusable modal dialog
- **DeleteAlert**: Confirmation dialog
- **Input**: Styled input field
- **EmojiPickerPopup**: Category emoji selector
- **ChatWidget**: AI chat interface
- **ProfilePhotoSelector**: Avatar upload

## Form Patterns

### Add/Edit Forms

**Pattern**:
1. Form component (e.g., `AddExpenseForm.jsx`)
2. Input validation in component or helper
3. Submit to backend via axios
4. Handle errors gracefully
5. Refresh parent component or global state

**Helper**: `util/validation.js`

## State Management Patterns

### Local Component State
```javascript
const [formData, setFormData] = useState({});
const [errors, setErrors] = useState({});
```

### Shared Global State
- Profile info → AppContext
- Subscription status → AppContext
- User preferences → localStorage

### API Response Caching
- Implement if fetching same data multiple times
- Clear cache on mutations (create/update/delete)

## Code Splitting

**Vite feature**: Automatic route-based code splitting

**Benefits**:
- Faster initial load
- Lazy-loaded routes
- Smaller initial bundle

## Performance Optimization

1. **Lazy load routes**: `React.lazy()` + `Suspense`
2. **Memoize expensive components**: `React.memo()`
3. **Optimize re-renders**: useCallback, useMemo
4. **Image optimization**: Compress assets, use proper formats
5. **Bundle analysis**: Check with `npm run build`

## Development Conventions

- Component files: PascalCase (e.g., `DashboardCard.jsx`)
- Constants/utils: camelCase (e.g., `apiEndpoints.js`)
- CSS: Tailwind classes inline; no separate CSS files
- Props validation: Use TypeScript or PropTypes
- Environment variables: VITE_ prefix (Vite convention)
