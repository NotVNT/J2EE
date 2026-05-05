# GitHub Copilot Integration

This directory contains GitHub Copilot-specific guidance files for working with the MoneyManager project.

## Files

### Main Documentation

- **`copilot-instructions.md`** - Primary reference guide for GitHub Copilot
  - Project overview and quick reference
  - Backend, Frontend, and Mobile architecture
  - Database schema and entity relationships
  - Environment setup and configuration
  - Security checklist
  - AI features (Gemini) and payment system (PayOS)
  - Deployment and Docker guidance
  - References to detailed rules in `.claude/`

## Integration with .claude/ Directory

GitHub Copilot instructions reference and integrate with the unified project rules stored in `.claude/rules/`:

| Copilot Topic | Related Rules |
|---------------|---------------|
| Backend Development | `.claude/rules/backend-architecture.md` |
| Frontend Development | `.claude/rules/frontend-architecture.md` |
| Mobile Development | `.claude/rules/mobile-architecture.md` |
| Authentication | `.claude/rules/authentication-security.md` |
| Subscription System | `.claude/rules/subscription-system.md` |
| Database Design | `.claude/rules/database-schema.md` |
| Payment Integration | `.claude/rules/payment-system.md` |
| AI Features | `.claude/rules/ai-features.md` |
| Deployment | `.claude/rules/deployment.md` |
| Build Commands | `.claude/rules/build-and-run.md` |
| Environment Setup | `.claude/rules/environment-setup.md` |
| Tech Stack | `.claude/rules/tech-stack.md` |

## Quick Start

1. **Read** `.github/copilot-instructions.md` for project-specific guidance
2. **Reference** `.claude/rules/` for detailed architecture and patterns
3. **Follow** `.claude/instructions/global-rules.md` for response standards
4. **Check** root-level `COPILOT.md` for quick reference (similar to `CLAUDE.md`)

## Key Principles

### For GitHub Copilot Users

1. **Subscription Validation** - Always gate PREMIUM features with `SubscriptionService.ensureCan*()` calls
2. **JWT Security** - Stateless authentication across all platforms (Bearer token format)
3. **Service Abstraction** - External APIs (PayOS, Gemini, Brevo) accessed only via service layer
4. **DTO Pattern** - API responses use DTOs, never expose entities directly
5. **Error Handling** - Comprehensive exception handling with meaningful messages
6. **Security First** - Parameterized queries, input validation, no hardcoded secrets

### Project Structure Overview

```
Backend/        Java 21, Spring Boot 4.0.3, Maven
  ├── Config layer (Spring Security, CORS, external services)
  ├── Controllers (REST endpoints)
  ├── Services (22+ business logic services)
  ├── Entities (JPA-mapped database models)
  ├── DTOs (API contracts)
  ├── Repositories (Spring Data JPA)
  └── Security (JWT handling)

Frontend/       React 19.2.0, Vite 8.0, React Router 7.13.1
  ├── Routes (public, protected, admin)
  ├── Components (reusable UI elements)
  ├── Pages (full-page views)
  ├── Services (API calls via Axios)
  └── Context (AppContext for global state)

Mobile/         React Native 0.79.6, Expo 53.0.12
  ├── Screens (authenticated views)
  ├── Navigation (AuthContext-driven)
  ├── Services (HTTP client with JWT interceptor)
  └── Storage (AsyncStorage for persistence)

Database/       MySQL 8.0+
  ├── ProfileEntity (user accounts + subscription)
  ├── ExpenseEntity, IncomeEntity (transactions)
  ├── CategoryEntity (transaction categories)
  ├── BudgetEntity (budget tracking)
  ├── SavingGoalEntity (savings goals)
  └── PaymentEntity (PayOS transactions)
```

## Environment Variables

### Backend
```env
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/moneymanager
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=password
SERVER_PORT=8080
JWT_SECRET=your-secret-key
MONEY_MANAGER_FRONTEND_URL=http://localhost:3000
BREVO_USERNAME=... BREVO_PASSWORD=... BREVO_FROM_EMAIL=...
PAYOS_CLIENT_ID=... PAYOS_API_KEY=... PAYOS_CHECKSUM_KEY=...
PAYOS_RETURN_URL=... PAYOS_CANCEL_URL=... PAYOS_WEBHOOK_URL=...
GEMINI_API_KEY=... GEMINI_MODEL=gemini-2.5-flash
```

### Frontend
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1.0
```

### Mobile
```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8080/api/v1.0  # Android
# or http://localhost:8080/api/v1.0  # iOS
# or http://<local-ip>:8080/api/v1.0  # Physical device
```

## Subscription Tiers

| Plan | Categories | Tx/Month | History | Premium Feature |
|------|-----------|----------|---------|-----------------|
| **FREE** | 10 | 100 | 3 months | - |
| **BASIC** | 30 | 1000 | 12 months | Excel export |
| **PREMIUM** | Unlimited | Unlimited | Unlimited | AI receipt import |

## Security & Best Practices

### Backend
- ✅ Always validate subscription before restricted operations
- ✅ Use DTO layer for API responses
- ✅ JWT validation on every protected endpoint
- ✅ Service layer abstraction for external APIs
- ❌ Never expose entities in API responses
- ❌ Never call external APIs from controllers
- ❌ Never commit .env files

### Frontend & Mobile
- ✅ Secure token storage (localStorage/AsyncStorage)
- ✅ Automatic JWT attachment via interceptor
- ✅ Handle 401 errors gracefully
- ✅ Implement loading and error states
- ❌ Never hardcode API keys
- ❌ Never expose tokens in logs
- ❌ Never trust client-side role checks

### Database
- ✅ Use parameterized queries (Spring Data JPA)
- ✅ Proper indexes for performance
- ✅ Foreign key constraints
- ✅ Cascade rules for referential integrity
- ❌ Never use string concatenation in queries
- ❌ Never trust user input directly

## Related Resources

- **Home Directory**: See root-level `COPILOT.md` for quick reference
- **Claude Code Guidance**: See `CLAUDE.md` at project root
- **Project Rules**: See `.claude/rules/` directory (14 detailed guides)
- **Global Constraints**: See `.claude/instructions/global-rules.md`
- **Agents**: See `.claude/agents/` (specialized workflows)

## Last Updated

May 5, 2026

---

**For detailed guidance**: See [`copilot-instructions.md`](copilot-instructions.md)
