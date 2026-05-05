---
title: Payment System
description: PayOS Vietnamese payment gateway integration
applyTo: ["Backend/**/controller/PaymentController.java", "Backend/**/service/PaymentService.java", "Frontend/**/pages/Payment*.jsx"]
---

# Payment System

## Overview

Integrates **PayOS** (Vietnamese payment gateway) for subscription purchases.

- **Provider**: PayOS SDK 2.0.1
- **Region**: Vietnam
- **Supported**: Credit cards, e-wallets, bank transfers

## Payment Flow

### Frontend Initiation

```
User clicks "Upgrade Plan"
  ↓
Frontend calls: POST /api/v1.0/payments/create
  {planType: "BASIC"}
  ↓
Backend returns: {paymentLink: "https://payos.vn/..."}
  ↓
Frontend redirects to PayOS payment page
  ↓
User completes payment on PayOS
```

### Webhook Processing

```
PayOS sends: POST /api/v1.0/payments/payos/webhook
  {status: "PAID", orderId: "..."}
  ↓
[PaymentController validates webhook]
  ↓
[Updates PaymentEntity status to PAID]
  ↓
[Updates ProfileEntity subscription]
  ↓
Frontend redirected: /payment/success
```

## Backend Implementation

### PaymentService

**Methods**:

```java
// Create payment and generate link
PaymentResponse createPayment(ProfileEntity profile, String planType)
  → generates Order ID
  → returns PayOS payment link URL

// Handle webhook from PayOS
void handlePayOsWebhook(WebhookPayload payload)
  → validates signature
  → updates PaymentEntity
  → activates subscription
```

### Configuration

**File**: Backend config class (PayOS config bean)

**Environment variables** (required):
```env
PAYOS_CLIENT_ID=...
PAYOS_API_KEY=...
PAYOS_CHECKSUM_KEY=...
```

## Frontend Implementation

### Payment Pages

| Page | Purpose |
|------|---------|
| `/payment` | Initiate payment, redirect to PayOS |
| `/payment/success` | Success confirmation |
| `/payment/cancel` | User canceled payment |

**Environment variables** (in `.env`):
```env
PAYOS_RETURN_URL=http://localhost:3000/payment/success
PAYOS_CANCEL_URL=http://localhost:3000/payment/cancel
```

### Redirect URLs

After payment completion, PayOS redirects back:

- **Success**: `PAYOS_RETURN_URL?orderId=...&status=PAID`
- **Cancel**: `PAYOS_CANCEL_URL?orderId=...`

## PaymentEntity Structure

```java
@Entity
public class PaymentEntity {
    private Long id;
    private String orderId;           // PayOS Order ID
    private ProfileEntity profile;    // User making payment
    private String planType;          // BASIC or PREMIUM
    private BigDecimal amount;        // Payment amount
    private String currency;          // VND, USD
    private String status;            // PENDING, PAID, FAILED, CANCELLED
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

## Webhook Security

### Signature Validation

PayOS signs all webhooks with `PAYOS_CHECKSUM_KEY`.

**Always validate signature before processing**:

```java
boolean isValid = paymentService.validateWebhookSignature(payload);
if (!isValid) {
    throw new SecurityException("Invalid webhook signature");
}
```

### Webhook Handler

**Endpoint**: `POST /api/v1.0/payments/payos/webhook`

**Public access**: Yes (webhook must be public)

**Processing**:
1. Validate PayOS signature
2. Verify order exists
3. Update PaymentEntity status
4. Update ProfileEntity subscription
5. Send success email
6. Return 200 OK

## Error Handling

| Scenario | Response | Action |
|----------|----------|--------|
| User cancels payment | Redirect to cancel page | No subscription change |
| Payment fails | Redirect to cancel page | No subscription change |
| Invalid signature | 401 Unauthorized | Log security event |
| Duplicate webhook | Update safely | Idempotent operation |

## Best Practices

1. **Always validate webhooks** - Never trust unsigned requests
2. **Idempotent webhook handlers** - Handle duplicate deliveries safely
3. **Log all payment events** - For debugging and audit trails
4. **Test with PayOS sandbox** - Before production deployment
5. **Set webhook URL in PayOS dashboard** - `PAYOS_WEBHOOK_URL`
6. **Handle race conditions** - User might refresh during redirect
7. **Provide clear feedback** - Show payment status on frontend
