# ClassCheck - Frontend

**Real-time class update notifications for university students.**

ClassCheck solves a common problem on Nigerian university campuses: students trek long distances to lecture halls only to find out the class has been cancelled or moved to a different venue. ClassCheck delivers instant notifications from verified lecturers and class reps so students always know what's happening before they leave.

---

## Table of Contents

- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [API Architecture (Backend Devs)](#api-architecture-backend-devs)
- [Dev Bypass (Login Mock)](#dev-bypass-login-mock)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)

---

## How It Works

1. **Student signs up** with their matric number, password, department, and level.
2. **Student picks courses** they're enrolled in during onboarding.
3. **Sender (lecturer or class rep)** posts an update — either a class cancellation or a venue change — for a specific course.
4. **Students subscribed to that course** see the update appear in their feed.
5. **Admin** manages everything: creates senders, assigns them to courses, adds new courses, and monitors all activity from a dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite |
| **Styling** | Tailwind CSS + inline styles (dark theme) |
| **Routing** | React Router v6 |
| **PWA** | Vite PWA Plugin |
| **Notifications** | `react-hot-toast` |
| **Dates** | `date-fns` |

---

## API Architecture (Backend Devs)

We have **completely removed Supabase** from the frontend codebase. All database, authentication, and data fetching logic has been centralized into one clean REST API client.

All frontend requests flow through `src/lib/api.js`.

To connect the frontend to your custom backend (Node, Python, PHP, etc.):
1. Create a `.env` file in this `frontend` directory.
2. Add your backend URL: `VITE_API_URL=http://localhost:3000/api` (Replace with your actual backend port/URL).
3. The `src/lib/api.js` file will automatically append the endpoint routes (e.g. `/auth/signin/student`, `/courses`) to your `VITE_API_URL` and send standard `fetch()` requests.

**Authentication:** 
The frontend expects your login routes to return a JSON object containing `{ user, token }`. The `api.js` client automatically stores the `token` in `localStorage` and attaches it as a `Bearer` token to the `Authorization` header of all future requests.

---

## Dev Bypass (Login Mock)

Because the frontend uses a strict `ProtectedRoute` router, you cannot view the internal pages (like `/feed` or `/admin`) unless you are logged in. 

If your backend authentication routes aren't built yet, you will be stuck on the login page! 

**How to bypass login and view the internal pages:**
Open your browser's Developer Console (F12) while on the frontend, paste one of the following snippets, and hit Enter. This manually injects a mock session and refreshes the page, giving you full access.

### Bypass as Student:
```javascript
localStorage.setItem('classcheck_user', JSON.stringify({
  id: 'mock-1', email: 'test@classcheck.app', app_metadata: { role: 'student' },
  user_metadata: { full_name: 'Dev Student', department: 'Mathematics', level: '400' }
}));
localStorage.setItem('classcheck_token', 'dev-token');
location.reload();
```

### Bypass as Admin:
```javascript
localStorage.setItem('classcheck_user', JSON.stringify({
  id: 'admin-1', app_metadata: { role: 'admin' },
  user_metadata: { full_name: 'Dev Admin' }
}));
localStorage.setItem('classcheck_token', 'dev-token');
location.reload();
```

*(To log out and return to normal, run `localStorage.clear(); location.reload();` in the console).*

---

## Getting Started

### Prerequisites

- Node.js 18+

### Install & Run

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be at `http://localhost:5173`

---

## Project Structure

```
frontend/
├── src/
│   ├── main.jsx                # App entry point
│   ├── App.jsx                 # Routes configuration
│   ├── index.css               # Global styles (Tailwind + custom)
│   │
│   ├── lib/
│   │   └── api.js              # ⭐ ALL Backend / Fetch Logic is here!
│   │
│   ├── context/
│   │   └── AuthContext.jsx     # Global auth state (user, profile, role)
│   │
│   ├── components/
│   │   ├── Navbar.jsx          # Student dark navbar (Feed, My Courses, Profile, Sign out)
│   │   ├── ProtectedRoute.jsx  # Route guard (checks role + redirect)
│   │   └── ...                 # Other UI components
│   │
│   └── pages/
│       ├── Landing.jsx         # Public landing page
│       ├── SignUp.jsx          # Student sign up
│       ├── SignIn.jsx          # Student sign in
│       ├── Waitlist.jsx        # Waitlist signup
│       ├── Feed.jsx            # Student feed
│       ├── sender/             # Sender specific pages
│       └── admin/              # Admin dashboard pages
```
