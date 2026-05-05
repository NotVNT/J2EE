---
title: Subscription System
description: Three-tier subscription model and enforcement patterns
applyTo: ["Backend/**/service/SubscriptionService.java", "Backend/**/controller/*.java", "Backend/**/entity/ProfileEntity.java"]
---

# Subscription System

## Three-Tier Model

| Plan | Categories | Tx/Month | History | Features |
|------|-----------|----------|---------|----------|
| **FREE** | 10 | 100 | 3 months | Basic tracking |
| **BASIC** | 30 | 1000 | 12 months | Excel export |
| **PREMIUM** | Unlimited | Unlimited | Unlimited | Receipt import via AI |

Default plan for new users: **FREE**

## Enforcement Architecture

### SubscriptionService

Central enforcement point - **ALL** restricted operations must validate through this service before execution.

```java
// Guard patterns
subscriptionService.ensureCanCreateCategory(profile);
subscriptionService.ensureCanCreateTransaction(profile);
subscriptionService.ensureCanExport(profile);
subscriptionService.ensureCanImportReceipt(profile);
```

### Adding New Gated Features

1. **Add field to `PlanFeatures` inner class**
   ```java
   private int maxApiCalls;
   ```

2. **Update `getPlanFeatures()` switch statement**
   ```java
   case FREE:
       return new PlanFeatures()
           .setMaxApiCalls(100);
   ```

3. **Create new `ensureCan*()` method**
   ```java
   public void ensureCanUseApi(ProfileEntity profile) {
       // throws subscription-specific exception if not allowed
   }
   ```

4. **Call in relevant controller**
   ```java
   @PostMapping("/api-call")
   public ResponseEntity<?> apiCall(@AuthenticationPrincipal UserDetails user) {
       subscriptionService.ensureCanUseApi(profile);
       // ... proceed
   }
   ```

## Subscription State Management

### ProfileEntity Fields

- `subscriptionPlan`: Enum (FREE, BASIC, PREMIUM)
- `subscriptionStatus`: Enum (INACTIVE, ACTIVE, EXPIRED)
- `subscriptionActivatedAt`: Timestamp
- `subscriptionExpiresAt`: Timestamp
- `autoRenew`: Boolean

### State Transitions

```
Creation
  ↓
FREE (default, never expires)
  ↓
[User purchases] → BASIC (expires after period if not renewed)
  ↓
[Payment confirmed] → ACTIVE
  ↓
[Expiration date reached] → EXPIRED (downgrade to FREE)
  ↓
[User renews] → ACTIVE
```

## Payment-Subscription Link

When payment is confirmed via PayOS webhook:
1. `PaymentEntity` status updated to PAID
2. `ProfileEntity.subscriptionPlan` updated to purchased tier
3. `ProfileEntity.subscriptionStatus` set to ACTIVE
4. Expiration date calculated and stored

## Best Practices

1. **Never trust client-side subscription status** - Always validate on backend
2. **Check expiration on every restricted operation** - Status can change
3. **Use specific ensureCan*() methods** - Avoid generic permission checks
4. **Log subscription violations** - Helps identify abuse patterns
5. **Provide clear error messages** - Tell users what they need to upgrade to
