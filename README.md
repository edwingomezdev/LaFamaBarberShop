# La Fama Barber Shop — API

API REST para la gestión de una barbería: turnos, barberos, servicios, productos y membresías.

---

## Tech Stack

**Backend**
- Node.js + Express 5
- Prisma ORM (PostgreSQL)
- JWT + Google OAuth 2.0 (Passport.js)
- Zod (validación de entorno y requests)
- Pino (logging estructurado)
- Swagger UI (documentación de API)
- Multer (subida de archivos)
- bcryptjs (hash de contraseñas)

**Frontend**
- React + Tailwind CSS

---

## Arquitectura

```
src/
├── config/          # env.js (validación), logger.js, passport.js
├── controllers/     # Reciben request → llaman service → devuelven response
├── services/        # Lógica de negocio y acceso a Prisma
├── middlewares/     # auth.middleware.js, error.middleware.js, validate.middleware.js
├── routes/          # Definición de endpoints
├── jobs/            # Tareas programadas (cancelación de citas, membresías vencidas)
└── index.js         # Arranque del servidor
prisma/
├── schema.prisma    # Modelos y enums
└── migrations/
lafama-frontend/     # App React
```

---

## Endpoints principales

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/registro` | Crear cuenta | — |
| POST | `/api/auth/login` | Iniciar sesión | — |
| GET | `/api/citas` | Listar todas las citas | Admin |
| POST | `/api/citas` | Agendar cita | Cliente |
| GET | `/api/citas/mis-citas` | Mis citas | Cliente |
| GET | `/api/barberos` | Listar barberos | — |
| GET | `/api/servicios` | Listar servicios | — |
| GET | `/api/membresias` | Listar membresías | — |
| GET | `/api/usuarios` | Listar clientes | Admin |

Documentación completa en `/api-docs` (Swagger UI).

---

## Getting Started

### Requisitos

- Node.js 18+
- PostgreSQL
- Google OAuth credentials (opcional, para login social)

### Instalación

```bash
git clone https://github.com/edwingomezdev/LaFamaBarberShop.git
cd LaFamaBarberShop

npm install

cp .env.example .env
# Edita .env con tus valores

npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd lafama-frontend
npm install
npm run dev
```

---

## Variables de entorno

Ver `.env.example` para la lista completa con descripción de cada variable.

El servidor **no arranca** si alguna variable requerida falta o es inválida.

---

## Author

**Edwin Alejandro Gomez Ruiz** — Full Stack Developer · Colombia  
[LinkedIn](https://www.linkedin.com/in/edwin-gomezdev) · [GitHub](https://github.com/edwingomezdev)
