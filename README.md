#  ClassCheck

> **Real-time, verified university lecture alerting, timetable sync, and crowd-verified campus status.**  
> Built for Nigerian universities and higher-education institutions where lecture venues shift rapidly, WhatsApp groups become noisy, and students need instant, reliable schedule updates.

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Frontend](https://img.shields.io/badge/frontend-React%20%7C%20Vite%20%7C%20Tailwind-61DAFB.svg)](https://vitejs.dev/)
[![Backend](https://img.shields.io/badge/backend-Node.js%20%7C%20Express%20%7C%20TypeScript-3178C6.svg)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/database-Supabase%20%28PostgreSQL%29-3ECF8E.svg)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Offline--First%20%7C%20Service%20Worker-FF6B6B.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

---

##  The Problem

On many tertiary campuses across Nigeria and Africa:
* **Lecturers shift lecture halls or cancel classes at the eleventh hour**, often while students are already commuting or arriving under the scorching sun.
* **Course WhatsApp groups are flooded** with side conversations, forwarded memes, unverified rumors, and spam. Critical broadcast announcements get lost.
* **Students spend scarce transport money** only to reach an empty lecture hall because they missed an announcement.
* **No central timetable verification exists**: Students carry conflicting PDF timetables or rely on hearsay.

---

##  The Solution

**ClassCheck** is an ultra-fast, lightweight, offline-first Progressive Web Application (PWA) that acts as the single source of truth for departmental lectures:

1. **Zero Noise, 100% Verified:** Only authorized Course Reps, Lecturers, and Faculty HODs can broadcast class cancellations or venue shifts.
2. **Subscribed Course Feeds:** Students subscribe only to their registered courses—their alert feed shows strictly what affects their academic day.
3. **Hall Pulse (Crowdsourced Verification):** Students physically seated in class confirm live lecturer presence (*Lecturer In Class*, *Late*, *Not In Class*) with instant consensus calculation.
4. **Offline-First Timetable & Next Lecture Countdown:** Full schedules are cached on the device; students can see their next class, hall location, and countdown even with zero internet or during network blackouts.
5. **Installable PWA & Push Alerts:** Addable to home screens on Android and iOS with native lockscreen notifications.
6. **Real-time Cross-tab Synchronization:** Sub-millisecond cross-window updates powered by native `BroadcastChannel` and live socket changefeeds.

---

##  Architecture & Data Flow

```
┌────────────────────────────────────────────────────────┐
│               ClassCheck PWA Frontend                  │
│       React 19 + Vite 5 + Tailwind CSS + Workbox       │
│                                                        │
│  ┌───────────────┐ ┌────────────────┐ ┌─────────────┐  │
│  │  Student Feed │ │ Schedule & TT  │ │ Hall Pulse  │  │
│  └───────▲───────┘ └───────▲────────┘ └──────▲──────┘  │
│          │                 │                 │         │
│          └────────┬────────┴─────────────────┘         │
│                   │                                    │
│       BroadcastChannel ('classcheck_realtime')         │
│       + Local / Offline-first IndexedDB Cache          │
└───────────────────┼────────────────────────────────────┘
                    │
                    │ REST API (Bearer JWT)
                    ▼
┌────────────────────────────────────────────────────────┐
│               ClassCheck API Backend                   │
│         Express 5 + TypeScript + Zod Validation        │
│                                                        │
│  ┌───────────────┐ ┌────────────────┐ ┌─────────────┐  │
│  │ Auth & Roles  │ │  Controllers   │ │ Web Push    │  │
│  │ (Matric/Email)│ │  (Layered TS)  │ │ (VAPID)     │  │
│  └───────────────┘ └────────────────┘ └─────────────┘  │
└───────────────────┼────────────────────────────────────┘
                    │
                    │ Supabase JS Admin Client
                    ▼
┌────────────────────────────────────────────────────────┐
│             Supabase / PostgreSQL 15+                  │
│                                                        │
│  • profiles (role: student, lecturer, class_rep, admin)│
│  • courses & student_courses (subscriptions)           │
│  • updates (broadcasts with RLS)                       │
│  • timetable_entries & hall_pulse_reports              │
│  • waitlist (campus expansion demand)                  │
│  • supabase_realtime publication                       │
└────────────────────────────────────────────────────────┘
```

---

##  Key Features

###  For Students
* **Clean Alert Feed:** Instant cards for class cancellations, hall re-allocations, and tutorial reminders.
* **Next Lecture Widget:** Dynamic countdown card displaying the next upcoming class, lecturer name, hall name, and status badge.
* **Interactive Weekly Timetable:** Day-by-day view with course filtering, time slots, and lecturer contact badges.
* **Course Enrollment Toggles:** One-click subscription management to tailor notifications to your course load.
* **Hall Pulse Voting:** Confirm live class status in 1 tap to save peers from commuting unnecessarily.
* **Faculty Directory:** Search lecturers and course reps with office locations and consultation hours.

###  For Senders (Lecturers & Course Reps)
* **Dedicated Sender Portal:** Clean 1-minute broadcast interface with standardized tags (*Class Cancelled*, *Venue Change*).
* **Broadcast History:** Track, review, and delete dispatched announcements with real-time sync across devices.
* **Role-Protected Access:** Accounts provisioned and governed by departmental administrators.

###  For Faculty Administrators
* **Admin Overview:** Live telemetry showing total registered students, active facilitators, course counts, and today's broadcasts.
* **Sender Management:** Create new lecturers or course reps, assign course ownership, or deactivate credentials instantly.
* **Waitlist & Campus Demand:** Track expansion interest from other departments and universities with conversion tracking (*pending*, *contacted*, *launched*).
* **Live Broadcast Auditing:** Review all broadcasts campus-wide with delete authority.

---

##  Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Web / PWA** | React 19, Vite 5, Tailwind CSS, Lucide React, `date-fns`, `react-hot-toast` |
| **PWA & Offline** | `vite-plugin-pwa`, Workbox, Service Workers, `BroadcastChannel` |
| **Backend API** | Node.js, Express 5, TypeScript, Zod Schema Validation |
| **Security & Utilities** | Helmet, CORS, Express Rate Limit, Supabase Auth |
| **Database & Realtime** | Supabase (PostgreSQL 15+), Row-Level Security (RLS), Realtime Publications |
| **Push Notifications** | Web Push Protocol (VAPID) & HTML5 Notification API |

---

##  Quickstart & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Adeleke-Mubarak/ClassCheck.git
cd ClassCheck
```

---

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install

# Start Vite development server
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

> [!NOTE]
> The frontend is equipped with **zero-setup mock persistence**. You can test the full student, sender, and admin flows locally even without starting the backend!

#### Frontend Environment Variables (`frontend/.env` - Optional)
```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

### 3. Backend Setup (Node.js + Express + TypeScript)
```bash
cd ../backend
npm install

# Start Express server with TypeScript compilation
npm run start
```
The server will boot on **[http://localhost:3000](http://localhost:3000)**. Check health via:
```bash
curl http://localhost:3000/health
# Output: {"status":"ok"}
```

#### Backend Environment Variables (`backend/.env`)
```env
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_SECRET_KEY=eyJhbGci... # service_role key
```

---

##  Repository Structure

```
ClassCheck/
├── frontend/                     # React PWA client
│   ├── src/
│   │   ├── components/           # Reusable UI widgets (Navbar, HallPulseWidget, etc.)
│   │   ├── context/              # Auth & global state context
│   │   ├── lib/                  # api.js client, offlineStorage, pwaUtils, scheduleUtils
│   │   ├── pages/                # Screen routes (Feed, Schedule, Directory, MyCourses, Admin)
│   │   │   ├── admin/            # Admin Dashboard & tabs (Overview, Students, Senders, Waitlist)
│   │   │   └── sender/           # Facilitator Portal & Broadcast History
│   │   ├── App.jsx               # Route definitions & guards
│   │   └── main.jsx              # App entrypoint & service worker registration
│   ├── vite.config.js            # Vite configuration + PWA Manifest & Workbox
│   └── package.json
│
├── backend/                      # Express + TypeScript API
│   ├── src/
│   │   ├── config/               # Environment & Supabase client initialization
│   │   ├── controllers/          # Request handlers
│   │   ├── middleware/           # Auth (requireAuth, requireAdmin), rate-limiting, error handling
│   │   ├── routes/               # API route definitions (/api/v1)
│   │   ├── schemas/              # Zod validation schemas
│   │   ├── services/             # Supabase database interaction layer
│   │   ├── types/                # TypeScript interfaces & types
│   │   ├── app.ts                # Express app setup & middleware mounting
│   │   └── server.ts             # Server entrypoint
│   ├── db.sql                    # Complete PostgreSQL database schema & RLS rules
│   ├── BACKEND_HANDOFF_PLAN.md   # Detailed backend developer implementation guide
│   └── package.json
│
├── .gitignore
└── README.md                     # You are here!
```

---

##  Backend Developer Handoff Plan

For backend engineers joining the project or wiring the production database, please consult:  
👉 **[`backend/BACKEND_HANDOFF_PLAN.md`](./backend/BACKEND_HANDOFF_PLAN.md)**

It includes:
* Full contract specifications for remaining endpoints.
* Copy-pasteable SQL migration scripts for Supabase.
* Web Push notification architecture with VAPID keys.
* Step-by-step sprint roadmap.

---

##  Contributing

Contributions, bug reports, and feature suggestions are welcome!
1. Fork the repository.
2. Create your feature branch (`git checkout -b feat/amazing-feature`).
3. Commit your changes (`git commit -m "feat: add amazing feature"`).
4. Push to the branch (`git push origin feat/amazing-feature`).
5. Open a Pull Request.

---

##  License

This project is licensed under the [Apache-2.0 License](LICENSE).
