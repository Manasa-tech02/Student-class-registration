# Student Registration App — Whole Application (Tech Stack + Why)

## 1. What the App Does (Purpose)
This is a university-style student registration and course enrollment mobile app with two roles:

- `student`: browse available courses, register/enroll, and view their enrolled courses.
- `admin`: view students and their enrolled courses, and manage the course catalog (create/edit/delete) and course enrollments (remove students from a course).

The app is split into:
- Frontend (mobile UI)
- Backend (REST API + authentication/authorization + business logic)
- Database (persistent storage)

Why this split:
- Frontend focuses on user experience and UI flows.
- Backend enforces security and business rules and exposes clean APIs.
- Database stores durable relational data and relationships between users, courses, and enrollments.

## 2. Main Implemented Features

### 2.1 Authentication (Auth)
- Student signup: `POST /auth/signup` (creates a `student` user; role is not granted via signup).
- Login: `POST /auth/login` (can login as `student` or `admin`; role mismatch is rejected).
- Profile: `GET /auth/me` (returns the logged-in user).
- Token refresh: `POST /auth/refresh` (used when access tokens expire).
- Logout: `POST /auth/logout`.

Security model:
- Backend uses JWT access tokens and refresh tokens.
- Protected routes require a valid access token (`requireAuth`).
- Admin routes require an admin role (`requireAdmin`).

### 2.2 Student Course Experience
- Course catalog: `GET /courses` (auth required) for viewing courses.
- Course details: UI page for a selected course.
- Enroll / drop:
  - Enroll: `POST /enrolled`
  - Drop: `DELETE /enrolled`
- My courses: `GET /enrolled/courses` (auth required).

Database-enforced rule:
- Enrollment uniqueness is enforced by Prisma with `@@unique([student_id, course_id])`, preventing duplicate enrollments.

### 2.3 Admin Management
- Admin stats: `GET /admin/stats` (counts of students/courses/enrollments).
- Students list: `GET /admin/students` (supports `?search=`).
- Student detail: `GET /admin/students/:id` (includes enrolled courses).
- Course CRUD:
  - Create: `POST /admin/courses`
  - Update: `PUT /admin/courses/:id`
  - Delete: `DELETE /admin/courses/:id` (also removes related enrollments)
- Manage course enrollments:
  - View enrolled students: `GET /admin/courses/:id/enrollments`
  - Remove enrollment: `DELETE /admin/enrollments/:id`

An admin user is provided by seeding:
- `prisma/seed.ts` upserts `admin@university.edu` so the admin login works immediately.

## 3. Tech Stack (and Why We Used It)

### 3.1 Frontend Tech
- **React Native + Expo**
  - Purpose: build a cross-platform mobile app (Android/iOS) with one codebase.
  - Why: Expo simplifies setup, runs quickly during development, and supports the mobile UI required for course browsing and management.

- **React Navigation**
  - Purpose: manage screen transitions and separate flows.
  - Why: navigation stacks allow a clean role-based UX (Auth → Student or Admin).

- **Redux Toolkit**
  - Purpose: store global auth state (logged-in user + token state).
  - Why: predictable state updates make the UI stable when logging in, logging out, or refreshing tokens.

- **RTK Query**
  - Purpose: call backend APIs, handle loading/errors, and manage caching/invalidation.
  - Why: reduces manual networking code and keeps the UI synced when enrollment/course data changes.

- **`expo-secure-store` for token storage**
  - Purpose: store JWT access/refresh tokens safely on-device.
  - Why: tokens are sensitive; SecureStore reduces risk compared to plain storage.

Frontend token strategy (purpose):
- On app start, the client reads tokens from SecureStore and fetches the user profile (`GET /auth/me`).
- During API calls, if the backend returns `401`, RTK Query triggers `POST /auth/refresh`, updates tokens, and retries the original request.
- If refresh fails, tokens are cleared and the user is logged out.

### 3.2 Backend Tech
- **Express (REST API)**
  - Purpose: handle HTTP routes and provide API endpoints used by the mobile app.
  - Why: straightforward REST patterns match the app’s data fetching and actions.

- **TypeScript**
  - Purpose: type safety across controllers, services, and middleware.
  - Why: reduces runtime mistakes and improves maintainability.

- **Security middleware**
  - **Helmet**: sets protective HTTP headers (helps prevent common web attacks).
  - **CORS**: restricts which origins can call the API.
  - **express-rate-limit**: rate-limits `/auth` to reduce brute-force login attempts.

- **Zod validation**
  - Purpose: validate request bodies before they touch the service/database.
  - Why: prevents malformed input, reduces crashes, and improves data integrity.

- **bcrypt**
  - Purpose: hash passwords before saving them.
  - Why: passwords are never stored in plain text.

- **JWT access + refresh tokens**
  - Purpose: stateless authentication for every request.
  - Why:
    - Access tokens are short-lived (limits damage window).
    - Refresh tokens allow the user to stay logged in without forcing re-login.
    - Stateless auth simplifies scaling because the server doesn’t need session storage.

Backend separation (purpose):
- Routes define endpoints.
- Controllers validate input and shape HTTP responses.
- Services implement business logic and call Prisma to access data.

### 3.3 Database Tech
- **PostgreSQL**
  - Purpose: relational database for users, courses, and enrollments.
  - Why: enrollments create a natural many-to-many relationship between students and courses.

- **Prisma ORM + Prisma schema**
  - Purpose: provide a typed, safe way to query and manage relational data.
  - Why:
    - The schema is the single source of truth for tables and relationships.
    - Prisma Client generates typed queries, reducing mistakes.
    - Prisma cleanly enforces constraints like unique enrollments.

## 4. Database Design Summary (Prisma Models)
Prisma schema defines three core models:

- `User` (mapped to table `students`)
  - Fields: name, unique `email`, optional unique `student_id`, hashed `password`, and `role`.
  - `role` supports `student` and `admin`.

- `Course` (mapped to `courses`)
  - Fields: `class_name`, `professor`, `duration`, `rating`, `description`, `capacity`.

- `Enrollment` (mapped to `enrollments`)
  - Links `student_id` → `User.id` and `course_id` → `Course.id`.
  - Enforces `@@unique([student_id, course_id])` to prevent duplicate enrollments.

## 5. How Frontend, Backend, and Database Work Together (Big Picture)
1. User signs up/logs in on the mobile app.
2. Backend validates input (Zod), hashes passwords (bcrypt), and stores/retrieves data via Prisma.
3. Backend returns JWT tokens.
4. Frontend stores tokens securely (SecureStore) and attaches them to API requests.
5. Protected backend routes verify JWT (`requireAuth`) and check admin role (`requireAdmin`).
6. Enrollment and course changes update the database; RTK Query refreshes relevant UI data using caching/invalidation.

## 6. Environment Variables (Where Config Lives)
- Frontend: `EXPO_PUBLIC_API_URL`
  - Used as the base URL for API calls.
- Backend: `DB_URL` (or `DATABASE_URL`)
  - Prisma database connection string.
- Backend auth: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`
  - Controls token signing and expiration.

