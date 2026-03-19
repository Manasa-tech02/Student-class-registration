# student_registration_app

An Expo (React Native) frontend + Express.js backend, backed by Postgres.

## Repo structure
- `backend/`: Express + Prisma (Postgres via `DB_URL` from the root `.env`)
- `frontend/`: Expo app (calls the backend)

## Prerequisites
- Node.js
- A running Postgres database configured by your root `.env` (`DB_URL`)

## Backend
1. Install dependencies
   - `cd backend`
   - `npm install`
2. Start dev server
   - `npm run dev`
3. Health check
   - `GET http://localhost:3000/health`

## Frontend (Expo)
1. Install dependencies
   - `cd frontend`
   - `npm install`
2. Start
   - `npm run web` (fast for sanity-checks) or `npm run android` / `npm run ios`
3. API URL
   - The app reads `EXPO_PUBLIC_API_URL` from `frontend/.env` (default: `http://localhost:3000`)

## Notes
On a physical device/emulator, `localhost` may not point to your Mac. If the app can’t reach the API,
set `EXPO_PUBLIC_API_URL` to your machine’s LAN IP (or use Expo dev server/tunneling).
