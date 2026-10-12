# Frontend Updates & Fixes (Notes for Backend Team)

**Date:** October 3, 2026  
**Context:** Following PR #2 and PR #3 merges from `@nifemibosun`.

---

## 🛠️ Summary of Fixes Applied

### 1. Fixed "Full Name" Input on Student Sign Up (`SignUp.jsx`)
- **Problem:** In PR #2, when adding the Email field, line 440 was set to `value={form.full_name}` while the React state was using `form.fullName`. This caused the input to be frozen / not display text while typing.
- **Fix:** Restored `value={form.fullName}` and made `api.signUpStudent` accept either `fullName` or `full_name` gracefully.

### 2. Fixed React Auth State Desynchronization on Login / Sign-Up
- **Problem:** When signing in (`SignIn.jsx`, `SenderSignIn.jsx`) or signing up (`SignUp.jsx`), `api.js` was saving the token to `localStorage`, but React's `AuthContext` was not being notified before `navigate('/feed')` or `navigate('/sender/portal')` executed. Because `ProtectedRoute` saw `user: null` in React state, it was immediately kicking the user back to the sign-in page.
- **Fix:**
  - `completeAuth()` in `api.js` and `signOut()` now broadcast a `classcheck_auth_change` event.
  - `AuthContext.jsx` listens for `classcheck_auth_change` events.
  - `SignIn.jsx`, `SignUp.jsx`, and `SenderSignIn.jsx` now call `await refreshProfile()` directly from `useAuth()` to guarantee React state is loaded before route navigation.
  - `Navbar.jsx`, `SenderNavbar.jsx`, and `AdminNavbar.jsx` also call `await refreshProfile()` on sign-out to immediately reset auth state.

### 3. Fixed Minor HTML Label Typo in Sign In (`SignIn.jsx`)
- **Problem:** The newly added Email field had `<label htmlFor="matricNo">Email</label>`.
- **Fix:** Changed to `<label htmlFor="email">Email</label>`.

---

## 🔌 API Endpoints Contract (Current & Working)

| Endpoint | Method | Sent Payload | Frontend Function |
|---|---|---|---|
| `/auth/signup` | POST | `{ full_name, matric_no, email, department, level, password }` | `api.signUpStudent` |
| `/auth/signin` | POST | `{ email, matric_no, password }` | `api.signInStudent` (or email+pwd for senders/admin) |
| `/auth/signout` | POST | *(Bearer Token)* | `api.signOut` |
| `/auth/forgot-password` | POST | `{ matric_no }` | `api.resetPassword` |
| `/auth/password` | PUT | `{ password }` | `api.updatePassword` |
| `/auth/account` | DELETE | *(Bearer Token)* | `api.deleteAccount` |
| `/profile/me` | GET | *(Bearer Token)* | `api.getMyProfile` |
| `/courses` | GET | *(Bearer Token)* | `api.getCourses` |
| `/students/:id/courses` | GET | *(Bearer Token)* | `api.getStudentSubscriptions` |
| `/students/:id/courses` | PUT | `{ course_ids }` | `api.updateSubscriptions` |
| `/feed` | GET | *(Bearer Token)* | `api.getFeed` |
| `/updates` | POST | `{ course_id, type, new_venue, note }` | `api.postUpdate` |
| `/senders/:id/courses` | GET | *(Bearer Token)* | `api.getSenderCourses` |
| `/senders/:id/updates` | GET | *(Bearer Token)* | `api.getSenderHistory` |
| `/waitlist` | POST | `{ name, email, department, university }` | `api.joinWaitlist` |
| `/admin/overview` | GET | *(Bearer Token)* | `api.getOverviewMetrics` |
| `/senders` | GET / POST | *(Admin)* | `api.getSenders`, `api.createSender` |

---

## 🚀 Running the Frontend Locally

```bash
cd frontend
npm run build   # Verified: builds cleanly with 0 errors
npm run dev     # Starts Vite dev server at http://localhost:5173
```
Ensure your `frontend/.env` has:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

## 📚 4. Course Seeding & Venue Changes Guidance

### A. Course Seeding (`courses` table)
The 400-level Mathematics pilot requires seed courses so students can pick them on the Onboarding screen (`/onboarding`). We added the seed statements to `backend/db.sql`:
```sql
insert into public.courses (course_code, course_name, department, level)
values
  ('MAT401', 'Real Analysis III', 'Mathematics', '400'),
  ('MAT403', 'Complex Analysis II', 'Mathematics', '400'),
  ('MAT405', 'Abstract Algebra II', 'Mathematics', '400'),
  ('MAT407', 'Differential Equations III', 'Mathematics', '400'),
  ('MAT409', 'Topology', 'Mathematics', '400'),
  ('MAT411', 'Functional Analysis', 'Mathematics', '400'),
  ('MAT413', 'Numerical Analysis II', 'Mathematics', '400'),
  ('MAT415', 'Operations Research', 'Mathematics', '400'),
  ('MAT417', 'Mathematical Methods', 'Mathematics', '400'),
  ('MAT419', 'Fluid Dynamics', 'Mathematics', '400'),
  ('MAT497', 'Final Year Project', 'Mathematics', '400')
on conflict (course_code) do nothing;
```

### B. Venue Changes Flow
When a lecturer or class rep posts a venue change on `/sender/portal`:
- Payload sent:
  ```json
  {
    "course_id": "uuid",
    "type": "venue_change",
    "new_venue": "LT 1",
    "note": "Bring your graphing calculators"
  }
  ```
- Backend validates with `createUpdateSchema`: `new_venue` is required when `type === 'venue_change'`.
- On the student feed (`/feed`), venue changes render with an amber "Venue change" badge, the new venue prominently highlighted, and can be filtered using the "Venue change" pill.

