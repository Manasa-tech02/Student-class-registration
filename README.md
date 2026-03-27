# Student Class Registration App

A full-stack mobile application for student course registration with role-based access for students and admins.

## Overview

This project includes:

- `frontend`: React Native (Expo) mobile app
- `backend`: Node.js + Express REST API
- `database`: PostgreSQL accessed with Prisma ORM

### Roles

- **Student**
  - Sign up / login
  - Browse courses
  - Enroll in courses
  - View enrolled courses
- **Admin**
  - View dashboard stats
  - Manage courses (create, update, delete)
  - View students and enrollment history
  - Remove enrollments

## Tech Stack

### Frontend (`frontend`)

- **React Native `0.83`**
  - Purpose: build one mobile app codebase for Android/iOS style screens.
- **Expo SDK `55`**
  - Purpose: faster mobile development, local testing, and build tooling.
- **TypeScript**
  - Purpose: type safety and fewer runtime bugs in UI/API integration.
- **React Navigation**
  - Purpose: clean app flows for Auth, Student, and Admin screens.
- **Redux Toolkit + RTK Query**
  - Purpose: centralized state and API caching/re-fetching with less boilerplate.
- **expo-secure-store**
  - Purpose: securely store auth tokens on device.

### Backend (`backend`)

- **Node.js + Express `5`**
  - Purpose: lightweight REST API for auth, courses, and enrollments.
- **TypeScript**
  - Purpose: safer backend logic across controllers/services/middleware.
- **Prisma `7`**
  - Purpose: typed ORM for reliable database access and schema management.
- **PostgreSQL**
  - Purpose: relational storage for users, courses, and enrollments.
- **Zod**
  - Purpose: validate request payloads before business logic runs.
- **JWT (access + refresh tokens)**
  - Purpose: stateless authentication with session continuity via refresh.
- **bcrypt**
  - Purpose: hash passwords so plain text credentials are never stored.
- **Helmet, CORS, express-rate-limit, Morgan**
  - Purpose: security headers, origin control, brute-force protection, and request logging.

## Tools Used

- **Git + GitHub**
  - Purpose: version control, collaboration, backup, and deployment-ready history.
- **npm**
  - Purpose: dependency and script management for frontend/backend apps.
- **Prisma CLI**
  - Purpose: schema generation, migrations, and database seeding.
- **Expo CLI**
  - Purpose: run, debug, and build the React Native app quickly.
- **Cursor/VS Code**
  - Purpose: code editing, terminal workflows, and productivity tooling.

## Project Structure

```text
student-registration-app/
├─ backend/
│  ├─ prisma/
│  └─ src/
├─ frontend/
│  └─ src/
├─ WHOLE_APPLICATION_DOCUMENT.md
└─ WHOLE_APPLICATION_DOCUMENT_2PAGES.md
```

## API Highlights

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/refresh`
- `GET /courses`
- `POST /enrolled`
- `GET /enrolled/courses`
- `GET /admin/stats`
- `GET /admin/students`
- `POST /admin/courses`
- `PUT /admin/courses/:id`
- `DELETE /admin/courses/:id`

## Database Schema

The backend uses PostgreSQL with Prisma. The core tables are:

### `students` (Prisma `User`)

- `id` (String, PK, `cuid()`)
- `first_name` (String)
- `last_name` (String)
- `email` (String, unique)
- `student_id` (String, unique, nullable)
- `password` (String, hashed)
- `role` (String, default: `student`)
- `created_at` (DateTime, default: `now()`)

### `courses` (Prisma `Course`)

- `id` (String, PK, `cuid()`)
- `class_name` (String)
- `professor` (String)
- `duration` (String)
- `rating` (Float)
- `description` (String)
- `capacity` (Int)
- `created_at` (DateTime, default: `now()`)

### `enrollments` (Prisma `Enrollment`)

- `id` (String, PK, `cuid()`)
- `student_id` (String, FK -> `students.id`)
- `course_id` (String, FK -> `courses.id`)
- `created_at` (DateTime, default: `now()`)
- Unique constraint: (`student_id`, `course_id`)

### Relationships

- One `student` can have many `enrollments`
- One `course` can have many `enrollments`
- Each `enrollment` belongs to exactly one `student` and one `course`

## Environment Variables

Create `.env` files in both apps.

### Frontend (`frontend/.env`)

```env
EXPO_PUBLIC_API_URL=http://<your-local-ip>:<backend-port>
```

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=*
```

## Getting Started

### 1) Clone Repository

```bash
git clone https://github.com/Manasa-tech02/Student-class-registration.git
cd Student-class-registration
```

### 2) Install Dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd ../frontend
npm install
```

### 3) Setup Database (Backend)

From `backend` folder:

```bash
npm run prisma:migrate
npm run prisma:seed
```

### 4) Run the App

Backend (Terminal 1):

```bash
cd backend
npm run dev
```

Frontend (Terminal 2):

```bash
cd frontend
npm start
```

Then run on device/emulator:

```bash
npm run android
```

## Security Notes

- Passwords are hashed with bcrypt
- JWT-based authentication with refresh flow
- Role-based authorization (`student`, `admin`)
- Rate limiting on auth routes
- Request validation with Zod

## Documentation

Detailed docs are included in:

- `WHOLE_APPLICATION_DOCUMENT.md`
- `WHOLE_APPLICATION_DOCUMENT_2PAGES.md`

## License

This project is for educational and portfolio use.

