-- ============================================================
-- ClassCheck — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ─── Enable UUID extension ──────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── ENUM types ─────────────────────────────────────────────
create type sender_role as enum ('lecturer', 'class_rep');
create type sender_status as enum ('active', 'inactive');
create type update_type as enum ('cancelled', 'venue_change');

-- ─── TABLES ─────────────────────────────────────────────────

create table public.students (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text not null,
  matric_no    text not null unique,
  department   text not null,
  level        text not null check (level in ('100','200','300','400','500')),
  onboarded    boolean not null default false,
  created_at   timestamptz not null default now()
);

create table public.senders (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text not null,
  email        text not null unique,
  role         sender_role not null,
  status       sender_status not null default 'active',
  created_at   timestamptz not null default now()
);

create table public.courses (
  id           uuid primary key default uuid_generate_v4(),
  course_code  text not null unique,
  course_name  text not null,
  department   text not null,
  level        text not null check (level in ('100','200','300','400','500')),
  created_at   timestamptz not null default now()
);

create table public.sender_courses (
  id         uuid primary key default uuid_generate_v4(),
  sender_id  uuid not null references public.senders(id) on delete cascade,
  course_id  uuid not null references public.courses(id) on delete cascade,
  unique (sender_id, course_id)
);

create table public.student_courses (
  id         uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.students(id) on delete cascade,
  course_id  uuid not null references public.courses(id) on delete cascade,
  unique (student_id, course_id)
);

create table public.updates (
  id          uuid primary key default uuid_generate_v4(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  sender_id   uuid not null references public.senders(id) on delete cascade,
  type        update_type not null,
  new_venue   text,
  note        text,
  created_at  timestamptz not null default now()
);

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────

alter table public.students       enable row level security;
alter table public.senders        enable row level security;
alter table public.courses        enable row level security;
alter table public.sender_courses enable row level security;
alter table public.student_courses enable row level security;
alter table public.updates        enable row level security;

-- Helper function: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select coalesce(
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin',
    false
  );
$$;

-- Helper function: is the current user a sender?
create or replace function public.is_sender()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.senders where id = auth.uid() and status = 'active'
  );
$$;

-- Students table policies
create policy "Students: read own row"
  on public.students for select
  using (id = auth.uid() or public.is_admin());

create policy "Students: insert own row"
  on public.students for insert
  with check (id = auth.uid());

create policy "Students: update own row"
  on public.students for update
  using (id = auth.uid());

create policy "Students: admin can delete"
  on public.students for delete
  using (public.is_admin());

-- Senders table policies
create policy "Senders: read own row or admin"
  on public.senders for select
  using (id = auth.uid() or public.is_admin());

create policy "Senders: admin can insert"
  on public.senders for insert
  with check (public.is_admin());

create policy "Senders: admin can update"
  on public.senders for update
  using (public.is_admin());

create policy "Senders: admin can delete"
  on public.senders for delete
  using (public.is_admin());

-- Courses table policies
create policy "Courses: anyone authenticated can read"
  on public.courses for select
  using (auth.uid() is not null);

create policy "Courses: admin can insert"
  on public.courses for insert
  with check (public.is_admin());

create policy "Courses: admin can update"
  on public.courses for update
  using (public.is_admin());

create policy "Courses: admin can delete"
  on public.courses for delete
  using (public.is_admin());

-- Sender_courses policies
create policy "SenderCourses: sender can read own"
  on public.sender_courses for select
  using (sender_id = auth.uid() or public.is_admin());

create policy "SenderCourses: admin can insert"
  on public.sender_courses for insert
  with check (public.is_admin());

create policy "SenderCourses: admin can delete"
  on public.sender_courses for delete
  using (public.is_admin());

-- Student_courses policies
create policy "StudentCourses: student can read own"
  on public.student_courses for select
  using (student_id = auth.uid() or public.is_admin());

create policy "StudentCourses: student can insert own"
  on public.student_courses for insert
  with check (student_id = auth.uid());

create policy "StudentCourses: student can delete own"
  on public.student_courses for delete
  using (student_id = auth.uid() or public.is_admin());

-- Updates policies
create policy "Updates: students can read updates for subscribed courses"
  on public.updates for select
  using (
    public.is_admin()
    or (public.is_sender() and sender_id = auth.uid())
    or exists (
      select 1 from public.student_courses sc
      where sc.student_id = auth.uid()
        and sc.course_id = updates.course_id
    )
  );

create policy "Updates: sender can insert for assigned courses"
  on public.updates for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.sender_courses sc
      where sc.sender_id = auth.uid()
        and sc.course_id = updates.course_id
    )
  );

create policy "Updates: sender can delete own"
  on public.updates for delete
  using (sender_id = auth.uid() or public.is_admin());

-- ─── REALTIME ───────────────────────────────────────────────
-- Enable realtime on the updates table
alter publication supabase_realtime add table public.updates;

-- ─── SEED DATA ──────────────────────────────────────────────
-- Mathematics 400 Level — current semester courses

insert into public.courses (course_code, course_name, department, level) values
  ('MAT401', 'Theory of Ordinary Differential Equations', 'Mathematics', '400'),
  ('MAT403', 'Functional Analysis', 'Mathematics', '400'),
  ('MAT405', 'Lebesgue Measure and Integrals', 'Mathematics', '400'),
  ('MAT407', 'Mathematical Methods III', 'Mathematics', '400'),
  ('MAT409', 'Introduction to Mathematical Modelling', 'Mathematics', '400'),
  ('MAT411', 'Cryptography', 'Mathematics', '400'),
  ('MAT431', 'Numerical Analysis II', 'Mathematics', '400'),
  ('MAT415', 'Complex Analysis III', 'Mathematics', '400'),
  ('MAT421', 'Probability IV', 'Mathematics', '400'),
  ('MAT461', 'Statistical Inference II', 'Mathematics', '400'),
  ('MAT497', 'Seminar', 'Mathematics', '400')
on conflict (course_code) do nothing;

-- ─── NOTES FOR ADMIN SETUP ──────────────────────────────────
-- After running this schema:
--
-- 1. In Supabase Dashboard > Authentication > Users, create an admin user:
--    Email: admin@classcheck.ng
--    Password: (choose a strong password)
--
-- 2. In Supabase Dashboard > Authentication > Users, click the admin user,
--    then edit their app_metadata to add:
--    { "role": "admin" }
--
-- 3. Copy your Project URL and anon key to .env:
--    VITE_SUPABASE_URL=https://xxxx.supabase.co
--    VITE_SUPABASE_ANON_KEY=eyJ...
CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  department text NOT NULL,
  university text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.waitlist;
CREATE POLICY "Allow anonymous inserts" ON public.waitlist FOR INSERT TO anon WITH CHECK (true);
