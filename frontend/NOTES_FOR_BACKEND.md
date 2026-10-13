# Backend Developer Guide & Notes

**Project:** ClassCheck  
**Last Updated:** October 13, 2026  
**Audience:** Backend Engineering Team

---

## 🎯 Executive Summary & Action Items for Backend Dev

The frontend code has been audited, repaired, and verified to build cleanly (`npm run build` and `npm run lint` both pass with 0 errors).

Below is the comprehensive list of backend observations, fixes applied in comments, and recommended architectural enhancements:

---

### 1. ⚙️ TypeScript Compilation (`exactOptionalPropertyTypes: true`)
- **Location:** `backend/src/services/index.service.ts` (`TimetableService.getAll` and `DirectoryService.getAll`)
- **Problem:** `tsconfig.json` has `"exactOptionalPropertyTypes": true`. In `backend/src/controllers/index.controller.ts`, controllers pass `{ day_of_week: day, course_id: courseId }` where `day` is `string | undefined`. TypeScript rejected passing `undefined` to `day_of_week?: string` (TS2379).
- **Status:** Resolved in `index.service.ts` by adding `| undefined` to the optional filter interfaces:
  ```ts
  getAll: (filters?: { day_of_week?: string | undefined; course_id?: string | undefined }) => { ... }
  getAll: (filters?: { role?: string | undefined; department?: string | undefined; search?: string | undefined }) => { ... }
  ```
  `npx tsc --noEmit` now compiles with 0 errors.

---

### 2. 🚀 Start Script in ESM Mode
- **Location:** `backend/package.json`
- **Problem:** Because `"type": "module"` is configured, Node.js strict ESM requires explicit file extensions. The previous script `"start": "tsc && node ./dist/server"` resulted in `ERR_MODULE_NOT_FOUND`.
- **Status:** Updated in `backend/package.json` to:
  ```json
  "start": "tsc && node ./dist/server.js"
  ```

---

### 3. 🔐 Environment Variable Loading (`env.ts`)
- **Location:** `backend/src/config/env.ts`
- **Problem:** `env.ts` throws immediately if `SUPABASE_URL` is missing. When imported in testing suites or independent scripts, `dotenv/config` had not executed yet because it was only imported in `server.ts`.
- **Status:** Added `import 'dotenv/config'` directly to the top of `backend/src/config/env.ts`.

---

### 4. ⚡ Database & Auth Performance Optimization
- **Location:** `backend/src/controllers/index.controller.ts` (lines 48–60) & `backend/src/services/index.service.ts` (line 46)
- **Problem:** During student sign-in with matric number:
  1. `ProfileService.getByMatricNo(matric_no)` only selected `'id'`.
  2. The controller then executed `AuthService.getUserById(profile.id)` to fetch the user's email from Supabase Auth Admin.
- **Recommendation:** `profiles` table already contains `email text not null`. Update `getByMatricNo` to:
  ```ts
  getByMatricNo: (matricNo: string) =>
    supabase
      .from('profiles')
      .select('id, email')
      .ilike('matric_no', matricNo.trim())
      .maybeSingle(),
  ```
  And in `AuthController.signIn`, read `profile.email` directly! This eliminates an entire HTTP roundtrip to the Supabase Admin API on every sign-in.

---

### 5. 🔤 Case-Insensitive Matric Number Matching
- **Location:** `backend/src/services/index.service.ts` (`getByMatricNo`)
- **Problem:** Using `.eq('matric_no', matricNo)` is case-sensitive in PostgreSQL. If a student signs up as `MAT/2026/001` but logs in as `mat/2026/001`, the query returns null and login fails.
- **Recommendation:** Use `.ilike('matric_no', matricNo.trim())` or ensure matric numbers are normalized to `.toUpperCase()` upon both signup and signin.

---

### 6. 🛡️ Route Authorization for Timetable Management
- **Location:** `backend/src/controllers/index.controller.ts` (`TimetableController.create`, `update`, `remove`)
- **Problem:** While `UpdateController.create` verifies that non-admin senders are assigned to the target `course_id` before posting an update, `TimetableController` currently allows any user with `class_rep` role to create or delete timetable slots for *any* course across the entire school.
- **Recommendation:** Add course assignment verification for `class_rep` in `TimetableController`:
  ```ts
  if (req.user!.role !== 'admin') {
    const assigned = await SenderCourseService.isAssigned(req.user!.id, req.body.course_id)
    if (!assigned) {
      fail(res, 'You are not assigned to manage timetable for this course.', 403)
      return
    }
  }
  ```

---

### 7. 🪵 Access Logger Middleware
- **Location:** `backend/src/middleware/accessLogger.middleware.ts`
- **Note:** An access logger that writes to `logs/YYYY-MM-DD/access.log` exists in the codebase but is not mounted. If you want file-based access logging active, mount it in `backend/src/app.ts`:
  ```ts
  import accessLogger from './middleware/accessLogger.middleware.js'
  app.use(accessLogger)
  ```

---

## 🔌 Complete API Endpoints Contract

All frontend requests in `src/lib/api.js` adhere to this contract:

| Endpoint | Method | Auth / Role | Sent Payload / Params | Purpose |
|---|---|---|---|---|
| `/auth/signup` | POST | Public | `{ full_name, matric_no, email, department, level, password }` | Student registration |
| `/auth/signin` | POST | Public | `{ email?, matric_no?, password }` | Sign in (email OR matric number) |
| `/auth/signout` | POST | Bearer | — | Invalidate session |
| `/auth/forgot-password` | POST | Public | `{ matric_no }` | Request password reset |
| `/auth/password` | PUT | Bearer | `{ password }` | Change account password |
| `/auth/account` | DELETE | Bearer | — | Delete student account |
| `/profile/me` | GET / PUT | Bearer | PUT: `{ full_name?, department?, level? }` | View / update current user profile |
| `/profile/:id` | GET | Bearer | — | Fetch user profile by ID |
| `/courses` | GET / POST | Bearer (POST: Admin) | POST: `{ course_code, course_name, department, level }` | List courses / Admin add course |
| `/courses/:id` | DELETE | Bearer (Admin) | — | Admin delete course |
| `/students/:id/courses` | GET / PUT | Bearer (Self/Admin) | PUT: `{ course_ids: string[] }` | Student enrolled course subscriptions |
| `/senders/:id/courses` | GET | Bearer (Self/Admin) | — | Assigned courses for a sender |
| `/senders/:id/updates` | GET | Bearer (Self/Admin) | — | Post history for a sender |
| `/feed` | GET | Bearer | — | Filtered updates for subscribed courses |
| `/updates` | GET / POST | Bearer (POST: Sender) | POST: `{ course_id, type, new_venue?, note? }` | Post class cancellation or venue change |
| `/updates/:id` | DELETE | Bearer (Self/Admin) | — | Delete an update |
| `/timetable` | GET / POST | Bearer (POST: Rep/Admin) | POST: `{ course_id, day_of_week, start_time, end_time, venue, lecturer_name?, note? }` | Course lecture timetable schedule |
| `/timetable/me` | GET | Bearer | `?day=monday` | Timetable slots for current user's courses |
| `/timetable/:id` | PUT / DELETE | Bearer (Rep/Admin) | PUT: partial timetable payload | Edit / remove timetable entry |
| `/directory` | GET | Bearer | `?role=lecturer&department=Mathematics&search=query` | Faculty and course rep directory |
| `/directory/me` | GET | Bearer | — | Facilitators assigned to student's courses |
| `/senders` | GET / POST | Bearer (Admin) | POST: `{ full_name, email, password, role, courses: string[] }` | Admin sender creation and listing |
| `/senders/:id/status` | PUT | Bearer (Admin) | `{ status: 'active' \| 'inactive' }` | Toggle sender active status |
| `/senders/:id` | DELETE | Bearer (Admin) | — | Remove sender account |
| `/admin/overview` | GET | Bearer (Admin) | — | Dashboard metrics & recent activity |
| `/notifications` | GET | Bearer | — | In-app notification alerts |
| `/notifications/read-all`| PUT | Bearer | — | Mark all user notifications as read |
| `/waitlist` | POST | Public | `{ name, email, department, university }` | Waitlist sign-up |
| `/hall-pulse/:courseId` | GET | Bearer | — | Get today's crowdsourced pulse reports and consensus |
| `/hall-pulse` | POST | Bearer | `{ course_id, status: 'lecturer_present' \| 'hall_empty' \| 'class_holding' }` | Submit/update student's physical hall status report |

### Hall Pulse Consensus Logic:
- Students can submit 1 status per course per lecture time slot.
- When $\ge 3$ distinct students submit the same status (`lecturer_present`, `hall_empty`, or `class_holding`), `consensus` is stamped to that status.
- Resets automatically when the lecture slot finishes or at the end of the day.

---

## 🚀 Verifying Locally

### Backend:
```bash
cd backend
npm install
npm run start   # Compiles with TypeScript and starts Express on port 3000
```

### Frontend:
```bash
cd frontend
npm run lint    # ESLint 9 Flat Config (0 errors, 0 warnings)
npm run build   # Vite production build (0 errors)
npm run dev     # Starts dev server on http://localhost:5173
```
