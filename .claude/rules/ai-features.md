---
title: AI Features
description: Google Gemini integration for financial advice and receipt analysis
applyTo: ["Backend/**/service/GeminiService.java", "Backend/**/controller/GeminiController.java", "Frontend/**/components/ChatWidget.jsx"]
---

# AI Features

## Google Gemini Integration

**Model**: gemini-2.5-flash (lightweight, fast)

**Capabilities**:
1. Financial advice chatbot
2. Receipt image analysis (receipt OCR → transaction auto-fill)

## Subscription Gate

**PREMIUM feature only** - Guarded by subscription check:

```java
subscriptionService.ensureCanImportReceipt(profile);
```

## Backend Implementation

### GeminiService

**Core methods**:

```java
// Chat endpoint
String chat(String userId, String message)
  → sends message to Gemini
  → returns financial advice
  → maintains conversation context

// Receipt analysis
ReceiptData analyzeReceipt(String userId, String imageBase64)
  → sends receipt image to Gemini
  → extracts: amount, date, vendor, category
  → returns structured data for auto-fill
```

### GeminiController

**Endpoints**:

| Method | Endpoint | Authentication | Purpose |
|--------|----------|-----------------|---------|
| POST | `/gemini/chat` | JWT | Send chat message |
| POST | `/gemini/analyze-receipt` | JWT | Analyze receipt image |
| GET | `/gemini/test` | None | Health check (public) |

### Configuration

**File**: Backend Gemini config class

**Environment variables**:
```env
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
```

## Frontend Implementation

### Chat Widget

**File**: `components/ChatWidget.jsx`

**Features**:
- Message input form
- Conversation history display
- Real-time response display
- Receipt image upload with preview

**Usage**:
- Accessible from main dashboard
- Only visible/enabled for PREMIUM users
- Mobile-responsive

### Receipt Analysis Flow

```
1. User uploads receipt image
2. Frontend sends base64 to: POST /api/v1.0/gemini/analyze-receipt
3. Gemini processes and returns structured data:
   {
     amount: 150000,
     date: "2024-05-05",
     vendor: "Coffee Shop",
     category: "Food & Dining",
     description: "..."
   }
4. Frontend auto-fills new expense form
5. User confirms and submits
```

## Response Format

### Chat Response

```json
{
  "response": "Based on your spending patterns...",
  "timestamp": "2024-05-05T10:30:00Z"
}
```

### Receipt Analysis Response

```json
{
  "amount": 150000,
  "currency": "VND",
  "date": "2024-05-05",
  "vendor": "Coffee Shop",
  "category": "Food & Dining",
  "description": "Morning coffee and pastry",
  "confidence": 0.95
}
```

## Error Handling

| Error | Response | Recommendation |
|-------|----------|-----------------|
| Subscription not PREMIUM | 403 Forbidden | Show upgrade prompt |
| Invalid image format | 400 Bad Request | Accept jpg/png only |
| Gemini API error | 503 Service Unavailable | Retry with backoff |
| Malformed request | 400 Bad Request | Validate input |

## Best Practices

1. **Subscription validation** - Always check PREMIUM status first
2. **Image validation** - Verify format and size before sending to Gemini
3. **Rate limiting** - Prevent API quota exhaustion
4. **Fallback UI** - Show message if Gemini is unavailable
5. **Error recovery** - Graceful degradation on API failures
6. **Data privacy** - Images/data processed server-side only
7. **User feedback** - Show loading state during analysis
8. **Confidence scores** - Display to user; lower scores = review recommended

## API Cost Considerations

- Gemini 2.5 Flash is cost-efficient (cheaper than Pro)
- Conversation context stored temporarily for coherence
- Image analysis billed per image (not per size)
- Set quotas/alerts in Google Cloud console
