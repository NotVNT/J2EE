---
title: Authentication & Security
description: JWT authentication, stateless security, and public endpoints
applyTo: ["Backend/**/security/**", "Frontend/**/util/axiosConfig.jsx", "Mobile/**/context/AuthContext.js"]
---

# Authentication & Security

## JWT Overview

**Architecture**: Stateless JWT authentication across all platforms

- **No server sessions** - All claims in token
- **Token format**: Bearer token in `Authorization` header
- **Signing**: HMAC SHA-512 with `JWT_SECRET`
- **Standard library**: JJWT 0.11.5

## Backend Implementation

### Token Generation

**Class**: `JwtUtil`

```java
// Generate token
String token = jwtUtil.generateToken(username, userId);

// Token contains: username, userId, expiration
// Expiration: configured in application properties
```

### Token Validation

**Class**: `JwtRequestFilter` (Spring filter chain)

```
HTTP Request
  ↓
[Extract token from Authorization: Bearer {token}]
  ↓
[Validate signature and expiration]
  ↓
[Load user details]
  ↓
[Set SecurityContext]
  ↓
[Pass to controller]
```

**Invalid token handling**:
- Expired: Return 401 Unauthorized
- Invalid signature: Return 401 Unauthorized
- Missing/malformed: Return 401 Unauthorized

## Frontend Token Management

**File**: `util/axiosConfig.jsx`

### Storage Strategy

- **localStorage**: Persistent across sessions
- **sessionStorage**: Cleared on browser close (optional)

### Automatic Attachment

Axios interceptor automatically attaches token to all requests:

```javascript
// Request interceptor adds:
Authorization: Bearer {token_from_storage}
```

### Token Refresh Pattern

- Store token expiration time
- Before expiration, request new token or re-login
- On 401 response, redirect to login

## Mobile Token Management

**Files**: 
- `context/AuthContext.js` - Authentication state
- `services/http.js` - Axios instance with interceptor
- `storage/tokenStorage.js` - AsyncStorage wrapper

### Storage Strategy

- **AsyncStorage**: Persistent token storage
- **AuthContext**: In-memory auth state

### Automatic Attachment

HTTP service automatically includes token in all requests:

```javascript
// axios instance default header:
Authorization: Bearer {token_from_AsyncStorage}
```

### Token Refresh

- Listen to 401 responses
- Redirect to LoginScreen on token expiration
- Clear AsyncStorage on logout

## Public Endpoints (No JWT Required)

These endpoints serve unauthenticated requests:

```
GET  /status           - API status
GET  /health           - Health check
POST /register         - User registration
POST /activate         - Account activation
POST /login            - User login (returns token)
POST /forgot-password  - Password reset request
POST /reset-password   - Password reset submission
GET  /gemini/test      - Gemini AI test endpoint
POST /payments/payos/webhook - PayOS payment webhook
```

## Security Best Practices

1. **Never expose JWT_SECRET** - Keep in `.env` only
2. **Use HTTPS in production** - Prevent token interception
3. **Set token expiration** - Limit damage from token theft
4. **Validate on every request** - No shortcuts
5. **Refresh tokens before expiration** - Seamless UX
6. **Clear token on logout** - All platforms
7. **Secure AsyncStorage (mobile)** - Use platform encryption if available

## CORS Configuration

**Purpose**: Allow frontend/mobile to call backend API

**Configured in**: Backend config class

**Allowed origins** (from `.env`):
- `MONEY_MANAGER_FRONTEND_URL` - React frontend
- Mobile origins (specific IPs/domains)

**Allowed methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS

**Allowed headers**: Authorization, Content-Type
