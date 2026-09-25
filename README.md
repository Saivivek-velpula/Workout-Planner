# Workout Planner 🏋️‍♂️🥗

A complete full-stack fitness and nutrition tracking web application. Create custom workout routines, manage custom meals with macronutrient profiles, and log comprehensive daily entries (routines performed with actual sets/reps/weights, meals eaten, water intake, body weight, mood, and reflections).

![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Prisma%20%7C%20TailwindCSS-6366f1)

---

## Features

1. **Authentication & User Isolation**:
   - Secure registration, login, and logout powered by JWT and bcrypt password hashing.
   - Complete data isolation: each user only sees their own routines, meals, and daily logs.
2. **Custom Workout Routines (CRUD)**:
   - Create routines categorized by goal type (*Strength*, *Cardio*, *HIIT*, *Mobility*, *Other*).
   - Dynamic exercise builder: add, remove, duplicate, and reorder exercises (Move Up / Down).
   - Exercise details: name, sets, reps, weight (kg), duration, rest seconds, and form cues/notes.
   - Filter and search routines.
3. **Custom Meals & Nutrition (CRUD)**:
   - Create meals categorized by type (*Breakfast*, *Lunch*, *Dinner*, *Snack*).
   - Track total calories, protein (g), carbohydrates (g), and fat (g).
   - Optional detailed ingredient/food item breakdown with an automatic "Sum from Ingredients" calculator.
   - Filter and search meals.
4. **Daily Entries & Logging**:
   - Pick any date via date stepper or calendar.
   - Log routines performed (with completion toggle, duration, and actual sets/reps/weight logged).
   - Log meals eaten with automatic real-time daily calorie and macro computation.
   - Track body weight, water intake (with quick `+0.25L` and `+0.5L` buttons), and mood/energy scale (1–5).
   - One entry per user per date with edit and delete capabilities.
5. **Views**:
   - **Dashboard**: Today's summary, 7-day activity & nutrition visualizer, weekly stats, and quick actions.
   - **Calendar**: Interactive monthly view with purple dots for workouts and amber dots for meals; click any day to open or create that day's log.
   - **History**: Reverse-chronological activity log with date range filters and search.
6. **UI & UX**:
   - Clean, modern, mobile-first responsive layout (desktop sidebar + mobile top/bottom navigation).
   - Dark mode & Light mode toggle with persistent preferences.
   - Animated non-blocking toast notifications and confirmation dialogs for deletions.

---

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router v7, Axios, Lucide React
- **Backend**: Node.js (v24), Express, Prisma ORM, MongoDB Atlas
- **Auth & Security**: JSON Web Tokens (JWT), bcryptjs
- **Validation**: Zod (backend schema validation), inline form errors (frontend)
- **Testing**: Jest, Supertest

---

## Demo Credentials

You can test the application immediately using the pre-seeded demo user:

- **Email**: `demo@workoutplanner.com`
- **Password**: `Password123!`

*(You can also click the **"Fill Demo"** button on the Login page to auto-fill these credentials, or register a brand-new user).*

---

## Getting Started

### 1. Prerequisites
- Node.js (v18 or higher, v24 recommended)
- npm (v9 or higher)

### 2. Installation
From the root directory, install all monorepo dependencies:

```bash
# Option A: Install all at once via root script
npm run install:all

# Option B: Or install individually
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 3. Database Setup & Seeding
From the server directory (or root):

```bash
# Push Prisma schema and indexes to MongoDB Atlas
npm run db:push

# Seed sample routines, meals, and daily logs
npm run db:seed
```

### 4. Running the Application

You can start both backend and frontend concurrently with a single command from the root:

```bash
npm run dev
```

Or run them in separate terminals:

```bash
# Terminal 1: Backend API (port 5000)
npm run dev:server

# Terminal 2: Frontend Client (port 5173)
npm run dev:client
```

Open your browser at: **`http://localhost:5173`**

---

## Automated Tests

Run backend Jest & Supertest integration tests covering authentication and routines CRUD:

```bash
npm run test:server
```

---

## Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="super-secret-workout-planner-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
```

### Frontend (`client/.env.example`)
```env
VITE_API_URL=/api
```

---

## Project Structure

```
d:/full/
├── package.json               # Root monorepo orchestration
├── README.md                  # Documentation and setup guide
├── .prettierrc                # Code formatting rules
├── .eslintrc.json             # Code linting rules
├── server/
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma      # SQLite schema models & relations
│   │   ├── seed.js            # Demo user, routines, meals, & entries seed
│   │   └── dev.db             # Local SQLite database
│   ├── src/
│   │   ├── index.js           # Server HTTP entry point
│   │   ├── app.js             # Express app, middleware, & routes
│   │   ├── config/            # DB client & env configuration
│   │   ├── middleware/        # JWT auth, centralized error handler, validation
│   │   ├── validators/        # Zod request validation schemas
│   │   ├── controllers/       # Auth, Routines, Meals, Entries, Stats
│   │   └── routes/            # REST API endpoints
│   └── tests/
│       ├── auth.test.js       # Auth register, login, & me tests
│       └── routines.test.js   # Routines CRUD & user isolation tests
└── client/
    ├── package.json
    ├── vite.config.js         # Vite configuration with proxy to port 5000
    ├── tailwind.config.js     # Tailwind CSS theme & dark mode configuration
    ├── index.html
    └── src/
        ├── api/               # Axios client instance with auth interceptor
        ├── context/           # AuthContext, ThemeContext, ToastContext
        ├── components/
        │   ├── layout/        # Sidebar, BottomNav, Navbar, Layout, ProtectedRoute
        │   └── ui/            # Button, FormControls, Modal, ConfirmDialog, Badges
        └── pages/             # Dashboard, Calendar, Routines, Meals, Entries, History, Auth
```
