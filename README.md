# ClassCheck

A platform for Nigerian university students that centralises class cancellation and venue change updates.

## Quick Start

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the entire contents of `supabase/schema.sql`
3. In **Authentication > Users**, create your admin user:
   - Email: `admin@classcheck.ng` (or your preferred email)
   - Password: choose a strong password
4. Click on that user and set **app_metadata** to:
   ```json
   { "role": "admin" }
   ```
5. In **Authentication > Settings**, disable "Confirm email" for development convenience (re-enable for production)

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your Supabase project URL and anon key (found in **Project Settings > API**).

### 3. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## User Types

| Type | Sign in | How to create |
|---|---|---|
| **Student** | Matric number + password | Self-register at `/signup` |
| **Sender** | Email + password | Admin creates via dashboard |
| **Admin** | Email + password | Manually created in Supabase |

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/signup` | Student registration |
| `/signin` | Student sign in |
| `/onboarding` | Course subscription (first login) |
| `/feed` | Class updates feed |
| `/my-courses` | Manage course subscriptions |
| `/account` | Student profile |
| `/sender` | Sender/Admin sign in |
| `/sender/portal` | Post class updates |
| `/sender/history` | Posted updates history |
| `/admin` | Admin dashboard |
| `/reset` | Forgot password |

## Tech Stack

- **React 18** + **Vite**
- **Tailwind CSS** — styling
- **Supabase** — auth, database, real-time
- **React Router v6** — routing
- **react-hot-toast** — notifications
- **date-fns** — timestamp formatting

## Real-time Updates

The student feed subscribes to Supabase Realtime on the `updates` table. When a sender posts an update, it appears on all subscribed students' feeds instantly — no refresh needed.
# Classcheck
# Classcheck
