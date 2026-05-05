---
title: Build & Run Commands
description: Commands for building and running all sub-projects
applyTo: ["Backend/**", "Frontend/**", "Mobile/**"]
---

# Build & Run Commands

## Backend (Spring Boot)

```bash
cd Backend/moneymanager
```

### Common Commands

| Command | Purpose |
|---------|---------|
| `mvn clean package` | Build JAR artifact |
| `mvn spring-boot:run` | Run application locally (requires `.env`) |
| `mvn test` | Run all tests |
| `mvn test -Dtest=ClassName#methodName` | Run single test method |

### API Access
- **Base URL**: `http://localhost:8080/api/v1.0`
- **Port**: 8080 (configured in `.env` with `SERVER_PORT`)

### Docker

From project root:

```bash
docker build -t moneymanager-backend .
docker run -p 8080:8080 --env-file .env moneymanager-backend
```

---

## Frontend (React + Vite)

```bash
cd Frontend
```

### Common Commands

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |

### Development Server
- **URL**: `http://localhost:3000`
- **Auto-reload**: Enabled

---

## Mobile (React Native + Expo)

```bash
cd Mobile
```

### Common Commands

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm start` | Start Expo dev server |
| `npm run android` | Launch Android emulator |
| `npm run ios` | Launch iOS simulator |
| `npm run web` | Run web version |

### Platform Support
- Android emulator
- iOS simulator  
- Web browser
- Physical devices (via Expo app)
