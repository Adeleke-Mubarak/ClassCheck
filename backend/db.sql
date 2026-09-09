create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. Departments
-- ---------------------------------------------------------------------------
create table if not exists public.departments (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  code        text not null unique,      
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. Base Profiles Table & Extensions
-- ---------------------------------------------------------------------------
-- Create base profiles table linked to auth.users if it doesn't exist yet
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  matric_no   text,
  is_admin    boolean not null default false,
  phone       text,
  location    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'profile_role') then
    create type public.profile_role as enum (
      'student', 'lecturer', 'hod', 'dept_head', 'admin'
    );
  end if;
end$$;

alter table public.profiles
  add column if not exists role          public.profile_role not null default 'student',
  add column if not exists department_id uuid references public.departments(id) on delete set null;

create index if not exists idx_profiles_department on public.profiles(department_id);
create index if not exists idx_profiles_role        on public.profiles(role);

-- Helper functions
create or replace function public.get_auth_user_role()
returns public.profile_role
language sql stable security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.get_auth_user_dept()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select department_id from public.profiles where id = auth.uid();
$$;

create or replace function public.can_post_announcements(p_role public.profile_role)
returns boolean language sql immutable as $$
  select p_role in ('lecturer', 'hod', 'dept_head', 'admin');
$$;

-- ---------------------------------------------------------------------------
-- 3. Posts
-- ---------------------------------------------------------------------------
create table if not exists public.posts (
  id              uuid primary key default gen_random_uuid(),
  author_id       uuid not null references public.profiles(id) on delete cascade,
  department_id   uuid not null references public.departments(id) on delete cascade,
  title           text not null check (char_length(title) between 2 and 150),
  content         text not null check (char_length(content) between 1 and 3000),
  course_code     text,
  location        text,
  class_time      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_posts_department  on public.posts(department_id);
create index if not exists idx_posts_author      on public.posts(author_id);
create index if not exists idx_posts_created_at  on public.posts(created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_posts_updated_at on public.posts;
create trigger trg_posts_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- Enable RLS on profiles if not already enabled
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

-- ---------------------------------------------------------------------------
-- 4. Reactions
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'reaction_type') then
    create type public.reaction_type as enum ('like', 'heart', 'seen');
  end if;
end$$;

create table if not exists public.reactions (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        public.reaction_type not null default 'like',
  created_at  timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists idx_reactions_post on public.reactions(post_id);
create index if not exists idx_reactions_user on public.reactions(user_id);

-- ---------------------------------------------------------------------------
-- 5. Notifications
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  post_id     uuid references public.posts(id) on delete cascade,
  message     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists idx_notifications_user    on public.notifications(user_id, is_read);
create index if not exists idx_notifications_post    on public.notifications(post_id);
create index if not exists idx_notifications_created on public.notifications(created_at desc);

create or replace function public.notify_department_on_new_post()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, post_id, message)
  select p.id, new.id,
         concat('New post in your department: ', new.title)
  from public.profiles p
  where p.department_id = new.department_id
    and p.role = 'student';
  return new;
end;
$$;

drop trigger if exists trg_notify_on_post on public.posts;
create trigger trg_notify_on_post
  after insert on public.posts
  for each row execute function public.notify_department_on_new_post();

-- ---------------------------------------------------------------------------
-- 6. Row Level Security Policies
-- ---------------------------------------------------------------------------
alter table public.departments   enable row level security;
alter table public.posts         enable row level security;
alter table public.reactions     enable row level security;
alter table public.notifications enable row level security;

-- Departments
drop policy if exists "departments_select_all" on public.departments;
create policy "departments_select_all"
  on public.departments for select
  to authenticated
  using (true);

drop policy if exists "departments_admin_write" on public.departments;
create policy "departments_admin_write"
  on public.departments for all
  to authenticated
  using (public.get_auth_user_role() = 'admin')
  with check (public.get_auth_user_role() = 'admin');

-- Posts
drop policy if exists "posts_select_all" on public.posts;
create policy "posts_select_all"
  on public.posts for select
  to authenticated
  using (true);

drop policy if exists "posts_insert_staff_own_dept" on public.posts;
create policy "posts_insert_staff_own_dept"
  on public.posts for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and public.can_post_announcements(public.get_auth_user_role())
    and department_id = public.get_auth_user_dept()
  );

drop policy if exists "posts_update_author_or_admin" on public.posts;
create policy "posts_update_author_or_admin"
  on public.posts for update
  to authenticated
  using (
    author_id = auth.uid()
    or public.get_auth_user_role() = 'admin'
  );

drop policy if exists "posts_delete_author_or_admin" on public.posts;
create policy "posts_delete_author_or_admin"
  on public.posts for delete
  to authenticated
  using (
    author_id = auth.uid()
    or public.get_auth_user_role() = 'admin'
  );

-- Reactions
drop policy if exists "reactions_select_all" on public.reactions;
create policy "reactions_select_all"
  on public.reactions for select
  to authenticated
  using (true);

drop policy if exists "reactions_insert_own" on public.reactions;
create policy "reactions_insert_own"
  on public.reactions for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "reactions_update_own" on public.reactions;
create policy "reactions_update_own"
  on public.reactions for update
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "reactions_delete_own" on public.reactions;
create policy "reactions_delete_own"
  on public.reactions for delete
  to authenticated
  using (user_id = auth.uid());

-- Notifications
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid());