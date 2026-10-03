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
