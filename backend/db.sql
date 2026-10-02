create extension if not exists "pgcrypto";

-- ============================================================================
-- 0. ENUM TYPES
-- ============================================================================

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'profile_role'
  ) then
    create type public.profile_role as enum (
      'student',
      'lecturer',
      'class_rep',
      'hod',
      'dept_head',
      'admin'
    );
  end if;
end
$$;


do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'reaction_type'
  ) then
    create type public.reaction_type as enum (
      'like',
      'heart',
      'seen'
    );
  end if;
end
$$;


-- ============================================================================
-- 1. DEPARTMENTS
-- ============================================================================

create table if not exists public.departments (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  code        text not null unique,
  created_at  timestamptz not null default now()
);


create index if not exists idx_departments_name
  on public.departments(name);

create index if not exists idx_departments_code
  on public.departments(code);

-- Default department
insert into public.departments (name, code)
values ('Mathematics', 'MATH')
on conflict (name) do nothing;

-- ============================================================================
-- 2. PROFILES
-- ============================================================================

create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,

  full_name        text not null,
  email            text not null,

  -- Kept for compatibility with the current signup API
  matric_no        text,

  -- Kept for compatibility with the current backend.
  -- The canonical department relationship is department_id.
  department       text,

  department_id    uuid references public.departments(id) on delete set null,

  level            text,

  role             public.profile_role not null default 'student',

  status           text not null default 'active'
                   check (status in ('active', 'inactive')),

  is_admin         boolean not null default false,

  phone            text,
  location         text,

  identity_status  text not null default 'unverified',

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);


-- If profiles already existed from an older version, make sure all
-- required columns exist.

alter table public.profiles
  add column if not exists full_name text;

alter table public.profiles
  add column if not exists email text;

alter table public.profiles
  add column if not exists matric_no text;

alter table public.profiles
  add column if not exists department text;

alter table public.profiles
  add column if not exists department_id uuid
    references public.departments(id)
    on delete set null;

alter table public.profiles
  add column if not exists level text;

alter table public.profiles
  add column if not exists role public.profile_role
    default 'student';

alter table public.profiles
  add column if not exists status text
    default 'active';

alter table public.profiles
  add column if not exists is_admin boolean
    default false;

alter table public.profiles
  add column if not exists phone text;

alter table public.profiles
  add column if not exists location text;

alter table public.profiles
  add column if not exists identity_status text
    default 'unverified';

alter table public.profiles
  add column if not exists created_at timestamptz
    default now();

alter table public.profiles
  add column if not exists updated_at timestamptz
    default now();


-- ============================================================================
-- 3. PROFILE INDEXES
-- ============================================================================

create index if not exists idx_profiles_department
  on public.profiles(department_id);

create index if not exists idx_profiles_role
  on public.profiles(role);

create index if not exists idx_profiles_level
  on public.profiles(level);


create unique index if not exists idx_profiles_matric_no_unique
  on public.profiles(matric_no)
  where matric_no is not null;


-- ============================================================================
-- 4. COURSES
-- ============================================================================

create table if not exists public.courses (
  id           uuid primary key default gen_random_uuid(),

  course_code  text not null unique,
  course_name  text not null,

  department   text not null,
  level        text not null,

  created_at   timestamptz not null default now()
);


create index if not exists idx_courses_department_level
  on public.courses(department, level);


-- ============================================================================
-- 5. STUDENT COURSE SUBSCRIPTIONS
-- ============================================================================

create table if not exists public.student_courses (
  id          uuid primary key default gen_random_uuid(),

  student_id  uuid not null
              references public.profiles(id)
              on delete cascade,

  course_id   uuid not null
              references public.courses(id)
              on delete cascade,

  created_at  timestamptz not null default now(),

  unique (student_id, course_id)
);


create index if not exists idx_student_courses_student
  on public.student_courses(student_id);

create index if not exists idx_student_courses_course
  on public.student_courses(course_id);


-- ============================================================================
-- 6. SENDER COURSE ASSIGNMENTS
-- ============================================================================

create table if not exists public.sender_courses (
  id          uuid primary key default gen_random_uuid(),

  sender_id   uuid not null
              references public.profiles(id)
              on delete cascade,

  course_id   uuid not null
              references public.courses(id)
              on delete cascade,

  created_at  timestamptz not null default now(),

  unique (sender_id, course_id)
);


create index if not exists idx_sender_courses_sender
  on public.sender_courses(sender_id);

create index if not exists idx_sender_courses_course
  on public.sender_courses(course_id);


-- ============================================================================
-- 7. UPDATES
-- ============================================================================

create table if not exists public.updates (
  id          uuid primary key default gen_random_uuid(),

  course_id   uuid not null
              references public.courses(id)
              on delete cascade,

  sender_id   uuid not null
              references public.profiles(id)
              on delete cascade,

  type        text not null
              check (type in ('cancelled', 'venue_change')),

  new_venue   text,

  note        text,

  created_at  timestamptz not null default now(),

  check (
    type <> 'venue_change'
    or new_venue is not null
  )
);


create index if not exists idx_updates_course
  on public.updates(course_id);

create index if not exists idx_updates_sender
  on public.updates(sender_id);

create index if not exists idx_updates_created_at
  on public.updates(created_at desc);


-- ============================================================================
-- 8. POSTS
-- ============================================================================

create table if not exists public.posts (
  id              uuid primary key default gen_random_uuid(),

  author_id       uuid not null
                  references public.profiles(id)
                  on delete cascade,

  department_id   uuid not null
                  references public.departments(id)
                  on delete cascade,

  title           text not null
                  check (char_length(title) between 2 and 150),

  content         text not null
                  check (char_length(content) between 1 and 3000),

  course_code     text,

  location        text,

  class_time      timestamptz,

  created_at      timestamptz not null default now(),

  updated_at      timestamptz not null default now()
);


create index if not exists idx_posts_department
  on public.posts(department_id);

create index if not exists idx_posts_author
  on public.posts(author_id);

create index if not exists idx_posts_created_at
  on public.posts(created_at desc);


-- ============================================================================
-- 9. REACTIONS
-- ============================================================================

create table if not exists public.reactions (
  id          uuid primary key default gen_random_uuid(),

  post_id     uuid not null
              references public.posts(id)
              on delete cascade,

  user_id     uuid not null
              references public.profiles(id)
              on delete cascade,

  type        public.reaction_type not null default 'like',

  created_at  timestamptz not null default now(),

  unique (post_id, user_id)
);


create index if not exists idx_reactions_post
  on public.reactions(post_id);

create index if not exists idx_reactions_user
  on public.reactions(user_id);


-- ============================================================================
-- 10. NOTIFICATIONS
-- ============================================================================

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null
              references public.profiles(id)
              on delete cascade,
  post_id     uuid
              references public.posts(id)
              on delete cascade,
  update_id   uuid
              references public.updates(id)
              on delete cascade,
  message     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- 10.1. MIGRATE EXISTING NOTIFICATIONS TABLE
-- ============================================================================

-- These are necessary because CREATE TABLE IF NOT EXISTS does not modify
-- a table that was created by an older version of the schema.

alter table public.notifications
  add column if not exists post_id uuid;

alter table public.notifications
  add column if not exists update_id uuid;

-- Add the foreign-key constraints only if the columns were missing before.
-- PostgreSQL does not support "ADD CONSTRAINT IF NOT EXISTS", so use a
-- conditional DO block.

do $$
begin

  if not exists (
    select 1
    from pg_constraint
    where conname = 'notifications_post_id_fkey'
      and conrelid = 'public.notifications'::regclass
  ) then
    alter table public.notifications
      add constraint notifications_post_id_fkey
      foreign key (post_id)
      references public.posts(id)
      on delete cascade;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'notifications_update_id_fkey'
      and conrelid = 'public.notifications'::regclass
  ) then
    alter table public.notifications
      add constraint notifications_update_id_fkey
      foreign key (update_id)
      references public.updates(id)
      on delete cascade;
  end if;

end
$$;


create index if not exists idx_notifications_user
  on public.notifications(user_id, is_read);

create index if not exists idx_notifications_post
  on public.notifications(post_id);

create index if not exists idx_notifications_update
  on public.notifications(update_id);

create index if not exists idx_notifications_created
  on public.notifications(created_at desc);


-- ============================================================================
-- 11. WAITLIST
-- ============================================================================

create table if not exists public.waitlist (
  id           uuid primary key default gen_random_uuid(),

  name         text not null,

  email        text not null unique,

  department   text not null,

  university   text not null,

  created_at   timestamptz not null default now()
);


-- ============================================================================
-- 12. IDENTITY VERIFICATIONS
-- ============================================================================

create table if not exists public.identity_verifications (
  id           uuid primary key default gen_random_uuid(),

  user_id      uuid not null
               references public.profiles(id)
               on delete cascade,

  inquiry_id   text not null unique,

  status       text not null default 'pending',

  created_at   timestamptz not null default now(),

  updated_at   timestamptz not null default now()
);


create index if not exists idx_identity_verifications_user
  on public.identity_verifications(user_id);

create index if not exists idx_identity_verifications_status
  on public.identity_verifications(status);


-- ============================================================================
-- 13. HELPER FUNCTIONS
-- ============================================================================

create or replace function public.get_auth_user_role()
returns public.profile_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid();
$$;


create or replace function public.get_auth_user_dept()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select department_id
  from public.profiles
  where id = auth.uid();
$$;


create or replace function public.can_post_announcements(
  p_role public.profile_role
)
returns boolean
language sql
immutable
as $$
  select p_role in (
    'lecturer',
    'hod',
    'dept_head',
    'admin'
  );
$$;


-- ============================================================================
-- 14. UPDATED_AT TRIGGER FUNCTION
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


drop trigger if exists trg_profiles_updated_at
on public.profiles;

create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();


drop trigger if exists trg_posts_updated_at
on public.posts;

create trigger trg_posts_updated_at
before update on public.posts
for each row
execute function public.set_updated_at();


-- ============================================================================
-- 15. NOTIFICATION: COURSE UPDATE
-- ============================================================================

create or replace function public.notify_students_on_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$

declare
  v_course_code text;

begin

  select course_code
  into v_course_code
  from public.courses
  where id = new.course_id;

  insert into public.notifications (
    user_id,
    update_id,
    message
  )

  select
    sc.student_id,
    new.id,

    case new.type

      when 'cancelled'
        then concat(
          v_course_code,
          ' class has been cancelled.'
        )

      else concat(
        v_course_code,
        ' venue changed to ',
        coalesce(new.new_venue, 'TBA'),
        '.'
      )

    end

  from public.student_courses sc
  where sc.course_id = new.course_id;

  return new;

end;
$$;


drop trigger if exists trg_notify_on_update
on public.updates;

create trigger trg_notify_on_update
after insert on public.updates
for each row
execute function public.notify_students_on_update();


-- ============================================================================
-- 16. NOTIFICATION: DEPARTMENT POST
-- ============================================================================

create or replace function public.notify_department_on_new_post()
returns trigger
language plpgsql
security definer
set search_path = public
as $$

begin

  insert into public.notifications (
    user_id,
    post_id,
    message
  )

  select
    p.id,
    new.id,
    concat(
      'New post in your department: ',
      new.title
    )

  from public.profiles p

  where p.department_id = new.department_id
    and p.role = 'student';

  return new;

end;
$$;


drop trigger if exists trg_notify_on_post
on public.posts;

create trigger trg_notify_on_post
after insert on public.posts
for each row
execute function public.notify_department_on_new_post();


-- ============================================================================
-- 17. ROW LEVEL SECURITY
-- ============================================================================

alter table public.departments
enable row level security;

alter table public.profiles
enable row level security;

alter table public.courses
enable row level security;

alter table public.student_courses
enable row level security;

alter table public.sender_courses
enable row level security;

alter table public.updates
enable row level security;

alter table public.posts
enable row level security;

alter table public.reactions
enable row level security;

alter table public.notifications
enable row level security;

alter table public.waitlist
enable row level security;

alter table public.identity_verifications
enable row level security;


-- ============================================================================
-- 18. DEPARTMENT POLICIES
-- ============================================================================

drop policy if exists "departments_select_all"
on public.departments;

create policy "departments_select_all"
on public.departments
for select
to authenticated
using (true);


drop policy if exists "departments_admin_write"
on public.departments;

create policy "departments_admin_write"
on public.departments
for all
to authenticated
using (
  public.get_auth_user_role() = 'admin'
)
with check (
  public.get_auth_user_role() = 'admin'
);


-- ============================================================================
-- 19. PROFILE POLICIES
-- ============================================================================

drop policy if exists "profiles_select_all"
on public.profiles;

create policy "profiles_select_all"
on public.profiles
for select
to authenticated
using (true);


drop policy if exists "profiles_update_own"
on public.profiles;

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
);


-- ============================================================================
-- 20. COURSE POLICIES
-- ============================================================================

drop policy if exists "courses_select_all"
on public.courses;

create policy "courses_select_all"
on public.courses
for select
to authenticated
using (true);


drop policy if exists "courses_admin_write"
on public.courses;

create policy "courses_admin_write"
on public.courses
for all
to authenticated
using (
  public.get_auth_user_role() = 'admin'
)
with check (
  public.get_auth_user_role() = 'admin'
);


-- ============================================================================
-- 21. STUDENT COURSE POLICIES
-- ============================================================================

drop policy if exists "student_courses_own"
on public.student_courses;

create policy "student_courses_own"
on public.student_courses
for all
to authenticated
using (
  student_id = auth.uid()
  or public.get_auth_user_role() = 'admin'
)
with check (
  student_id = auth.uid()
  or public.get_auth_user_role() = 'admin'
);


-- ============================================================================
-- 22. SENDER COURSE POLICIES
-- ============================================================================

drop policy if exists "sender_courses_read"
on public.sender_courses;

create policy "sender_courses_read"
on public.sender_courses
for select
to authenticated
using (
  sender_id = auth.uid()
  or public.get_auth_user_role() = 'admin'
);


drop policy if exists "sender_courses_admin_write"
on public.sender_courses;

create policy "sender_courses_admin_write"
on public.sender_courses
for insert
to authenticated
with check (
  public.get_auth_user_role() = 'admin'
);


-- ============================================================================
-- 23. UPDATE POLICIES
-- ============================================================================

drop policy if exists "updates_select_all"
on public.updates;

create policy "updates_select_all"
on public.updates
for select
to authenticated
using (true);


drop policy if exists "updates_insert_assigned_sender"
on public.updates;

create policy "updates_insert_assigned_sender"
on public.updates
for insert
to authenticated
with check (
  sender_id = auth.uid()

  and exists (
    select 1
    from public.sender_courses sc
    where sc.sender_id = auth.uid()
      and sc.course_id = course_id
  )
);


drop policy if exists "updates_delete_own_or_admin"
on public.updates;

create policy "updates_delete_own_or_admin"
on public.updates
for delete
to authenticated
using (
  sender_id = auth.uid()
  or public.get_auth_user_role() = 'admin'
);


-- ============================================================================
-- 24. POST POLICIES
-- ============================================================================

drop policy if exists "posts_select_all"
on public.posts;

create policy "posts_select_all"
on public.posts
for select
to authenticated
using (true);


drop policy if exists "posts_insert_staff_own_dept"
on public.posts;

create policy "posts_insert_staff_own_dept"
on public.posts
for insert
to authenticated
with check (
  author_id = auth.uid()

  and public.can_post_announcements(
    public.get_auth_user_role()
  )

  and department_id = public.get_auth_user_dept()
);


drop policy if exists "posts_update_author_or_admin"
on public.posts;

create policy "posts_update_author_or_admin"
on public.posts
for update
to authenticated
using (
  author_id = auth.uid()
  or public.get_auth_user_role() = 'admin'
);


drop policy if exists "posts_delete_author_or_admin"
on public.posts;

create policy "posts_delete_author_or_admin"
on public.posts
for delete
to authenticated
using (
  author_id = auth.uid()
  or public.get_auth_user_role() = 'admin'
);


-- ============================================================================
-- 25. REACTION POLICIES
-- ============================================================================

drop policy if exists "reactions_select_all"
on public.reactions;

create policy "reactions_select_all"
on public.reactions
for select
to authenticated
using (true);


drop policy if exists "reactions_insert_own"
on public.reactions;

create policy "reactions_insert_own"
on public.reactions
for insert
to authenticated
with check (
  user_id = auth.uid()
);


drop policy if exists "reactions_update_own"
on public.reactions;

create policy "reactions_update_own"
on public.reactions
for update
to authenticated
using (
  user_id = auth.uid()
);


drop policy if exists "reactions_delete_own"
on public.reactions;

create policy "reactions_delete_own"
on public.reactions
for delete
to authenticated
using (
  user_id = auth.uid()
);


-- ============================================================================
-- 26. NOTIFICATION POLICIES
-- ============================================================================

drop policy if exists "notifications_select_own"
on public.notifications;

create policy "notifications_select_own"
on public.notifications
for select
to authenticated
using (
  user_id = auth.uid()
);


drop policy if exists "notifications_update_own"
on public.notifications;

create policy "notifications_update_own"
on public.notifications
for update
to authenticated
using (
  user_id = auth.uid()
);


-- ============================================================================
-- 27. WAITLIST POLICIES
-- ============================================================================

drop policy if exists "waitlist_insert_anyone"
on public.waitlist;

create policy "waitlist_insert_anyone"
on public.waitlist
for insert
to anon, authenticated
with check (true);


-- ============================================================================
-- 28. IDENTITY VERIFICATION POLICIES
-- ============================================================================

drop policy if exists "identity_verifications_select_own"
on public.identity_verifications;

create policy "identity_verifications_select_own"
on public.identity_verifications
for select
to authenticated
using (
  user_id = auth.uid()
);


-- ============================================================================
-- 29. SUPABASE POSTGREST SCHEMA RELOAD
-- ============================================================================

notify pgrst, 'reload schema';