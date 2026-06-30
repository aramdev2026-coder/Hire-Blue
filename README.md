# Aram FTC

Aram FTC is a comprehensive platform connecting blue-collar workers with employers through a seamless, automated matching engine.

## Architecture
This repository contains a full-stack monorepo:
1. **`backend/`**: Node.js/Express REST API serving as the central nervous system. Uses PostgreSQL (Neon) via Prisma ORM.
2. **`admin_portal/`**: React/Vite SPA for Super Admins and Sub-Admins to manage candidates, verify employers, and monitor metrics.
3. **`user_portal/`**: React/Vite SPA for Candidates (mobile-first registration wizard) and Employers (job posting & candidate matching).

## Features
- **OTP Authentication**: Passwordless SMS OTP via 2Factor API for candidates.
- **Automated Matching Engine**: Recommends candidates based on role, location, and experience.
- **Role-Based Access Control (RBAC)**: Distinct permissions for Super Admins, Sub-Admins, Employers, and Candidates.
- **Stateful Registration Wizard**: Candidates can pause and resume their multi-step registration.

## Getting Started

### 1. Database Setup
Ensure you have a PostgreSQL database. Set the connection string in your `.env` file.
```bash
cd backend
npx prisma generate
npx prisma db push
npm run seed
```

### 2. Environment Variables
Create `.env` files in each of the three directories. See `.env.example` in each folder for the required variables.

### 3. Running Locally
You will need three separate terminal windows:
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Admin Portal
cd admin_portal && npm run dev

# Terminal 3: User Portal
cd user_portal && npm run dev
```

## Production Deployment
The backend is Docker-ready and configured for Render.com (`render.yaml`).
The frontends are configured for Vercel (`vercel.json`).

### Security Features
- **Rate Limiting:** Prevents brute force and DoS attacks on authentication endpoints.
- **Helmet & CORS:** Strict HTTP headers and origin enforcement.
- **Input Sanitization:** Blocks XSS and prototype pollution attacks on all inputs.
- **Bcrypt:** 12-round password hashing for employer and admin accounts.
