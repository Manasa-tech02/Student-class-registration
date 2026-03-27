# Whole Application Document (Student Registration + Course Enrollment)

## 1. Project Overview
This application is a university-style student registration and course enrollment system with two roles:

- `student`: can browse courses, enroll, and view enrolled courses.
- `admin`: can view students, view student course enrollment history, and manage courses (CRUD) and course enrollments.

The system is split into three main parts:

- Frontend: React Native (Expo) mobile app
- Backend: Node.js + Express REST API
- Database: PostgreSQL accessed via Prisma ORM

Why split the system this way:
- Frontend focuses on user experience (screens, navigation, and presenting course/enrollment data).
- Backend focuses on business rules, authentication/authorization, and safe data access.
- Database focuses on durable storage and relationships between users, courses, and enrollments.

---

## 2. Implemented Features

### 2.1 Authentication & Authorization
- `POST /auth/signup`: students can sign up (admin role is not exposed through signup; role is always set to `student` on creation).
- `POST /auth/login`: login for either `student` or `admin` accounts (role mismatch returns `403`).
- `GET /auth/me`: returns the authenticated user profile (requires access token).
- `POST /auth/refresh`: refreshes JWT access tokens using the refresh token.
- `POST /auth/logout`: clears authorization session on the client (backend returns `204`).
- Role-based access control:
  - `requireAuth` guards endpoints by validating the `Authorization: Bearer <token>` header.
  - `requireAdmin` guards `/admin/*` endpoints so only `role === "admin"` users can access them.

### 2.2 Course Catalog (Student)
- `GET /courses` (requires auth): fetches all courses ordered by newest.
- Frontend screens:
  - Course catalog list with search by `class_name` and `professor`
  - Course detail page with a “Register for this Course” action

### 2.3 Enrollment (Student)
- `POST /enrolled` (requires auth): enroll the logged-in student in a course.
- `DELETE /enrolled` (requires auth): drop a course enrollment (API exists; the current UI primarily supports enrollment from the course detail screen).
- `GET /enrolled/courses` (requires auth): list the logged-in student’s enrolled courses.

Important enrollment rule:
- A student can only enroll once per course (`Enrollment` has `@@unique([student_id, course_id])`).
- On duplicate enrollment, the backend returns a `409` and the frontend handles it by marking the student as “Enrolled”.

### 2.4 Admin Dashboard & Management
- `GET /admin/stats` (requires admin): returns:
  - number of students
  - number of courses
  - number of enrollments
- `GET /admin/students` (requires admin): list all students (optional `?search=` filter).
- `GET /admin/students/:id` (requires admin): detailed student info + enrolled courses.
- Course management (CRUD) (requires admin):
  - `POST /admin/courses`: create course
  - `PUT /admin/courses/:id`: update course
  - `DELETE /admin/courses/:id`: delete course (also deletes its enrollments)
- Course enrollment management (requires admin):
  - `GET /admin/courses/:id/enrollments`: list students enrolled in a course (+ enrollment id/date)
  - `DELETE /admin/enrollments/:id`: remove a student from a course

Seeded admin account:
- `prisma/seed.ts` upserts an `admin@university.edu` admin user at seed time.

---

## 3. Tech Stack (and Why)

### 3.1 Frontend (Mobile App)
- Expo + React Native for cross-platform mobile UI.
- React Navigation (`@react-navigation/native` and `@react-navigation/native-stack`) to support role-based app flows:
  - Auth flow (Login/Signup)
  - Student flow (Dashboard, Course Catalog, Course Detail, My Courses)
  - Admin flow (Admin Dashboard, Students, Student Detail, Course Management)
- Redux Toolkit:
  - RTK Query for calling the backend, caching results, and handling re-fetch/invalidation.
  - `authSlice` to keep the logged-in user profile and token state in one place.
- Secure token storage:
  - `expo-secure-store` stores the access token and refresh token safely on the device.

Purpose of these choices:
- Expo/React Native lets the app run on mobile platforms using one codebase, which reduces development time and maintenance.
- React Navigation provides a clear and user-friendly UX separation between students and admins, based on authentication state.
- RTK Query reduces boilerplate by handling loading/error states for API calls and keeping the UI in sync when data changes.
- Redux Toolkit keeps app state predictable (especially auth state) so the UI updates correctly after login/logout or token refresh.
- SecureStore is used because JWT tokens are sensitive; storing them safely reduces the risk of token theft.

### 3.2 Backend (REST API)
- Express (HTTP server + routing)
- TypeScript for type safety across controllers/services/middleware.
- Security & hardening middleware:
  - `helmet` for safer HTTP headers.
  - `cors` to control which origins can access the API.
  - `express-rate-limit` on `/auth` routes to limit repeated login attempts.
- Input validation:
  - `zod` schemas validate request bodies before calling services.
- Password security:
  - `bcrypt` hashes passwords before saving them to the database.
- Stateless authentication:
  - JWT access tokens (short lived).
  - JWT refresh tokens (longer lived).

Purpose of these choices:
- Express is used to build a straightforward REST API that the mobile app can call over HTTP.
- TypeScript helps prevent common bugs by enforcing types across request handling, business logic, and responses.
- Helmet/CORS/rate-limiting address security and abuse prevention so the system is safer for real users.
- Zod validation prevents malformed requests from reaching the database layer (reducing crashes and bad data).
- Bcrypt ensures user passwords are not stored as plain text, protecting users even if the database is exposed.
- JWT authentication enables stateless request verification. That improves reliability and makes it easier to scale the backend because token verification does not require server-side session storage.
- The routes/controller/service separation keeps the code maintainable: controllers handle HTTP shape, services handle business rules, and Prisma handles database operations.

### 3.3 Database Layer
- PostgreSQL as the relational database.
- Prisma as the ORM:
  - Prisma schema defines the data model
  - Prisma Client generates typed database access code
- Prisma adapter:
  - `@prisma/adapter-pg` connects Prisma to PostgreSQL.

Purpose of these choices:
- PostgreSQL is a strong fit for relational data like users, courses, and enrollments, where enrollments act like a many-to-many relationship.
- Prisma reduces development complexity by providing a typed ORM layer. This makes queries safer and reduces runtime errors (especially when selecting only the fields needed by the UI).
- Using Prisma also centralizes schema changes in `schema.prisma`, making migrations and documentation clearer.

---

## 4. Database Schema (Prisma Models)
Prisma models in `backend/prisma/schema.prisma`:

### 4.1 `User` (mapped to `students`)
- `id`: `String` primary key (`cuid()`)
- `first_name`, `last_name`
- `email`: unique
- `student_id`: optional unique identifier
- `password`: stored as `bcrypt` hash
- `role`: default `"student"` (admin seeded with `"admin"`)
- `created_at`

### 4.2 `Course` (mapped to `courses`)
- `id`: primary key
- `class_name`
- `professor`
- `duration`
- `rating` (float, 0..5 enforced in admin validation)
- `description`
- `capacity` (int)
- `created_at`

### 4.3 `Enrollment` (mapped to `enrollments`)
- `id`: primary key
- `student_id` -> `User.id`
- `course_id` -> `Course.id`
- `created_at`
- Composite uniqueness:
  - `@@unique([student_id, course_id])`

This uniqueness is what enforces “no duplicate enrollment” at the database level.

---

## 5. API Design (Backend Endpoints)

### Public
- `GET /health`:
  - returns `{ status: "ok" }`

### Auth (`/auth`)
- `POST /auth/signup` (create student)
- `POST /auth/login` (login + return tokens)
- `GET /auth/me` (requires access token)
- `POST /auth/refresh` (refresh tokens)
- `POST /auth/logout` (requires access token)

### Student Course APIs
- `GET /courses` (requires auth)
- `POST /enrolled` (requires auth)
- `DELETE /enrolled` (requires auth)
- `GET /enrolled/courses` (requires auth)

### Admin APIs
- `GET /admin/stats` (requires admin role)
- `GET /admin/students` (requires admin role)
- `GET /admin/students/:id` (requires admin role)
- `POST /admin/courses` (requires admin role)
- `PUT /admin/courses/:id` (requires admin role)
- `DELETE /admin/courses/:id` (requires admin role)
- `GET /admin/courses/:id/enrollments` (requires admin role)
- `DELETE /admin/enrollments/:id` (requires admin role)

---

## 6. Frontend-to-Backend Data Flow

### 6.1 Token persistence + automatic refresh (client side)
- On app start:
  - the app reads an access token from `expo-secure-store`.
  - it calls `GET /auth/me` to load the user profile.
- During API usage:
  - the RTK Query base query attaches `Authorization: Bearer <accessToken>`
  - if the backend responds with `401`, the client calls `POST /auth/refresh`
  - if refresh succeeds, tokens are updated and the original request is retried
  - if refresh fails, tokens are cleared and the user is logged out

Purpose of this design:
- It gives a good user experience by keeping sessions alive automatically.
- It prevents the UI from having to manually handle token expiration for every screen.
- It centralizes security-sensitive behavior (token refresh and clearing) inside the API layer.

### 6.2 Role-based navigation
- `RootNavigator` checks the stored auth state:
  - no token -> `AuthStack`
  - token + `user.role === "admin"` -> `AdminStack`
  - token + `user.role !== "admin"` -> `MainStack` (student)

Purpose of this design:
- The user never sees screens they cannot access.
- The UI becomes simpler because screens can assume the correct role (student vs admin).

---

## 7. Security Notes / Important Implementation Details
- Passwords are never stored in plain text:
  - `bcrypt.hash(password, 10)` in `authService.signupUser`.
  - `bcrypt.compare` in `authService.loginUser`.
- Request bodies are validated in controllers:
  - controller layer uses `zod.parse(...)`.
- `/auth` is rate-limited to reduce brute-force attempts.
- JWT access tokens have a default expiry of `15 minutes`; refresh tokens default to `7 days`.
- `backend/src/middleware/requireAuth.ts` validates tokens and populates `req.user = { id, role }`.
- `backend/src/middleware/requireAdmin.ts` blocks non-admin users with `403`.

---

## 8. Current Limitations (Based on Implemented Code)
- Course capacity is stored and displayed in admin/student UI, but enrollment does not currently enforce capacity limits on the backend.
- Student “drop course” UI is not clearly present; the backend supports dropping via `DELETE /enrolled`.

---

## 9. Environment Variables (How the system is configured)

### Frontend
- `EXPO_PUBLIC_API_URL`
  - base URL used by RTK Query `fetchBaseQuery({ baseUrl })`

### Backend
- `DB_URL` (or `DATABASE_URL`)
  - database connection string for Prisma
- `JWT_SECRET`, `JWT_REFRESH_SECRET`
  - signing secrets for access/refresh tokens
- `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`
  - token expiry durations
- `CORS_ORIGIN` (optional)
  - allows configuring CORS origin restrictions

