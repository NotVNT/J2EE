---
title: Technology Stack
description: Versions and technology choices across all layers
applyTo: ["pom.xml", "package.json", "backend", "frontend", "mobile"]
---

# Technology Stack

## Backend (Spring Boot)

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **Spring Boot** | 4.0.3 | Application framework |
| **Spring Web** | 4.0.3 | REST API support |
| **Spring Data JPA** | 4.0.3 | Database ORM |
| **Spring Security** | 4.0.3 | Authentication & authorization |

### Build & Runtime

| Technology | Version | Purpose |
|------------|---------|---------|
| **Java** | 21 | Language & runtime |
| **Maven** | 3.9+ | Build automation |

### Database

| Technology | Version | Purpose |
|------------|---------|---------|
| **MySQL** | 8.0+ | Relational database |
| **HikariCP** | Latest in Spring Boot | Connection pooling |
| **Hibernate** | Built-in with Spring Data | JPA implementation |

### Security & Authentication

| Technology | Version | Purpose |
|------------|---------|---------|
| **JJWT** | 0.11.5 | JWT token generation/validation |
| **Bcrypt** | Spring Security built-in | Password hashing |

### External Integrations

| Service | Library | Version | Purpose |
|---------|---------|---------|---------|
| **PayOS** | PayOS SDK | 2.0.1 | Payment gateway |
| **Google Gemini** | google-generativeai | Latest | AI chat & receipts |
| **Brevo** | SMTP (JavaMail) | Built-in | Email service |

## Frontend (React + Vite)

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI library |
| **React Router** | 7.13.1 | Client-side routing |
| **Vite** | 8.0 beta | Build tool & dev server |

### Styling

| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 4.2.1 | Utility-first CSS |

### HTTP & Data

| Technology | Version | Purpose |
|------------|---------|---------|
| **Axios** | Latest | HTTP client |

### Visualization

| Technology | Version | Purpose |
|------------|---------|---------|
| **Recharts** | 3.8.0 | React charts library |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **npm** | Package manager |

## Mobile (React Native + Expo)

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Native** | 0.79.6 | Cross-platform framework |
| **Expo** | 53.0.12 | Build & deployment platform |
| **React Navigation** | 7.x | Screen navigation |

### Storage

| Technology | Version | Purpose |
|------------|---------|---------|
| **AsyncStorage** | 2.1.2 | Persistent local storage |

### HTTP & Data

| Technology | Version | Purpose |
|------------|---------|---------|
| **Axios** | Latest | HTTP client |

### Development Tools

| Tool | Purpose |
|------|---------|
| **npm** | Package manager |
| **Expo CLI** | Development & deployment |

## Cross-Platform Stack

### APIs & Services

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **PayOS** | Vietnamese payment gateway | Available |
| **Google Gemini** | AI/ML features | Free API tier |
| **Brevo** | Email service (SMTP) | 300 emails/day free |
| **MySQL** | Hosted database | Self-hosted or cloud |

## Development Environment

### Minimum Requirements

| Component | Minimum |
|-----------|---------|
| **Node.js** | 18.x |
| **Java** | JDK 21 |
| **Maven** | 3.9+ |
| **MySQL** | 8.0+ |

### Recommended Tools

- **VS Code** with extensions: Java, React, React Native
- **Docker**: Local containerization
- **Postman**: API testing
- **Git**: Version control
- **Android Studio** or **Xcode**: Mobile emulation

## Browser Compatibility

### Frontend (React + Vite)

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Performance Characteristics

### Backend

- Startup time: 10-15 seconds (cold start)
- Memory usage: 300-350MB (with JVM tuning)
- Response time: <100ms for typical queries
- Concurrent users: 100+ (Render free tier)

### Frontend

- Initial load: 2-3 seconds (with code splitting)
- Bundle size: ~200KB gzipped
- First contentful paint: <2 seconds

### Mobile

- App size: ~50MB (APK), ~100MB (IPA)
- Cold start: 2-3 seconds
- Warm start: <1 second

## Dependency Security

### Backend

- Spring Security: Regular updates in each Boot version
- JJWT: JWT standard compliance
- PayOS SDK: Official library, regular updates
- Brevo: Standard SMTP, encrypted credentials only

### Frontend

- React: Long-term support policy
- Tailwind: Regular feature updates, backward compatible
- Recharts: Maintained, security patches

### Mobile

- React Native: Regular community updates
- Expo: Regular releases with bug fixes and security patches
- AsyncStorage: Platform-level encryption available

## Upgrade Considerations

| Component | Upgrade Frequency | Effort |
|-----------|-------------------|--------|
| Spring Boot | Annually | Medium (breaking changes) |
| Java | Annually | Low (LTS versions) |
| React | 6 months | Low (mostly backward compatible) |
| React Native | 3-6 months | High (platform-specific issues) |
| Dependencies | Quarterly | Medium (security patches) |

## Rationale for Choices

- **Spring Boot 4.0**: Latest LTS, strong ecosystem, excellent documentation
- **Java 21**: Modern language features, LTS support until 2028
- **React 19**: Latest features, improved hooks, better performance
- **React Native 0.79**: Stable, good community support, Expo integration
- **Vite 8 beta**: Fast dev server, excellent build performance
- **Tailwind CSS 4**: Modern utility system, great DX
- **PayOS**: Local payment solution for Vietnamese market
- **Google Gemini**: Cost-effective AI for financial advice
- **Brevo**: Reliable email service for startup budget
