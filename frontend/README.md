# ClassCheck

**Real-time class update notifications for university students.**

ClassCheck solves a common problem on Nigerian university campuses: students trek long distances to lecture halls only to find out the class has been cancelled or moved to a different venue. ClassCheck delivers instant notifications from verified lecturers and class reps so students always know what's happening before they leave.

---

## Table of Contents

- [How It Works](#how-it-works)
- [User Roles](#user-roles)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Authentication Architecture](#authentication-architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Supabase Setup](#supabase-setup)
- [Current Scope](#current-scope)
- [What's Next / Roadmap](#whats-next--roadmap)

---

## How It Works

1. **Student signs up** with their matric number, password, department, and level.
2. **Student picks courses** they're enrolled in during onboarding (e.g. MAT403 Functional Analysis).
3. **Sender (lecturer or class rep)** posts an update — either a class cancellation or a venue change — for a specific course.
4. **Students subscribed to that course** see the update appear in their feed in **real-time** via Supabase Realtime (Postgres changes).
5. **Admin** manages everything: creates senders, assigns them to courses, adds new courses, and monitors all activity from a dashboard.

---

## User Roles

| Role | How they authenticate | What they can do |
|------|----------------------|------------------|
| **Student** | Matric number + password | Sign up, pick courses, view feed of updates for subscribed courses |
| **Sender** (Lecturer / Class Rep) | Email + password (created by admin) | Post class cancellations and venue changes for assigned courses |
| **Admin** | Email + password (set via Supabase `app_metadata`) | Full dashboard — manage senders, courses, view all updates, assign senders to courses |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite |
| **Styling** | Tailwind CSS + inline styles (dark theme) |
| **Routing** | React Router v6 |
| **Backend / Database** | [Supabase](https://supabase.com) (Postgres + Auth + Realtime + RLS) |
| **Auth** | Supabase Auth (email/password) |
| **Realtime** | Supabase Realtime (Postgres changes on `updates` table) |
| **Notifications** | `react-hot-toast` |

> **No custom backend server is needed.** Supabase handles auth, database, and realtime. The frontend talks directly to Supabase via the JS client. Row Level Security (RLS) policies enforce all access control at the database level.

---

## Project Structure

```
ClassCheck/
├── public/                     # Static assets
├── supabase/
│   └── schema.sql              # ⭐ Full database schema, RLS policies, seed data
├── src/
│   ├── main.jsx                # App entry point
│   ├── App.jsx                 # Routes configuration
│   ├── index.css               # Global styles (Tailwind + custom)
│   │
│   ├── lib/
│   │   ├── supabase.js         # Supabase client init
│   │   └── auth.js             # ⭐ All auth logic (signup, signin, role detection)
│   │
│   ├── context/
│   │   └── AuthContext.jsx     # Global auth state (user, profile, role)
│   │
│   ├── components/
│   │   ├── Navbar.jsx          # Student dark navbar (Feed, My Courses, Profile, Sign out)
│   │   ├── AdminNavbar.jsx     # Admin dashboard navbar
│   │   ├── SenderNavbar.jsx    # Sender portal navbar
│   │   ├── ProtectedRoute.jsx  # Route guard (checks role + redirect)
│   │   ├── FilterPills.jsx     # Feed filter pills (All / Cancelled / Venue change)
│   │   ├── UpdateCard.jsx      # Single update card component
│   │   ├── Typewriter.jsx      # Typewriter text animation
│   │   ├── Modal.jsx           # Reusable modal wrapper
│   │   ├── AddCourseModal.jsx  # Admin: add course form
│   │   └── AddSenderModal.jsx  # Admin: add sender form
│   │
│   └── pages/
│       ├── Landing.jsx         # Public landing page
│       ├── SignUp.jsx          # Student sign up (dark split-screen)
│       ├── SignIn.jsx          # Student sign in (dark split-screen)
│       ├── SenderSignIn.jsx    # Sender sign in
│       ├── ForgotPassword.jsx  # Password reset
│       ├── Onboarding.jsx      # Post-signup course selection
│       ├── Feed.jsx            # ⭐ Student feed — realtime updates
│       ├── MyCourses.jsx       # Toggle course subscriptions
│       ├── Account.jsx         # Student account/profile
│       ├── NotFound.jsx        # 404 page
│       │
│       ├── sender/
│       │   ├── Portal.jsx      # ⭐ Sender: post new update
│       │   └── History.jsx     # Sender: view past updates
│       │
│       └── admin/
│           ├── Dashboard.jsx   # Admin dashboard shell + tabs
│           └── tabs/
│               ├── Overview.jsx    # Stats overview
│               ├── Senders.jsx     # Manage senders
│               ├── Courses.jsx     # Manage courses
│               └── AllUpdates.jsx  # View all posted updates
│
├── .env.example                # Required environment variables template
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## Database Schema

Full schema is in [`supabase/schema.sql`](supabase/schema.sql). Here's a summary:

### Tables

```
students          — Student profiles (linked to auth.users)
  ├── id (uuid, PK, FK → auth.users)
  ├── full_name
  ├── matric_no (unique)
  ├── department
  ├── level (100-500)
  └── onboarded (boolean)

senders           — Lecturers and class reps (created by admin)
  ├── id (uuid, PK, FK → auth.users)
  ├── full_name
  ├── email (unique)
  ├── role (enum: 'lecturer' | 'class_rep')
  └── status (enum: 'active' | 'inactive')

courses           — All available courses
  ├── id (uuid, PK)
  ├── course_code (unique, e.g. 'MAT403')
  ├── course_name
  ├── department
  └── level

student_courses   — Which students are subscribed to which courses
  ├── student_id (FK → students)
  └── course_id (FK → courses)

sender_courses    — Which senders can post updates for which courses
  ├── sender_id (FK → senders)
  └── course_id (FK → courses)

updates           — The core data: class cancellations and venue changes
  ├── id (uuid, PK)
  ├── course_id (FK → courses)
  ├── sender_id (FK → senders)
  ├── type (enum: 'cancelled' | 'venue_change')
  ├── new_venue (text, nullable — only for venue changes)
  ├── note (text, nullable)
  └── created_at
```

### Key Relationships

```
Student ──subscribes──► Course ◄──assigned──── Sender
                          │
                          ▼
                       Update (cancellation or venue change)
                          │
                          ▼
              Pushed to student's feed in real-time
```

### Row Level Security (RLS)

All tables have RLS enabled. Key rules:
- **Students** can only read/update their own row
- **Senders** can only post updates for courses they're assigned to
- **Admin** (identified by `app_metadata.role = 'admin'`) has full access
- **Students** can only see updates for courses they're subscribed to
- **Courses** are readable by any authenticated user

---

## Authentication Architecture

Students don't use email — they use their **matric number** as their identity.

### How it works under the hood:

1. Student enters matric number (e.g. `230551098`) + password
2. The app converts this to a synthetic email: `230551098@students.classcheck.app`
3. This synthetic email is used with Supabase Auth (the student never sees it)
4. A database trigger (`auto_confirm_user`) automatically confirms the email so no verification email is needed
5. After auth signup, a row is inserted into the `students` table with their profile

### Role detection flow:

```
User logs in → Check app_metadata.role
  ├── "admin" → redirect to /admin
  ├── Check senders table → if found → redirect to /sender/portal
  └── Check students table → if found → redirect to /feed (or /onboarding if not onboarded)
```

See [`src/lib/auth.js`](src/lib/auth.js) for all auth logic and [`src/context/AuthContext.jsx`](src/context/AuthContext.jsx) for the global auth state provider.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

### Install & Run

```bash
# Clone the repo
git clone https://github.com/Adeleke-Mubarak/Classcheck.git
cd Classcheck

# Install dependencies
npm install

# Copy environment template and fill in your Supabase credentials
cp .env.example .env
# Edit .env with your Supabase URL and anon key

# Start development server
npm run dev
```

The app will be at `http://localhost:5173`

---

## Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get these from your Supabase project: **Settings → API**.

---

## Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the schema** — Go to SQL Editor in your Supabase dashboard and paste the contents of [`supabase/schema.sql`](supabase/schema.sql). This creates all tables, RLS policies, and seeds the Mathematics 400-level courses.

3. **Create the auto-confirm trigger** — Run this in the SQL Editor to bypass email confirmation for students:
   ```sql
   CREATE OR REPLACE FUNCTION public.auto_confirm_user()
   RETURNS TRIGGER AS $$
   BEGIN
     UPDATE auth.users
     SET email_confirmed_at = now(),
         confirmation_token = '',
         raw_app_meta_data = raw_app_meta_data || '{"email_verified": true}'::jsonb
     WHERE id = NEW.id AND email_confirmed_at IS NULL;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   CREATE TRIGGER confirm_user_on_signup
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_user();
   ```

4. **Set up the admin user**:
   - Go to **Authentication → Users → Add User**
   - Email: `admin@classcheck.ng`, set a password
   - After creating, click the user and edit their raw `app_metadata` to: `{ "role": "admin" }`
   - Or run this SQL:
     ```sql
     UPDATE auth.users
     SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
     WHERE email = 'admin@classcheck.ng';
     ```

5. **Enable Realtime** — The schema SQL already does this, but verify: Go to **Database → Replication** and make sure the `updates` table is enabled.

6. **Copy your credentials** to `.env` (Project URL + anon key from **Settings → API**)

---

## Current Scope

This is an **MVP / prototype** currently scoped to:

- **Department:** Mathematics only
- **Level:** 400 Level
- **Courses:** 11 courses for the current semester (MAT401–MAT497)
- **Update types:** Class cancellations and venue changes

The architecture is designed to scale to all departments and faculties — courses, senders, and students are all linked by department/level, so expanding is just a matter of adding more courses and senders.

---

## What's Next / Roadmap

Features planned for future development:

- [ ] **Multi-department support** — Add more departments and faculties
- [ ] **Push notifications** — Browser/mobile push via Firebase Cloud Messaging
- [ ] **Timetable integration** — Show today's schedule alongside updates
- [ ] **Mobile app** — React Native or Flutter wrapper
- [ ] **Sender verification flow** — Admin approval workflow for new senders
- [ ] **Update types** — Add more types: reschedule, extra class, assignment due
- [ ] **Analytics dashboard** — Track how many students see each update
- [ ] **Email/SMS fallback** — For students without the app

---

## License

This project is currently private. All rights reserved.
