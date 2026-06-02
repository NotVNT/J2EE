# GitHub Copilot Instructions — J2EE Money Manager

You are GitHub Copilot integrated with VS Code for the J2EE Money Manager project.

## 🎯 Project Context

**Full-Stack Personal Finance Application**
- **Backend:** Java 17+ Spring Boot + MongoDB
- **Frontend:** React 18 + TypeScript + Vite  
- **Mobile:** React Native + Expo
- **Database:** MongoDB Atlas

## 🔧 Milens Code Intelligence

**Status:** Milens CLI available (MCP server disabled due to Windows build tool limitations)

### Using Milens from Terminal
Since MCP is disabled, use Milens commands in terminal:

```bash
# Analyze codebase (builds index)
npx -y milens analyze -p . --force

# Find symbols
npx -y milens search <symbol>
npx -y milens context <symbol>
npx -y milens impact <symbol>

# Security & quality
npx -y milens security scan --scope all
npx -y milens find-dead-code
```

See `MILENS-CLI-SETUP.md` for full CLI reference and options.

### Before Major Changes (Manual Process)
Since MCP tools aren't available in Copilot chat:
1. Run: `npx -y milens impact <symbol>` in terminal
2. Review blast radius output
3. Then proceed with changes in Copilot

### Alternative: Install Build Tools for MCP
See `MILENS-CLI-SETUP.md` Option 2 for setup

## 🏗️ Code Style & Patterns

### Java Backend

**Naming:**
```java
// Classes: PascalCase
public class UserAuthenticationService { }

// Methods: camelCase with clear verbs
public User findUserById(String userId) { }
public void validateUserActivation(User user) { }

// Constants: UPPER_SNAKE_CASE
private static final int DEFAULT_TOKEN_EXPIRY_HOURS = 24;
```

**Spring Boot Conventions:**
```java
// Dependency injection
@Autowired
private UserRepository userRepository;

// Authorization
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> deleteUser(@PathVariable String userId) { }

// API responses
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;
}
```

### TypeScript / React Frontend

**File Structure:**
```typescript
// src/components/UserProfile.tsx
interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  onUpdate,
}) => {
  // Implementation
};
```

**Custom Hooks:**
```typescript
// src/hooks/useAuth.ts
export const useAuth = () => {
  // Return auth state and methods
  return { user, login, logout };
};
```

## 🔐 Critical Architecture Notes

### Account Activation & Spring Security

**Why it matters:**
- Inactive users have `isActive = false` in database
- Spring Security's `UserDetails.isEnabled()` maps to `isActive`
- Unactivated users are **blocked from protected endpoints**
- Registration clears old `mm_token` cookies

**Never skip this in auth logic:**
```java
// ✅ Check isActive
if (!user.isActive()) {
  throw new InactiveUserException("User not activated");
}

// ❌ WRONG - ignoring isActive
User user = userRepository.findById(userId);
// ... no activation check!
```

### API Authentication

**Request Format:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Response Format:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* ... */ }
}
```

## ✅ Code Quality Checklist

When Copilot suggests code, verify:

- [ ] **Type Safety:** No implicit `any` types
- [ ] **Error Handling:** Try-catch, error boundaries
- [ ] **Security:** No hardcoded secrets, validate input
- [ ] **Performance:** No N+1 queries, memoization
- [ ] **Testing:** Unit tests included
- [ ] **Naming:** Clear, descriptive names
- [ ] **Comments:** Why, not what

## 🛡️ Security Guardrails

### Never Suggest
❌ Hardcoded secrets (keys, passwords, tokens)
❌ Direct SQL queries (always use parameterized)
❌ `eval()`, `exec()` or dangerous functions
❌ Unvalidated user input in queries
❌ Client-side auth checks only
❌ Storing secrets in localStorage

### Always Suggest
✅ Input validation & sanitization
✅ Parameterized queries (prepared statements)
✅ JWT validation on backend
✅ Environment variables for secrets
✅ SQL injection prevention
✅ XSS protection in React

## 📝 Common Workflows

### Adding a New API Endpoint

1. **Define DTO**
   ```java
   public class CreateUserRequest {
       private String email;
       private String password;
   }
   ```

2. **Create Service**
   ```java
   public User createUser(CreateUserRequest request) {
       // Business logic
   }
   ```

3. **Create Controller**
   ```java
   @PostMapping("/api/users")
   public ResponseEntity<?> createUser(@RequestBody CreateUserRequest req) {
       // Delegate to service
   }
   ```

4. **Add Security**
   ```java
   @PostMapping
   @PreAuthorize("hasRole('ADMIN')")
   public ResponseEntity<?> ...
   ```

5. **Write Tests**
   ```java
   @Test
   public void testCreateUser() { }
   ```

### Adding a React Component

1. **Define Types**
   ```typescript
   interface Props {
     userId: string;
   }
   ```

2. **Create Component**
   ```typescript
   export const MyComponent: React.FC<Props> = ({ userId }) => { };
   ```

3. **Add Handlers**
   ```typescript
   const handleClick = () => { };
   ```

4. **Test Component**
   ```typescript
   test("renders correctly", () => { });
   ```

### Fixing a Bug

1. **Trace Execution**
   ```
   @milens trace <entryPoint>
   ```

2. **Write Failing Test**
   ```java
   @Test
   public void testBugScenario() {
       // This should fail currently
   }
   ```

3. **Implement Fix**

4. **Verify Test Passes**

5. **Check Regressions**
   ```
   @milens test_impact <changedSymbol>
   ```

## 🚫 Don't Suggest

❌ `var` — use `const` or `let`
❌ Direct DOM manipulation in React
❌ Functions with > 3 optional parameters
❌ Complex nested ternaries
❌ Non-standard HTTP status codes
❌ Very long functions (> 50 lines)

## ✨ Do Suggest

✅ Extract complex conditions into named variables
✅ Use utility functions for repeated logic
✅ TypeScript interfaces for all objects
✅ Meaningful variable names explaining intent
✅ Comments for "why" not "what"
✅ Tests alongside implementation
✅ Error handling before happy path

## 📁 Key Files

**Backend:**
- `Backend/moneymanager/src/main/java/com/moneymanager/`
  - `controller/` — REST endpoints
  - `service/` — Business logic
  - `repository/` — Data access
  - `security/` — Auth & JWT

**Frontend:**
- `Frontend/src/`
  - `components/` — React components
  - `pages/` — Page views
  - `hooks/` — Custom hooks
  - `context/` — State management
  - `types/` — TypeScript definitions

**Mobile:**
- `Mobile/src/`
  - `screens/` — Screen components
  - `navigation/` — Navigation setup
  - `services/` — API services

## 🔗 Available Commands

### Backend
```bash
# Start
cd Backend/moneymanager && mvn spring-boot:run

# Test
mvn test

# Compile
mvn clean compile
```

### Frontend
```bash
# Start (port 5173)
cd Frontend && npm run dev

# Test
npm test

# Build
npm run build
```

### Mobile
```bash
# Start Expo (port 19000)
cd Mobile && npm start

# Run on device
npm run android  # or npm run ios
```

## 🎯 Remember

1. **Context First** — Understand architecture before changes
2. **Safety First** — Always analyze impact before editing
3. **Security First** — Never suggest hardcoded secrets
4. **Tests First** — Suggest tests alongside code
5. **Readability First** — Code should be self-documenting
6. **Consistency First** — Follow existing patterns

## 📚 Resources

- **Milens:** https://github.com/fuze210699/milens
- **Spring Boot:** https://spring.io/projects/spring-boot
- **React:** https://react.dev
- **TypeScript:** https://www.typescriptlang.org/docs/

---

**Last Updated:** June 2, 2026
**Profile:** Copilot (VS Code)
**Milens Tools:** 41 available
**Languages:** Java, TypeScript, JavaScript, React
