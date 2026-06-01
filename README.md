# StudyHub

A full-stack online learning platform where students can enroll in courses, watch video lessons, take quizzes, earn certificates, and discuss topics with the community. Instructors can create and manage courses, while admins oversee the entire platform.

Built with React, Node.js, Express, and MongoDB.

---

## Features

### For Students
- **Course Enrollment** — Browse, search, and enroll in published courses
- **Video Lessons** — Watch embedded YouTube lectures organized into modules
- **Flashcard & MCQ Quizzes** — Interactive quizzes with flip cards and multiple-choice questions with instant feedback
- **Progress Tracking** — Track completed lessons with a visual progress bar and resume where you left off
- **Certificates** — Download a PDF certificate with the StudyHub logo upon completing all lessons in a course
- **Discussion Forum** — Post questions, reply with threaded comments, upvote/downvote, and accept answers (inspired by LeetCode Discuss)
- **AI Study Assistant** — Gemini-powered chatbot embedded in each course, context-aware of lessons and course content, with markdown rendering and suggested prompts
- **Notes Panel** — Take personal notes while learning
- **Leaderboard** — XP-based rankings with streak tracking and badges
- **Dark Mode** — Toggle between light and dark themes, persisted across sessions

### For Instructors
- **Course Editor** — Create courses with modules, lessons (video/note/quiz types), and publish them
- **Dashboard** — View created courses, enrollment counts, and course reviews
- **File Storage** — Upload and manage course assets via Supabase storage

### For Admins
- **Admin Dashboard** — Manage users, courses, and platform-wide settings
- **Discussion Moderation** — Pin or close discussion threads

### Platform-Wide
- **Authentication** — JWT-based auth with access + refresh token rotation, Google OAuth, email verification, and password reset
- **Role-Based Access Control** — Separate permissions for students, instructors, and admins
- **Email Notifications** — Automated emails for welcome, enrollment confirmation, and course completion
- **Responsive Design** — Mobile-friendly UI built with Bootstrap 5
- **Security** — Helmet, rate limiting, CORS configuration, input sanitization, and secure session handling

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router 7, Bootstrap 5, React Icons, React Toastify |
| Backend | Node.js, Express 4, Passport.js (Local + Google OAuth) |
| Database | MongoDB Atlas with Mongoose ODM |
| File Storage | Supabase Storage |
| AI | Google Gemini 2.0 Flash (@google/generative-ai) |
| PDF Generation | PDFKit |
| Email | Nodemailer (Gmail / SMTP) |
| Auth | JWT (access + refresh tokens), bcrypt |
| Containerization | Docker, Docker Compose |

---

## Project Structure

```
StudyHub/
├── backend/
│   ├── assets/              # Static assets (logo for certificates)
│   ├── config/              # Passport strategies, permissions config
│   ├── controllers/         # Route handlers (auth, courses, progress, discussions, certificates)
│   ├── middleware/           # Auth, RBAC, error handling, rate limiting
│   ├── models/              # Mongoose schemas (User, Course, Discussion, Comment, Review)
│   ├── routes/              # Express route definitions
│   ├── scripts/             # Seed scripts for courses and users
│   ├── services/            # Email service, certificate generator, Supabase client
│   ├── utils/               # Token issuance helpers
│   ├── app.js               # Express app configuration
│   ├── server.js            # Server entry point
│   └── db.js                # MongoDB connection
│
├── frontend/
│   ├── public/              # Static files, logo
│   └── src/
│       ├── api/             # API client functions (courses, progress, discussions, users)
│       ├── components/      # React components
│       │   ├── dashboard/   # Role-specific dashboards (Student, Instructor, Admin)
│       │   └── instructor/  # Course editor
│       ├── config/          # API base URL configuration
│       ├── context/         # React contexts (ThemeContext)
│       └── utils/           # Auth helpers, RBAC utilities
│
├── docker-compose.yml       # Multi-container Docker setup
└── render.yaml              # Render deployment blueprint
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm
- MongoDB Atlas account (or local MongoDB)
- Google Cloud Console project (for OAuth — optional)
- Supabase project (for file storage — optional)

### 1. Clone the Repository

```bash
git clone https://github.com/shikhar5647/StudyHub.git
cd StudyHub
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5001
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES=15m
SESSION_SECRET=your_session_secret
FRONTEND_URL=http://localhost:3001

# Gemini AI (for AI Study Assistant)
GEMINI_API_KEY=your_gemini_api_key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# Supabase (optional — for file storage)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Email (optional — for notifications)
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASS=your_gmail_app_password
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
REACT_APP_API_URL=http://localhost:5001
PORT=3001
```

Start the frontend:

```bash
npm start
```

### 4. Seed Data (Optional)

Populate the database with sample courses and users:

```bash
cd backend
npm run seed:courses
npm run seed:users
```

### 5. Open the App

- Frontend: [http://localhost:3001](http://localhost:3001)
- Backend API: [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

## Docker Setup

Run the entire stack with Docker Compose:

```bash
docker-compose up --build
```

This starts MongoDB, the backend API, and the frontend in containers.

---

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register a new user |
| POST | `/login` | Login with email/password |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | Logout and revoke refresh token |
| POST | `/forgot-password` | Send password reset email |
| POST | `/reset-password` | Reset password with token |
| GET | `/verify-email` | Verify email address |
| GET | `/google` | Initiate Google OAuth |
| GET | `/google/callback` | Google OAuth callback |

### Courses (`/api/courses`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all published courses |
| GET | `/categories/list` | Get course categories |
| GET | `/:slugOrId` | Get course details |
| POST | `/` | Create a course (instructor) |
| PUT | `/:slugOrId` | Update a course (instructor) |
| DELETE | `/:slugOrId` | Delete a course (instructor) |
| POST | `/:slugOrId/enroll` | Enroll in a course (student) |
| GET | `/:slugOrId/certificate` | Download completion certificate (student) |
| GET | `/:slugOrId/progress` | Get course progress (student) |
| POST | `/:slugOrId/progress/lessons/:lessonId/complete` | Mark lesson complete |
| POST | `/:slugOrId/chat` | Send a message to the AI study assistant |

### Discussions (`/api/discussions`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List discussions (search, filter, sort, paginate) |
| GET | `/:slugOrId` | Get discussion with comments |
| POST | `/` | Create a discussion |
| PUT | `/:slugOrId` | Update a discussion |
| DELETE | `/:slugOrId` | Delete a discussion |
| POST | `/:slugOrId/vote` | Upvote/downvote a discussion |
| POST | `/:slugOrId/comments` | Add a comment |
| POST | `/:slugOrId/comments/:commentId/vote` | Vote on a comment |

### Users (`/api/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/me` | Get current user profile |
| PUT | `/me` | Update profile |
| GET | `/leaderboard` | Get XP leaderboard |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

---

## Gamification

- **XP System** — Earn 10 XP per lesson completed, 50 XP per course completed
- **Streaks** — Daily login streak tracking with longest streak record
- **Badges** — Unlock badges like "First Course", "Quiz Master", "7-Day Streak"
- **Leaderboard** — Global XP rankings visible to all users

---

## Screenshots

> Add screenshots of your deployed application here.

---

## Authors

- **Shikhar Dave**
- **Mahek Vanjani**

## License

Distributed under the MIT License. See `LICENSE` for details.
