---
title: Environment Configuration
description: Environment variables setup for backend and mobile
applyTo: [".env", "Backend/**/.env", "Mobile/**/.env"]
---

# Environment Configuration

## Backend Environment Variables

File locations:
- `.env` at project root, OR
- `Backend/moneymanager/.env`

### Database Configuration

```env
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/moneymanager
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=password
```

### Server Configuration

```env
SERVER_PORT=8080
MONEY_MANAGER_FRONTEND_URL=http://localhost:3000
```

### Security

```env
JWT_SECRET=your-secret-key
```

### Email (Brevo SMTP)

```env
BREVO_USERNAME=...
BREVO_PASSWORD=...
BREVO_FROM_EMAIL=...
```

**Note**: Brevo uses port 2525 (standard 587/465 blocked by Render free tier)

### Payment Gateway (PayOS - Vietnamese)

```env
PAYOS_CLIENT_ID=...
PAYOS_API_KEY=...
PAYOS_CHECKSUM_KEY=...
PAYOS_RETURN_URL=http://localhost:3000/payment/success
PAYOS_CANCEL_URL=http://localhost:3000/payment/cancel
PAYOS_WEBHOOK_URL=https://your-domain.com/api/v1.0/payments/payos/webhook
```

### AI Features (Google Gemini)

```env
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
```

---

## Mobile Environment Variables

File location: `Mobile/.env`

### API Base URL

Choose one based on your target platform:

```env
# For Android emulator
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8080/api/v1.0

# For iOS simulator
# EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1.0

# For physical device (replace <local-ip> with your machine IP)
# EXPO_PUBLIC_API_BASE_URL=http://<local-ip>:8080/api/v1.0
```

---

## Environment Setup Checklist

- [ ] Database is running and accessible
- [ ] All required API keys obtained (PayOS, Gemini, Brevo)
- [ ] `.env` file exists with all required variables
- [ ] Backend port 8080 is not in use
- [ ] Frontend dev server port 3000 is available
- [ ] Mobile emulator has correct API endpoint configured
