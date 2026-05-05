---
title: Project Overview
description: Fullstack financial management application architecture
applyTo: ["**/*.md", "**/*.java", "**/*.jsx", "**/*.js"]
---

# MoneyManager - Project Overview

## Application Structure

Fullstack financial management application with **three sub-projects sharing one backend**:

- **Backend**: Spring Boot REST API (Java 21, Maven)
  - Location: `Backend/moneymanager/`
  - API Base: `http://localhost:8080/api/v1.0`
  
- **Frontend**: React + Vite web application
  - Location: `Frontend/`
  - Dev Server: `http://localhost:3000`
  
- **Mobile**: React Native + Expo application
  - Location: `Mobile/`
  - Platform Support: Android, iOS, Web

## Key Features

- **Multi-tier subscription system** (FREE, BASIC, PREMIUM)
- **JWT-based authentication** (stateless, across all platforms)
- **Payment integration** via PayOS (Vietnamese payment gateway)
- **AI-powered features** using Google Gemini (receipt analysis, financial advice)
- **Email notifications** via Brevo SMTP relay
- **Financial tracking**: Income, Expenses, Budgets, Saving Goals
- **Responsive design** for all platforms

## Project Guidelines

- All backend configuration follows Spring Boot 4.0.3 best practices
- Frontend uses React Router v7 with modern Vite tooling
- Mobile uses React Navigation for consistent UX
- Subscription enforcement happens at the service layer
- Email and payment integrations are abstracted via services
