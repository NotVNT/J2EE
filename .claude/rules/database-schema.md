---
title: Database Schema
description: Entity relationships, JPA mappings, and data model
applyTo: ["Backend/**/entity/*.java"]
---

# Database Schema

## Entity Relationships

### Profile-Centric Model

```
ProfileEntity (1)
  ├── (1) → (many) ExpenseEntity
  ├── (1) → (many) IncomeEntity
  ├── (1) → (many) BudgetEntity
  ├── (1) → (many) CategoryEntity
  ├── (1) → (many) SavingGoalEntity
  └── (1) → (many) PaymentEntity

CategoryEntity (1)
  ├── (1) → (many) ExpenseEntity
  ├── (1) → (many) IncomeEntity
  └── (1) → (many) BudgetEntity

SavingGoalEntity (1)
  └── (1) → (many) SavingGoalContributionEntity
```

## Core Entities

### ProfileEntity

**Represents**: User account and subscription state

**Key Fields**:
- `id`: Primary key
- `username`: Unique login name
- `email`: User email
- `passwordHash`: Encrypted password
- `subscriptionPlan`: Enum (FREE, BASIC, PREMIUM)
- `subscriptionStatus`: Enum (INACTIVE, ACTIVE, EXPIRED)
- `subscriptionActivatedAt`: Timestamp
- `subscriptionExpiresAt`: Timestamp
- `autoRenew`: Boolean (auto-renew on expiration)
- `createdAt`: Account creation time
- `updatedAt`: Last modification

**Relationships**:
- One-to-Many with Expenses, Income, Budgets, Categories, Goals, Payments
- One-to-One with preferred settings (optional)

### ExpenseEntity

**Represents**: Individual expense transaction

**Key Fields**:
- `id`: Primary key
- `profile`: Foreign key to ProfileEntity
- `category`: Foreign key to CategoryEntity
- `amount`: Decimal amount
- `currency`: Currency code (VND, USD)
- `description`: Transaction notes
- `date`: Transaction date
- `createdAt`: Record creation timestamp
- `updatedAt`: Last modification

**Indexes**: 
- (profile_id, date) - Query expenses by profile and date range
- (category_id) - Filter by category

### IncomeEntity

**Represents**: Individual income transaction

**Key Fields**:
- `id`: Primary key
- `profile`: Foreign key to ProfileEntity
- `category`: Foreign key to CategoryEntity (income categories)
- `amount`: Decimal amount
- `currency`: Currency code
- `source`: Income source description
- `date`: Transaction date
- `createdAt`: Record creation timestamp
- `updatedAt`: Last modification

**Indexes**: Same as ExpenseEntity

### CategoryEntity

**Represents**: Expense/Income category

**Key Fields**:
- `id`: Primary key
- `profile`: Foreign key to ProfileEntity
- `name`: Category name (e.g., "Dining", "Transport")
- `type`: Enum (EXPENSE, INCOME)
- `emoji`: Category icon (emoji character)
- `color`: Display color (hex code)
- `createdAt`: Creation timestamp
- `updatedAt`: Last modification

**Constraints**:
- (profile_id, name, type) - Unique per user per category type
- Subscription limit: FREE=10, BASIC=30, PREMIUM=unlimited

### BudgetEntity

**Represents**: Budget plan for a category

**Key Fields**:
- `id`: Primary key
- `profile`: Foreign key to ProfileEntity
- `category`: Foreign key to CategoryEntity
- `amount`: Budget limit
- `currency`: Currency code
- `period`: Enum (DAILY, WEEKLY, MONTHLY, YEARLY)
- `startDate`: Budget period start
- `endDate`: Budget period end
- `alertThreshold`: Percentage (e.g., 80% = alert at 80% spent)
- `createdAt`: Creation timestamp
- `updatedAt`: Last modification

**Constraints**:
- (profile_id, category_id, period, startDate) - Unique per user

### SavingGoalEntity

**Represents**: Savings goal tracking

**Key Fields**:
- `id`: Primary key
- `profile`: Foreign key to ProfileEntity
- `name`: Goal name (e.g., "Vacation")
- `targetAmount`: Goal target
- `currentAmount`: Amount saved so far
- `currency`: Currency code
- `targetDate`: Deadline
- `priority`: Enum (LOW, MEDIUM, HIGH)
- `createdAt`: Creation timestamp
- `updatedAt`: Last modification

**Relationships**:
- One-to-Many with SavingGoalContributionEntity

### SavingGoalContributionEntity

**Represents**: Individual contribution to a saving goal

**Key Fields**:
- `id`: Primary key
- `savingGoal`: Foreign key to SavingGoalEntity
- `amount`: Contribution amount
- `date`: Contribution date
- `notes`: Optional notes
- `createdAt`: Record creation timestamp

### PaymentEntity

**Represents**: PayOS payment transaction

**Key Fields**:
- `id`: Primary key
- `profile`: Foreign key to ProfileEntity
- `orderId`: PayOS order ID (unique)
- `planType`: Purchased plan (BASIC or PREMIUM)
- `amount`: Payment amount
- `currency`: Currency (VND, USD)
- `status`: Enum (PENDING, PAID, FAILED, CANCELLED)
- `createdAt`: Payment initiation timestamp
- `updatedAt`: Last status update
- `paidAt`: Payment completion timestamp

**Indexes**:
- `orderId` - Unique, for webhook lookup
- (profile_id, status) - Query user payments by status

## Database Configuration

### Connection Pooling

**HikariCP Settings**:
- **Min connections**: 2
- **Max connections**: 10
- **Idle timeout**: 5 minutes
- **Connection timeout**: 30 seconds

### Hibernate Settings

**Batch Configuration**:
- **Batch size**: 30 (insert/update batching)
- **Fetch size**: 100 (result set)
- **Show SQL**: Disabled in production

**DDL Strategy**:
- `spring.jpa.hibernate.ddl-auto=update` (auto-create/update schema)
- Use migration tool (Flyway/Liquibase) for production

### Query Optimization

**N+1 Prevention**:
- Use `@Fetch(FetchMode.JOIN)` for eager loading critical relationships
- Lazy load non-critical relationships
- Use custom queries with `JOIN FETCH` when needed

**Indexes to create**:
```sql
-- Frequent queries
CREATE INDEX idx_profile_date ON expense(profile_id, date DESC);
CREATE INDEX idx_profile_date ON income(profile_id, date DESC);
CREATE INDEX idx_category ON expense(category_id);
CREATE INDEX idx_category ON income(category_id);

-- PayOS lookup
CREATE UNIQUE INDEX idx_order_id ON payment(order_id);

-- Subscription checks
CREATE INDEX idx_profile_sub_status ON profile(subscription_status);
```

## Data Integrity

### Cascade Rules

- **ProfileEntity deleted** → All related expenses, income, budgets, categories, goals, payments deleted
- **CategoryEntity deleted** → All related transactions deleted (or reassign to default)
- **SavingGoalEntity deleted** → All contributions deleted

### Constraints

- Amount fields: NOT NULL, >= 0
- Date fields: NOT NULL, realistic ranges
- Foreign keys: NOT NULL, enforced
- Unique constraints: Application-level validation + DB constraint

## Audit Trail

### Timestamp Fields

Every entity has:
- `createdAt`: Immutable, set at creation
- `updatedAt`: Updated on any modification

**Purpose**: Track data changes, implement soft deletes if needed

## Entity Mapping Guidelines

- **DTO for API**: Convert entities to DTOs before sending to client
- **Entity validation**: Use JSR-303 (`@NotNull`, `@Min`, etc.)
- **Relationship naming**: Use descriptive field names (not `user`, use `profile`)
- **Enum fields**: Use `@Enumerated(EnumType.STRING)` for readability
