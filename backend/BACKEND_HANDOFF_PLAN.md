# ClassCheck — Backend Developer Handoff & Implementation Plan

Welcome! This document outlines everything you need to know to complete, connect, and deploy the **ClassCheck Backend API** (Express + TypeScript + Supabase/PostgreSQL) to support the live ClassCheck web app.

---

## 1. System Architecture & Current State

ClassCheck is an offline-first, real-time university lecture alerting & crowd-verification platform designed for Nigerian campuses.

```
┌────────────────────────────────┐         ┌────────────────────────────────┐
│   ClassCheck Frontend (PWA)    │         │     ClassCheck Backend API     │
│   React + Vite + Tailwind      │ ──HTTP──▶   Node.js + Express (TypeScript)│
│   Runs on http://localhost:5173│         │   Runs on http://localhost:3000│
└────────────────────────────────┘         └────────────────────────────────┘
                                                           │
                                                      Supabase SDK
                                                           ▼
                                           ┌────────────────────────────────┐
                                           │       Supabase Database        │
                                           │   PostgreSQL + Auth + RLS      │
                                           └────────────────────────────────┘
```

### What is already completed:
* **Database Schema:** Base schema defined in [`backend/db.sql`](./db.sql) (Departments, Profiles, Courses, Subscriptions, Updates, Timetable, Directory, RLS policies).
* **Express & TS Scaffolding:** Clean Layered Architecture (`src/routes`, `src/controllers`, `src/services`, `src/schemas`, `src/middleware`).
* **Authentication:** Student signup/signin (with matric number or email), sender/admin signin, JWT verification via Supabase Auth.
* **Core APIs:** Courses catalog, student course subscriptions, timetable management, lecturer/rep directory, sender broadcasts.

---

## 2. Immediate Gaps & Missing Endpoints

The frontend PWA is 100% built and includes fallback offline persistence. To switch to the live backend, the following 3 areas need to be implemented in Express:

### Area 1: Admin — Registered Students (`GET /students`)
* **Endpoint:** `GET /api/v1/students`
* **Access Level:** `requireAuth`, `requireAdmin`
* **Purpose:** Allows the Admin Overview & Students tabs to monitor registered students.
* **Response Payload (JSON):**
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "full_name": "Adeleke Mubarak",
        "email": "student@classcheck.app",
        "matric_no": "MAT/2026/001",
        "department": "Mathematics",
        "level": "400",
        "role": "student",
        "status": "active",
        "created_at": "2026-10-13T10:00:00Z"
      }
    ]
  }
  ```

---

### Area 2: Admin — Waitlist & Campus Demand Management
* **Public Signup:** `POST /api/v1/waitlist` *(Already implemented)*
* **Admin List:** `GET /api/v1/waitlist`
  * **Access:** `requireAuth`, `requireAdmin`
  * **Returns:** All waitlist rows sorted by `created_at DESC`.
* **Admin Update Status:** `PUT /api/v1/waitlist/:id`
  * **Access:** `requireAuth`, `requireAdmin`
  * **Body:** `{ "status": "pending" | "contacted" | "launched" }`
* **Admin Delete:** `DELETE /api/v1/waitlist/:id`
  * **Access:** `requireAuth`, `requireAdmin`

---

### Area 3: Crowdsourced "Hall Pulse" Verification
*Hall Pulse lets students physically seated in a lecture hall vote on the actual lecturer presence in real time.*
* **Get Current Consensus:** `GET /api/v1/hall-pulse/:courseId`
  * **Access:** `requireAuth`
  * **Logic:** Query votes cast for this course in the last 2 hours. Calculate totals for `in_class`, `late`, `not_in_class`, and determine the majority consensus.
  * **Response Payload (JSON):**
    ```json
    {
      "data": {
        "course_id": "uuid",
        "consensus": "in_class",
        "counts": {
          "in_class": 12,
          "late": 2,
          "not_in_class": 0
        },
        "total_reports": 14,
        "last_updated": "2026-10-13T12:05:00Z"
      }
    }
    ```
* **Submit Pulse Vote:** `POST /api/v1/hall-pulse`
  * **Access:** `requireAuth`
  * **Body:**
    ```json
    {
      "course_id": "uuid",
      "status": "in_class"
    }
    ```

---

## 3. SQL Migrations to Run in Supabase

Run the following SQL snippet in your **Supabase Project > SQL Editor** to add the missing tables and columns:

```sql
-- 1. Extend waitlist table with status tracking
alter table public.waitlist 
  add column if not exists status text not null default 'pending' 
  check (status in ('pending', 'contacted', 'launched'));

-- Admin policies for waitlist
create policy "waitlist_select_admin"
  on public.waitlist for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "waitlist_update_admin"
  on public.waitlist for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "waitlist_delete_admin"
  on public.waitlist for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 2. Hall Pulse crowd-verification table
create table if not exists public.hall_pulse_reports (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  status      text not null check (status in ('in_class', 'late', 'not_in_class')),
  created_at  timestamptz not null default now()
);

create index if not exists idx_hall_pulse_course_time
  on public.hall_pulse_reports (course_id, created_at desc);

alter table public.hall_pulse_reports enable row level security;

create policy "hall_pulse_select_authenticated"
  on public.hall_pulse_reports for select
  to authenticated
  using (true);

create policy "hall_pulse_insert_students"
  on public.hall_pulse_reports for insert
  to authenticated
  with check (user_id = auth.uid());

-- 3. Web Push subscriptions table (for native device notifications)
create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_push_subs_user
  on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

-- 4. Enable Supabase Realtime for instant socket pushes
alter publication supabase_realtime add table public.updates;
alter publication supabase_realtime add table public.timetable_entries;
alter publication supabase_realtime add table public.hall_pulse_reports;
alter publication supabase_realtime add table public.waitlist;
```

---

## 4. Local Development Quickstart

### Prerequisites
* Node.js v18+ installed.
* A Supabase project with credentials.

### Step 1: Environment Variables
Create a `.env` file inside `backend/` with the following variables:
```env
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=eyJhbGciOi... # service_role key
```

### Step 2: Install & Build
```bash
cd backend
npm install
npm run start # runs `tsc && node ./dist/server.js`
```
Verify the server starts with:
```bash
curl http://localhost:3000/health
# Response: {"status":"ok"}
```

---

## 5. Developer Sprint Checklist

Follow this checklist in order:

- [ ] **Step 1:** Run the SQL snippet from Section 3 in Supabase SQL Editor.
- [ ] **Step 2:** In `src/services/index.service.ts`:
  - [ ] Add `AdminService.getStudents()` querying `profiles` where `role = 'student'`.
  - [ ] Add `WaitlistService.getAll()`, `updateStatus(id, status)`, and `remove(id)`.
  - [ ] Add `HallPulseService.getRecentConsensus(courseId)` and `submit(userId, courseId, status)`.
- [ ] **Step 3:** In `src/schemas/index.schema.ts`:
  - [ ] Add `updateWaitlistStatusSchema`.
  - [ ] Add `submitHallPulseSchema`.
- [ ] **Step 4:** In `src/controllers/index.controller.ts`:
  - [ ] Add `AdminController.getStudents`.
  - [ ] Add `WaitlistController.getAll`, `updateStatus`, and `remove`.
  - [ ] Add `HallPulseController.getStatus` and `submit`.
- [ ] **Step 5:** In `src/routes/index.route.ts`:
  - [ ] Mount `GET /students` (requireAdmin).
  - [ ] Mount `GET /waitlist`, `PUT /waitlist/:id`, `DELETE /waitlist/:id` (requireAdmin).
  - [ ] Mount `GET /hall-pulse/:courseId` and `POST /hall-pulse` (requireAuth).
- [ ] **Step 6:** Test with frontend:
  - Run frontend (`cd frontend && npm run dev`) and test signing up, browsing courses, and posting a broadcast!
