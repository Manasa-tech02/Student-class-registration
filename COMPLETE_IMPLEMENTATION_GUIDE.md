# 📚 COMPLETE IMPLEMENTATION GUIDE - STUDENT REGISTRATION APP

## TABLE OF CONTENTS
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Phase-by-Phase Implementation Plan](#phase-by-phase-implementation-plan)
5. [Database Design](#database-design)
6. [API Specifications](#api-specifications)
7. [Frontend Architecture](#frontend-architecture)
8. [Testing & Deployment](#testing--deployment)
9. [Troubleshooting Guide](#troubleshooting-guide)

---

## 1. PROJECT OVERVIEW

### What is the Student Registration App?
A **production-ready, enterprise-grade course registration system** that allows students to:
- Create accounts and authenticate securely
- Browse and search for courses
- Register for courses with real-time seat availability
- Detect schedule conflicts before registration
- Manage waitlists with automatic enrollment
- View their course schedule
- Drop courses at any time

### Key Requirements
✅ Support 10,000+ concurrent users  
✅ Real-time seat updates (WebSocket)  
✅ Schedule conflict detection  
✅ Waitlist management with auto-enrollment  
✅ 90% query reduction with Redis caching  
✅ Secure authentication with JWT + bcrypt  
✅ ACID transactions for data integrity  
✅ Mobile-first (iOS/Android via React Native)  

### Success Metrics
- Registration completes in < 500ms
- Real-time updates < 100ms latency
- 99.9% uptime
- Zero race conditions
- Bcrypt password hashing (10 salt rounds)

---

## 2. SYSTEM ARCHITECTURE

### High-Level Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                   MOBILE APP (React Native)                 │
│              iOS & Android via Expo Framework               │
│         Redux State Management + Axios API Client           │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS + WebSocket
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              NODEJS + EXPRESS API SERVER                    │
│                    (Port 3000)                              │
│      Authentication | Courses | Registrations              │
│      Conflict Detection | Waitlist | Real-time             │
└──────────┬──────────────────┬──────────────────┬────────────┘
           │                  │                  │
           ▼                  ▼                  ▼
    ┌──────────────┐   ┌────────────┐   ┌─────────────────┐
    │  PostgreSQL  │   │   Redis    │   │   Socket.io     │
    │  Database    │   │   Cache    │   │   Real-time     │
    └──────────────┘   └────────────┘   └─────────────────┘

    ┌─────────────────────────────────────────┐
    │  FastAPI (Python) - AI Service          │
    │  Recommendations & Notifications        │
    │  (Port 8000)                            │
    └─────────────────────────────────────────┘
```

### Data Flow
```
1. Student Login
   Mobile App → Express API → PostgreSQL
   ↓ (JWT Token returned)
   Redux Store → Store Token

2. Browse Courses
   Mobile App → Express API → Redis Cache → PostgreSQL
   ↓ (Cached for 5 minutes)
   Display Courses

3. Register Course
   Mobile App → Express API → Check Capacity
                            → Check Conflicts
                            → PostgreSQL Transaction
   ↓ (Real-time update via Socket.io)
   Update Seat Count Across All Users

4. Waitlist Auto-Enrollment
   Cron Job → Check Waitlist → Seat Available?
           ↓ Yes
           → PostgreSQL Transaction
           → Notify Student via Socket.io
```

---

## 3. TECHNOLOGY STACK

### Frontend Stack
| Technology | Version | Purpose |
|-----------|---------|---------|
| React Native | 0.73+ | Cross-platform mobile framework |
| Expo | 51+ | React Native framework |
| Redux Toolkit | 1.9+ | State management |
| Axios | 1.6+ | HTTP client |
| TypeScript | 5.3+ | Type safety |
| React Navigation | 6.x | App routing |

**Why this stack?**
- Single codebase for iOS and Android
- Redux handles complex state (auth, courses, registrations)
- Axios provides interceptors for auth tokens
- TypeScript prevents runtime errors during development

### Backend Stack
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ LTS | JavaScript runtime |
| Express | 4.18+ | Web framework |
| TypeScript | 5.3+ | Type safety |
| PostgreSQL | 15+ | Database |
| Socket.io | 4.6+ | Real-time communication |
| Redis | 7+ | Caching layer |
| JWT | jsonwebtoken 9.0+ | Authentication |
| bcrypt | 5.1+ | Password hashing |

**Why this stack?**
- Non-blocking I/O handles 10,000+ concurrent users
- ExpressJS is lightweight and battle-tested
- PostgreSQL ensures ACID transactions
- Socket.io provides real-time updates at scale
- Redis reduces database queries by 90%
- JWT is stateless and scalable
- bcrypt is industry-standard for password security

### Database
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Primary DB | PostgreSQL 15+ | Relational data storage with ACID |
| Cache | Redis 7+ | Query results caching |
| Transactions | PostgreSQL Transactions | Race condition prevention |
| Indexes | B-tree indexes | Query performance |

---

## 4. PHASE-BY-PHASE IMPLEMENTATION PLAN

### Phase 1: Core Authentication & Course Management (Days 1-3)

#### Phase 1 Goals
- User registration and login
- JWT-based authentication with token refresh
- Course browsing and search
- Basic course registration with seat limits
- Drop courses functionality

#### Phase 1 Backend Tasks
1. **Setup Project**
   - [ ] Initialize Node.js with TypeScript
   - [ ] Configure Express server on port 3000
   - [ ] Setup environment variables (.env)
   - [ ] Connect to PostgreSQL database
   
2. **Database Schema**
   - [ ] Create `users` table (id, email, password_hash, created_at)
   - [ ] Create `courses` table (id, name, description, capacity, current_seats, schedule)
   - [ ] Create `registrations` table (id, user_id, course_id, registered_at)
   - [ ] Add indexes: users(email), registrations(user_id, course_id)

3. **Authentication Service**
   - [ ] Create `authService.ts` with registration/login logic
   - [ ] Hash passwords with bcrypt (10 salt rounds)
   - [ ] Generate JWT tokens with 1-hour expiration
   - [ ] Implement token refresh mechanism

4. **Authentication Routes**
   - [ ] POST `/auth/register` - Create new account
   - [ ] POST `/auth/login` - Login and get JWT token
   - [ ] POST `/auth/refresh` - Refresh expiring token
   - [ ] GET `/auth/me` - Get current user info

5. **Course Service**
   - [ ] Fetch all courses with search/filter
   - [ ] Get course details with seat availability
   - [ ] Implement simple course caching (5 min TTL)

6. **Course Routes**
   - [ ] GET `/courses` - List all courses with pagination
   - [ ] GET `/courses/:id` - Get single course details
   - [ ] GET `/courses/search?q=keyword` - Search courses

7. **Middleware**
   - [ ] Create `authMiddleware` for JWT verification
   - [ ] Create `errorHandler` for consistent error responses
   - [ ] Add input validation for all endpoints

#### Phase 1 Frontend Tasks
1. **Setup Project**
   - [ ] Initialize Expo project with TypeScript
   - [ ] Configure React Navigation
   - [ ] Setup Redux store

2. **Auth State Management**
   - [ ] Create `authSlice` reducer (login, logout, token)
   - [ ] Create `authService.ts` for API calls
   - [ ] Store JWT token in AsyncStorage

3. **Auth Screens**
   - [ ] Build LoginScreen component
   - [ ] Build SignUpScreen component
   - [ ] Add form validation

4. **Course Screens**
   - [ ] Build CourseListScreen with search
   - [ ] Build CourseDetailScreen
   - [ ] Show seat availability

#### Phase 1 Completion Checklist
- [ ] Backend running on localhost:3000
- [ ] PostgreSQL database with all tables
- [ ] User can register account
- [ ] User can login and receive JWT token
- [ ] User can browse courses
- [ ] User can register for a course (if seats available)
- [ ] Seat count decreases when user registers
- [ ] Frontend connects to backend API
- [ ] Error handling works for invalid requests

---

### Phase 2: Advanced Features - Conflicts & Waitlist (Days 4-5)

#### Phase 2 Goals
- Schedule conflict detection
- Waitlist management
- Automatic enrollment from waitlist
- Student schedule view

#### Phase 2 Backend Tasks
1. **Conflict Detection Service**
   - [ ] Create `conflictDetectionService.ts`
   - [ ] Implement time overlap checking algorithm
   - [ ] Cache available course times in Redis

2. **Conflict Detection Routes**
   - [ ] POST `/registrations/check-conflicts` - Check if course conflicts with existing
   - [ ] GET `/registrations/my-courses` - Get student's registered courses

3. **Waitlist Service**
   - [ ] Create `waitlistService.ts`
   - [ ] Implement auto-enrollment when seat becomes available
   - [ ] Create cron job to check waitlist every minute

4. **Waitlist Routes**
   - [ ] POST `/waitlist/join` - Join waitlist
   - [ ] GET `/waitlist/status` - Check waitlist position
   - [ ] DELETE `/waitlist/:id` - Remove from waitlist

5. **Database Updates**
   - [ ] Alter `registrations` to include status (registered/waitlisted)
   - [ ] Create `waitlist` table
   - [ ] Add triggers for seat updates

#### Phase 2 Frontend Tasks
1. **Conflict Detection UI**
   - [ ] Show conflicts on CourseDetailScreen
   - [ ] Display message if course conflicts

2. **Registration Flow**
   - [ ] Add confirmation dialog before registration
   - [ ] Show waitlist option if course full

3. **Student Schedule View**
   - [ ] Create ScheduleScreen component
   - [ ] Display registered courses in calendar format
   - [ ] Show conflicts visually

4. **Waitlist Management**
   - [ ] Show waitlist status on MyCoursesScreen
   - [ ] Allow joining/leaving waitlist

#### Phase 2 Completion Checklist
- [ ] Conflict detection works accurately
- [ ] User cannot register for conflicting courses
- [ ] Waitlist functional for full courses
- [ ] Auto-enrollment works when seat opens
- [ ] Student notified when enrolled from waitlist
- [ ] Schedule view shows all courses color-coded
- [ ] No race conditions in registration

---

### Phase 3: Real-time Updates with Socket.io (Days 6-7)

#### Phase 3 Goals
- Real-time seat availability updates
- Instant notifications for full courses
- Live registration confirmation
- Broadcast to all connected users

#### Phase 3 Backend Tasks
1. **Socket.io Setup**
   - [ ] Install Socket.io package
   - [ ] Configure Socket.io with Express
   - [ ] Implement room-based emission (one room per course)

2. **Socket Events**
   - [ ] `course:seatUpdate` - Broadcast when seat changes
   - [ ] `course:full` - Notify when course reaches capacity
   - [ ] `user:registered` - Confirm registration
   - [ ] `waitlist:enrolled` - Notify waitlist enrollment

3. **Socket Handler**
   - [ ] Create `socketHandler.ts`
   - [ ] Implement connection/disconnection
   - [ ] Join user to course rooms on login
   - [ ] Emit real-time updates on registration

#### Phase 3 Frontend Tasks
1. **Socket Connection**
   - [ ] Connect to Socket.io on app launch
   - [ ] Pass JWT token for authentication
   - [ ] Handle reconnection automatically

2. **Real-time Updates**
   - [ ] Update course seat count in real-time
   - [ ] Show "Course Full" notification instantly
   - [ ] Update MyCoursesScreen in real-time

3. **User Notifications**
   - [ ] Show toast notifications for seat updates
   - [ ] Show modal when enrolled from waitlist
   - [ ] Display real-time validation

#### Phase 3 Completion Checklist
- [ ] Socket.io successfully connects
- [ ] Seat updates broadcast to all users
- [ ] Course full notification appears in < 100ms
- [ ] Multiple users see same seat count
- [ ] No duplicate socket connections
- [ ] Graceful reconnection after network loss

---

### Phase 4: Performance & Caching (Days 7-8)

#### Phase 4 Goals
- 90% reduction in database queries
- Optimize database indexes
- Implement session management
- Rate limiting for API abuse

#### Phase 4 Backend Tasks
1. **Redis Caching Strategy**
   - [ ] Cache course list (5 min TTL)
   - [ ] Cache course details (5 min TTL)
   - [ ] Cache user registrations (1 min TTL)
   - [ ] Invalidate cache on registration/drop

2. **Database Optimization**
   - [ ] Add indexes on frequently queried columns
   - [ ] Analyze query performance with EXPLAIN
   - [ ] Create materialized views for complex queries

3. **Rate Limiting**
   - [ ] Implement rate limit middleware (100 req/min per IP)
   - [ ] Add special limits for auth endpoints (5 req/min)
   - [ ] Return 429 status with Retry-After header

4. **Session Management**
   - [ ] Implement refresh token rotation
   - [ ] Store active sessions in Redis
   - [ ] Auto-logout after 24 hours

#### Phase 4 Frontend Tasks
1. **Request Optimization**
   - [ ] Implement Redux selectors for memoization
   - [ ] Add request debouncing for search
   - [ ] Cache API responses in Redux

2. **Performance Monitoring**
   - [ ] Monitor API request times
   - [ ] Log slow queries (> 500ms)
   - [ ] Collect performance metrics

#### Phase 4 Completion Checklist
- [ ] Course list loads in < 200ms
- [ ] Course details load in < 300ms
- [ ] Database receives 90% fewer queries
- [ ] Rate limiting prevents abuse
- [ ] Refresh tokens rotate securely
- [ ] No cached data inconsistencies

---

### Phase 5: Intelligence & Analytics (Days 8-9)

#### Phase 5 Goals
- AI-powered course recommendations
- Workload warnings
- Student chatbot assistance
- Analytics dashboard

#### Phase 5 Backend Tasks
1. **FastAPI Python Service (Port 8000)**
   - [ ] Setup FastAPI with uvicorn
   - [ ] Implement ML recommendation engine
   - [ ] Train on historical registration data

2. **Recommendation Engine**
   - [ ] Accept user profile and preferences
   - [ ] Return top 5 course recommendations
   - [ ] Consider student GPA and major

3. **Workload Analysis**
   - [ ] Calculate credit hours for registered courses
   - [ ] Warn if > 18 credit hours
   - [ ] Suggest course drops if overloaded

4. **Analytics Endpoints** (Analytics Routes)
   - [ ] GET `/analytics/popular-courses` - Most registered courses
   - [ ] GET `/analytics/student-load` - Distribution of credit hours
   - [ ] GET `/analytics/registration-trends` - Time-based patterns

#### Phase 5 Frontend Tasks
1. **Recommendations Screen**
   - [ ] Create RecommendationsScreen component
   - [ ] Display AI-recommended courses
   - [ ] Show confidence score for each recommendation

2. **Workload Indicator**
   - [ ] Display total credit hours
   - [ ] Show warning if overloaded
   - [ ] Suggest courses to drop

3. **Chatbot Integration** (Optional)
   - [ ] Add chatbot for course questions
   - [ ] Natural language understanding
   - [ ] Integration with recommendation engine

#### Phase 5 Completion Checklist
- [ ] Recommendations appear on home screen
- [ ] AI suggests relevant courses
- [ ] Workload warnings appear when applicable
- [ ] Analytics dashboard shows trends
- [ ] Chatbot responds to course questions

---

## 5. DATABASE DESIGN

### Schema Overview
```sql
-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  gpa DECIMAL(3,2),
  major VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Courses Table
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  description TEXT,
  instructor_id INTEGER REFERENCES users(id),
  capacity INTEGER NOT NULL,
  current_seats INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  days VARCHAR(50) NOT NULL, -- 'MWF' or 'TR'
  location VARCHAR(255),
  credits INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Registrations Table
CREATE TABLE registrations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'registered', -- 'registered' or 'waitlisted'
  registered_at TIMESTAMP DEFAULT NOW(),
  dropped_at TIMESTAMP,
  UNIQUE(user_id, course_id)
);

-- Waitlist Table
CREATE TABLE waitlist (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  joined_at TIMESTAMP DEFAULT NOW(),
  auto_enrolled BOOLEAN DEFAULT FALSE,
  enrolled_at TIMESTAMP,
  UNIQUE(user_id, course_id)
);
```

### Indexes
```sql
-- Speed up lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_registrations_user ON registrations(user_id);
CREATE INDEX idx_registrations_course ON registrations(course_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_waitlist_course ON waitlist(course_id);
CREATE INDEX idx_courses_code ON courses(code);
```

### Triggers (for data integrity)
```sql
-- Update current_seats when registration is added
CREATE TRIGGER update_seats_on_registration
AFTER INSERT ON registrations
FOR EACH ROW
WHEN (NEW.status = 'registered')
BEGIN
  UPDATE courses SET current_seats = current_seats - 1
  WHERE id = NEW.course_id;
END;

-- Update current_seats when registration is dropped
CREATE TRIGGER update_seats_on_drop
AFTER UPDATE ON registrations
FOR EACH ROW
WHEN (NEW.dropped_at IS NOT NULL AND OLD.dropped_at IS NULL)
BEGIN
  UPDATE courses SET current_seats = current_seats + 1
  WHERE id = NEW.course_id;
END;
```

---

## 6. API SPECIFICATIONS

### Authentication Endpoints

**POST /auth/register**
```json
Request:
{
  "email": "student@university.edu",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "major": "Computer Science"
}

Response (201):
{
  "id": 1,
  "email": "student@university.edu",
  "firstName": "John",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

**POST /auth/login**
```json
Request:
{
  "email": "student@university.edu",
  "password": "SecurePass123!"
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "refreshToken": "refresh_token_here"
}
```

**POST /auth/refresh**
```json
Request:
{
  "refreshToken": "refresh_token_here"
}

Response (200):
{
  "token": "new_jwt_token",
  "expiresIn": 3600
}
```

### Course Endpoints

**GET /courses**
```json
Query Params: page=1&limit=20&search=Math

Response (200):
{
  "data": [
    {
      "id": 1,
      "name": "Calculus I",
      "code": "MATH101",
      "instructor": "Dr. Smith",
      "capacity": 30,
      "currentSeats": 5,
      "startTime": "09:00",
      "endTime": "10:15",
      "days": "MWF",
      "credits": 3
    }
  ],
  "total": 150,
  "page": 1,
  "pages": 8
}
```

**GET /courses/:id**
```json
Response (200):
{
  "id": 1,
  "name": "Calculus I",
  "code": "MATH101",
  "description": "Introduction to differential calculus...",
  "instructor": "Dr. Smith",
  "capacity": 30,
  "currentSeats": 5,
  "startTime": "09:00",
  "endTime": "10:15",
  "days": "MWF",
  "location": "Science Hall 101",
  "credits": 3,
  "isRegistered": false,
  "isWaitlisted": false
}
```

### Registration Endpoints

**POST /registrations**
```json
Request:
{
  "courseId": 1
}

Response (201):
{
  "id": 42,
  "courseId": 1,
  "courseName": "Calculus I",
  "status": "registered",
  "registeredAt": "2026-03-17T12:34:56Z"
}

Error (409 - Conflict):
{
  "error": "Schedule conflict with PHYS101"
}

Error (410 - Course full):
{
  "error": "Course at capacity. Added to waitlist.",
  "waitlistPosition": 3
}
```

**GET /registrations/my-courses**
```json
Response (200):
{
  "registered": [
    {
      "id": 42,
      "courseId": 1,
      "courseName": "Calculus I",
      "credits": 3,
      "startTime": "09:00",
      "endTime": "10:15"
    }
  ],
  "waitlisted": [
    {
      "courseId": 2,
      "courseName": "Physics I",
      "position": 3
    }
  ],
  "totalCredits": 12
}
```

**DELETE /registrations/:courseId**
```json
Response (200):
{
  "message": "Successfully dropped course",
  "courseId": 1
}
```

### Conflict Detection Endpoint

**POST /registrations/check-conflicts**
```json
Request:
{
  "courseId": 1
}

Response (200):
{
  "hasConflict": false,
  "conflicts": []
}

Response (200 - With conflicts):
{
  "hasConflict": true,
  "conflicts": [
    {
      "existingCourse": "PHYS101",
      "newCourse": "PHYS102",
      "reason": "Time overlap: 10:00-11:30 both days"
    }
  ]
}
```

---

## 7. FRONTEND ARCHITECTURE

### Folder Structure
```
frontend/
├── App.tsx                          # Main app component
├── app.json                         # Expo config
├── package.json
├── tsconfig.json
├── src/
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   ├── services/
│   │   ├── api.ts                  # Axios setup with interceptors
│   │   ├── authService.ts          # Auth API calls
│   │   ├── courseService.ts        # Course API calls
│   │   └── registrationService.ts  # Registration calls
│   ├── redux/
│   │   ├── store.ts                # Redux store config
│   │   └── slices/
│   │       ├── authSlice.ts        # Auth state reducer
│   │       ├── coursesSlice.ts     # Courses state reducer
│   │       └── registrationsSlice.ts
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SignUpScreen.tsx
│   │   ├── courses/
│   │   │   ├── CourseListScreen.tsx
│   │   │   └── CourseDetailScreen.tsx
│   │   ├── student/
│   │   │   ├── MyCoursesScreen.tsx
│   │   │   ├── ScheduleScreen.tsx
│   │   │   └── RecommendationsScreen.tsx
│   │   └── common/
│   │       └── LoadingScreen.tsx
│   └── navigation/
│       └── RootNavigator.tsx       # React Navigation setup
└── assets/
    └── images/                      # App images
```

### Redux State Shape
```typescript
{
  auth: {
    user: {
      id: number;
      email: string;
      firstName: string;
    };
    token: string;
    isAuthenticated: boolean;
    loading: boolean;
  };
  courses: {
    items: Course[];
    selectedCourse: Course | null;
    loading: boolean;
    error: string | null;
    filters: {
      search: string;
      major: string;
    };
  };
  registrations: {
    registered: Registration[];
    waitlisted: Registration[];
    totalCredits: number;
    loading: boolean;
  };
}
```

### Socket.io Events

**Client → Server**
- `user:login` - User logged in, join course rooms
- `user:logout` - User logged out, leave rooms

**Server → Client**
- `course:seatUpdate` - Seat count changed: `{courseId, currentSeats, seatsLeft}`
- `course:full` - Course reached capacity: `{courseId, courseName}`
- `registration:confirmed` - Registration succeeded: `{courseId, status}`
- `waitlist:enrolled` - Auto-enrolled from waitlist: `{courseId}`

---

## 8. TESTING & DEPLOYMENT

### Backend Testing Strategy

**Unit Tests** (Jest)
```typescript
// Example: authService.test.ts
describe('authService', () => {
  test('registers user with valid credentials', async () => {
    const user = await authService.register({
      email: 'test@example.com',
      password: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe'
    });
    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });

  test('rejects duplicate email', async () => {
    await expect(
      authService.register({
        email: 'existing@example.com',
        password: 'SecurePass123!',
        firstName: 'Jane',
        lastName: 'Doe'
      })
    ).rejects.toThrow('Email already exists');
  });
});
```

**Integration Tests**
- Test full registration flow (API → Database)
- Test course registration with conflict detection
- Test waitlist auto-enrollment
- Test real-time Socket.io updates

**Load Tests** (Apache JMeter)
- Simulate 1000 concurrent users
- Verify no race conditions in registration
- Check response times under load
- Validate Redis cache performance

### Deployment Steps

**1. Backend Deployment (Node.js server)**
```bash
# Production environment setup
npm run build
npm run start

# Environment variables
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=your_secret_key_here
REDIS_URL=redis://localhost:6379
NODE_ENV=production
```

**2. Frontend Deployment (Expo)**
```bash
# Build for production
expo build:ios
expo build:android

# Upload to App Store/Play Store
```

**3. Database Deployment**
```bash
# Run migrations
psql -d student_registration < schema.sql

# Create backups
pg_dump student_registration > backup.sql
```

---

## 9. TROUBLESHOOTING GUIDE

### Common Issues

**Issue: "EADDRINUSE: address already in use :::3000"**
- **Solution**: Kill existing process on port 3000
```bash
lsof -ti:3000 | xargs kill -9
```

**Issue: "JWT token expired"**
- **Solution**: Implement refresh token endpoint and auto-refresh in the app
```typescript
// Axios interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response.status === 401) {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const { token } = await authService.refresh(refreshToken);
      await AsyncStorage.setItem('token', token);
      // Retry request
    }
  }
);
```

**Issue: "Schedule conflict not detected"**
- **Solution**: Verify time overlap algorithm
```typescript
function hasConflict(time1Start, time1End, time2Start, time2End) {
  return time1Start < time2End && time1End > time2Start;
}
```

**Issue: "Real-time updates not working"**
- **Solution**: Check Socket.io connection
```typescript
// Verify connection in frontend
socket.on('connect', () => console.log('Connected'));
socket.on('course:seatUpdate', (data) => console.log(data));
```

**Issue: "Database deadlock during registrations"**
- **Solution**: Use transactions with proper isolation level
```typescript
async function registerCourse(userId, courseId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    // Check seats, insert registration
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  }
}
```

### Performance Optimization Checklist

- [ ] Redis cache configured for courses (5 min TTL)
- [ ] Database indexes created on frequently queried columns
- [ ] Images optimized and lazy-loaded in app
- [ ] Redux selectors memoized with reselect
- [ ] API requests debounced in search
- [ ] Unnecessary re-renders eliminated in React
- [ ] Socket.io rooms properly implemented
- [ ] Rate limiting enabled on all endpoints
- [ ] GZIP compression enabled
- [ ] CDN configured for static assets

---

## Implementation Timeline

| Phase | Days | Tasks | Status |
|-------|------|-------|--------|
| Phase 1 | 1-3 | Auth, Courses, Registration | ⬜ Not started |
| Phase 2 | 4-5 | Conflicts, Waitlist | ⬜ Not started |
| Phase 3 | 6-7 | Real-time updates | ⬜ Not started |
| Phase 4 | 7-8 | Caching, Performance | ⬜ Not started |
| Phase 5 | 8-9 | Analytics, AI | ⬜ Not started |

---

## Success Criteria

✅ All API endpoints documented and tested  
✅ 0 race conditions in concurrent registrations  
✅ Real-time updates < 100ms latency  
✅ 90% reduction in database queries  
✅ 10,000+ concurrent user support  
✅ 99.9% uptime  
✅ Secure authentication with JWT + bcrypt  
✅ Full test coverage (> 80%)  
✅ Complete API documentation (Swagger/OpenAPI)  
✅ Production-ready code review completed  

---

## Support & References

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Socket.io Guide](https://socket.io/docs/)
- [React Native Documentation](https://reactnative.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)

---

**Last Updated**: March 17, 2026  
**Version**: 1.0  
**Status**: Ready for Implementation
