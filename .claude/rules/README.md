---
title: Rules Index
description: Quick reference guide to all project rules
---

# MoneyManager - Rules Index

Welcome! This folder contains structured rules for the MoneyManager fullstack application.

## 📋 Rules Overview

### Getting Started
1. **[project-overview.md](project-overview.md)** - Project structure, key features, and guidelines
2. **[build-and-run.md](build-and-run.md)** - Build commands for Backend, Frontend, and Mobile
3. **[environment-setup.md](environment-setup.md)** - Environment variables configuration
4. **[tech-stack.md](tech-stack.md)** - Technology versions and stack rationale

### Backend Development
5. **[backend-architecture.md](backend-architecture.md)** - Package structure, design patterns, layer responsibilities
6. **[subscription-system.md](subscription-system.md)** - Three-tier subscription model and enforcement
7. **[authentication-security.md](authentication-security.md)** - JWT auth, token management, CORS
8. **[database-schema.md](database-schema.md)** - Entity relationships, mappings, database optimization
9. **[payment-system.md](payment-system.md)** - PayOS integration and payment flow
10. **[ai-features.md](ai-features.md)** - Google Gemini integration for chat and receipt analysis

### Frontend Development
11. **[frontend-architecture.md](frontend-architecture.md)** - React Router, Vite, state management, components

### Mobile Development
12. **[mobile-architecture.md](mobile-architecture.md)** - React Navigation, AsyncStorage, HTTP setup

### Deployment
13. **[deployment.md](deployment.md)** - Docker multi-stage build, deployment platforms, monitoring

---

## 🚀 Quick Start

### First Time Setup
```bash
# Backend
cd Backend/moneymanager
mvn spring-boot:run

# Frontend  
cd Frontend
npm install && npm run dev

# Mobile
cd Mobile
npm install && npm start
```

See [build-and-run.md](build-and-run.md) for full commands.

### Environment Configuration
1. Copy `.env.example` to `.env`
2. Fill in all required variables from [environment-setup.md](environment-setup.md)
3. Ensure database is running and accessible

---

## 🎯 Common Tasks

### Adding a New Feature
1. Check **[subscription-system.md](subscription-system.md)** if feature should be gated
2. Implement backend in **[backend-architecture.md](backend-architecture.md)** (service layer)
3. Add frontend UI following **[frontend-architecture.md](frontend-architecture.md)** patterns
4. Update database if needed per **[database-schema.md](database-schema.md)**

### Debugging Issues
- **Auth problems?** → [authentication-security.md](authentication-security.md)
- **Payment failures?** → [payment-system.md](payment-system.md)
- **AI features?** → [ai-features.md](ai-features.md)
- **Database errors?** → [database-schema.md](database-schema.md)

### Deploying
- See [deployment.md](deployment.md) for Docker, Render, and environment setup

---

## 📦 Technology Stack Summary

| Layer | Tech | Version |
|-------|------|---------|
| Backend | Spring Boot | 4.0.3 |
| Language | Java | 21 |
| Frontend | React | 19.2.0 |
| Frontend Build | Vite | 8.0 beta |
| Mobile | React Native | 0.79.6 |
| Mobile Platform | Expo | 53.0.12 |
| Database | MySQL | 8.0+ |
| Auth | JWT (JJWT) | 0.11.5 |
| Payment | PayOS SDK | 2.0.1 |
| AI | Google Gemini | 2.5-flash |

See [tech-stack.md](tech-stack.md) for full details.

---

## 🔗 Rule Relationships

```
project-overview
    ├── build-and-run (how to run)
    ├── environment-setup (configure)
    └── tech-stack (versions)

Backend Development
    ├── backend-architecture (structure)
    ├── subscription-system (enforcing tiers)
    ├── authentication-security (JWT)
    ├── database-schema (data models)
    ├── payment-system (PayOS)
    └── ai-features (Gemini)

Frontend Development
    ├── frontend-architecture (routing, state)
    ├── authentication-security (token mgmt)
    └── payment-system (payment UI)

Mobile Development
    ├── mobile-architecture (navigation)
    ├── authentication-security (token mgmt)
    └── environment-setup (API URL)

Deployment
    ├── deployment (Docker, Render)
    ├── environment-setup (secrets)
    └── tech-stack (versions)
```

---

## 💡 Key Principles

1. **Subscription-first design**: All restricted features validated through `SubscriptionService`
2. **Stateless JWT**: No server sessions; tokens contain all claims
3. **Service layer abstraction**: External APIs (PayOS, Gemini, Brevo) accessed via services
4. **Multi-platform consistency**: Same business logic across web, mobile, backend
5. **Database-centric**: JPA entities define the single source of truth

---

## 📞 Support Resources

- **Backend questions**: Review [backend-architecture.md](backend-architecture.md) and specific feature rules
- **API endpoints**: Check REST API conventions in [backend-architecture.md](backend-architecture.md)
- **Frontend patterns**: See [frontend-architecture.md](frontend-architecture.md) for component and state patterns
- **Mobile setup**: [mobile-architecture.md](mobile-architecture.md) covers navigation and storage
- **Deployment issues**: [deployment.md](deployment.md) has troubleshooting section

---

Last updated: May 2026
