---
title: Backend Architecture
description: Spring Boot backend package structure and design patterns
applyTo: ["Backend/**/*.java"]
---

# Backend Architecture

## Package Structure

```
src/main/java/com/example/moneymanager/
├── config/        Spring Security, CORS, PayOS, Gemini configs
├── controller/    REST endpoints (11+ controllers)
├── service/       Business logic (22+ services)
├── entity/        JPA entities
├── dto/           API request/response contracts
├── repository/    Spring Data JPA repositories
├── security/      JwtUtil + JwtRequestFilter
└── util/          Helper utilities
```

### Layer Responsibilities

- **Controller**: HTTP request/response handling, input validation delegation
- **Service**: Business logic, subscription validation, external API calls
- **Repository**: Data access via Spring Data JPA
- **Entity**: JPA-mapped database models
- **DTO**: API contracts for request/response serialization
- **Config**: Spring framework configuration (Security, CORS, PayOS, Gemini)
- **Security**: JWT token generation/validation, request filtering
- **Util**: Common helper functions

## Design Principles

1. **Subscription enforcement at service layer**: Never bypass `SubscriptionService.ensureCan*()` checks
2. **Stateless JWT authentication**: No server sessions; tokens contain all necessary claims
3. **Service-based external integrations**: PayOS, Gemini, Email abstracted via services
4. **DTO layer for API contracts**: Never expose entities directly in responses
5. **Repository pattern for data access**: All DB queries through repositories

## Key Services

### SubscriptionService

Enforces feature access based on subscription tier:
- `ensureCanCreateCategory(profile)`
- `ensureCanCreateTransaction(profile)`
- `ensureCanExport(profile)`
- `ensureCanImportReceipt(profile)`

**Always call appropriate method before allowing restricted operation**

### Core Services (22+)

- ProfileService: User profile management
- ExpenseService: Expense CRUD and queries
- IncomeService: Income CRUD and queries
- CategoryService: Category management (gated by subscription)
- BudgetService: Budget planning and tracking
- SavingGoalService: Savings goal management
- PaymentService: Payment integration with PayOS
- EmailService: Email notifications (Brevo relay)
- GeminiService: AI chat and receipt analysis (PREMIUM)

## Database Connection Pooling

- **HikariCP**: 2-10 connections, 5-minute idle timeout
- **Hibernate batch size**: 30
- **Fetch size**: 100

## REST API Conventions

- **Base URL**: `/api/v1.0`
- **Authentication**: `Authorization: Bearer {token}` header
- **Content-Type**: `application/json`
- **Status Codes**: Follow HTTP standards (200, 201, 400, 401, 403, 404, 500)
