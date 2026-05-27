# La Fama Barber Shop — Management System

Full-stack web application for managing barbershop operations, built with a multi-role architecture for admins, barbers, and clients.

---

## Overview

La Fama is a real-world barbershop management system developed as a freelance project. It handles appointment scheduling, staff management, service tracking, and client authentication — replacing manual processes with a centralized digital platform.

---

## Tech Stack

**Backend**
- Node.js + Express 5
- Prisma ORM (PostgreSQL)
- JWT authentication + Google OAuth 2.0 (Passport.js)
- Zod (schema validation)
- Swagger UI (API documentation)
- Multer (file uploads)
- bcrypt (password hashing)

**Frontend**
- React
- Tailwind CSS / Bootstrap

---

## Features

- Multi-role access: admin, barber, and client views
- Appointment booking and scheduling system
- Staff and service management
- Google OAuth 2.0 login
- JWT-based session handling
- Input validation with Zod
- Auto-generated API docs with Swagger
- File upload support (profile images, assets)

---

## Project Structure

```
LaFamaBarberShop/
├── src/                  # Express backend (routes, controllers, middleware)
├── prisma/               # Database schema and migrations
├── lafama-frontend/      # React frontend
├── prisma.config.ts      # Prisma configuration
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google OAuth credentials (for social login)

### Installation

```bash
# Clone the repository
git clone https://github.com/edwingomezdev/LaFamaBarberShop.git
cd LaFamaBarberShop

# Install backend dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your DB connection string, JWT secret, and Google OAuth credentials

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Frontend setup

```bash
cd lafama-frontend
npm install
npm run dev
```

---

## API Documentation

Swagger UI is available at `http://localhost:3000/api-docs` when running locally.

---

## Status

Currently in active development. Core modules (auth, scheduling, staff management) are functional. Ongoing work on client-facing features and production deployment.

---

## Author

**Edwin Alejandro Gomez Ruiz**  
Full Stack Developer · Medellín, Colombia  
[LinkedIn](https://www.linkedin.com/in/edwin-gomezdev) · [GitHub](https://github.com/edwingomezdev)
