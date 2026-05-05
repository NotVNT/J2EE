---
title: Mobile Architecture
description: React Native + Expo navigation, authentication, and HTTP setup
applyTo: ["Mobile/src/**/*.js"]
---

# Mobile Architecture

## Technology Stack

- **React Native**: 0.79.6
- **Expo**: 53.0.12 (build/run environment)
- **React Navigation**: 7.x (routing)
- **AsyncStorage**: 2.1.2 (persistent storage)
- **Axios**: HTTP client

## Navigation Structure

```
AuthContext (determines route)
  ├── unauthenticated → AuthStack
  │   └── LoginScreen
  │
  └── authenticated → BottomTabs
      ├── Dashboard Tab → DashboardScreen
      ├── Expense Tab → ExpenseScreen
      ├── Income Tab → (if applicable)
      └── Profile Tab → (if applicable)
```

### AuthStack (Unauthenticated)

| Screen | Purpose |
|--------|---------|
| LoginScreen | User login |

**Future screens** (when implementing):
- SignupScreen
- ForgotPasswordScreen
- AccountActivationScreen

### BottomTabs (Authenticated)

| Tab | Screen | Purpose |
|-----|--------|---------|
| Dashboard | DashboardScreen | Financial overview |
| Expense | ExpenseScreen | Expense management |
| (extensible) | ... | ... |

## Authentication Flow

### AuthContext

**File**: `context/AuthContext.js`

**State**:
```javascript
{
  isLoading: boolean,
  isSignout: boolean,
  userToken: string | null,
  isAuthenticated: boolean
}
```

**Actions**:
```javascript
dispatch({ type: 'RESTORE_TOKEN' });  // Check stored token on app start
dispatch({ type: 'SIGN_IN', payload: token });  // After login
dispatch({ type: 'SIGN_OUT' });  // After logout
dispatch({ type: 'SIGN_UP', payload: token });  // After signup
```

**Usage**:
```javascript
const { isAuthenticated, userToken } = useContext(AuthContext);
```

## Token Storage

### AsyncStorage

**File**: `storage/tokenStorage.js`

**Key**: `AUTH_TOKEN` (convention)

**Operations**:
```javascript
// Save token
await saveToken(token);

// Load token (on app start)
const token = await loadToken();

// Remove token (on logout)
await removeToken();
```

**Persistence**: Survives app restart

## HTTP Client Setup

### HTTP Service

**File**: `services/http.js`

**Features**:
- Base URL from `.env`: `EXPO_PUBLIC_API_BASE_URL`
- JWT interceptor: Adds `Authorization: Bearer {token}`
- Error handling: 401 redirects to login
- Request/response transformation

**Export instance**: `httpInstance`

```javascript
// Usage in screens
import httpInstance from '@/services/http';

const response = await httpInstance.get('/dashboard');
```

### API Configuration

**File**: `constants/api.js`

**Constants**:
- `API_BASE_URL`: From environment
- API endpoint paths
- Request timeouts
- Common headers

## Screen Structure

### DashboardScreen

```javascript
export default function DashboardScreen() {
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await httpInstance.get('/dashboard');
      setFinancialData(response.data);
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  
  return (
    // UI components
  );
}
```

### ExpenseScreen

Similar pattern to DashboardScreen:
1. Fetch expense list on mount
2. Display list with pull-to-refresh
3. Navigate to add/edit screens
4. Implement delete/edit actions

### LoadingScreen

**File**: `components/LoadingScreen.js`

**Usage**: 
- App initialization
- Token restoration
- Data loading states

## State Management Patterns

### Local Component State
```javascript
const [expenses, setExpenses] = useState([]);
const [filters, setFilters] = useState({});
```

### Context State
- Authentication: `AuthContext`
- User profile: (optional - can add UserContext)
- App theme: (optional - can add ThemeContext)

### AsyncStorage
- Token: `tokenStorage.js`
- User preferences (if needed)
- Offline data (if implementing)

## Platform-Specific Setup

### Android Emulator

```env
# Use special IP for Android emulator
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8080/api/v1.0
```

**Note**: `10.0.2.2` is Android emulator's host machine reference

### iOS Simulator

```env
# iOS simulator can use localhost
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1.0
```

### Physical Device

```env
# Replace with your machine's local IP
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8080/api/v1.0
```

## Component Library

### Built-in React Native Components

- `View`: Container/layout
- `Text`: Text display
- `ScrollView`: Scrollable content
- `FlatList`: Efficient list rendering
- `TouchableOpacity`: Button-like interaction
- `TextInput`: Form input
- `Image`: Image display

### Custom Components

**File**: `components/`

- **LoadingScreen**: App loading state

**To add**:
- Modal dialogs
- Input components
- Card components
- Navigation drawer items

## Best Practices

1. **Always handle loading/error states** - Network can be unreliable
2. **Use FlatList for large lists** - Better performance than ScrollView
3. **Validate token before API calls** - Avoid unnecessary requests
4. **Implement pull-to-refresh** - Standard mobile UX
5. **Handle keyboard** - Use `KeyboardAvoidingView` for inputs
6. **Test on both platforms** - iOS and Android behaviors differ
7. **Monitor network status** - Warn user if offline
8. **Implement proper error boundaries** - Catch crashes gracefully

## Development Workflow

```bash
cd Mobile
npm install

# Start Expo server
npm start

# Choose platform:
# Press 'a' for Android emulator
# Press 'i' for iOS simulator
# Press 'w' for web version
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API not accessible from emulator | Check IP in .env (use 10.0.2.2 for Android) |
| Token not persisting | Verify AsyncStorage key matches in tokenStorage.js |
| Navigation not working | Check AuthContext dispatch types match actions |
| HTTP 401 in non-login screen | Token expired; implement refresh logic |
