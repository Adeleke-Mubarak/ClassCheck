-- ClassCheck missing-feature migration. Review and run in Supabase SQL Editor.
-- Waitlist status and admin-only read/update/delete policies.
alter table public.waitlist add column if not exists status text not null default 'pending'
  check (status in ('pending', 'contacted', 'launched'));

drop policy if exists waitlist_select_admin on public.waitlist;
create policy waitlist_select_admin on public.waitlist for select to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
drop policy if exists waitlist_update_admin on public.waitlist;
create policy waitlist_update_admin on public.waitlist for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
drop policy if exists waitlist_delete_admin on public.waitlist;
create policy waitlist_delete_admin on public.waitlist for delete to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- One current vote per student/course; submitting again changes that student's vote.
create table if not exists public.hall_pulse_reports (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('in_class', 'late', 'not_in_class')),
  created_at timestamptz not null default now(),
  unique (course_id, user_id)
);
create unique index if not exists idx_hall_pulse_course_user_unique on public.hall_pulse_reports (course_id, user_id);
create index if not exists idx_hall_pulse_course_time on public.hall_pulse_reports (course_id, created_at desc);
alter table public.hall_pulse_reports enable row level security;
drop policy if exists hall_pulse_select_authenticated on public.hall_pulse_reports;
create policy hall_pulse_select_authenticated on public.hall_pulse_reports for select to authenticated using (true);
drop policy if exists hall_pulse_insert_students on public.hall_pulse_reports;
create policy hall_pulse_insert_students on public.hall_pulse_reports for insert to authenticated
  with check (user_id = auth.uid());
drop policy if exists hall_pulse_update_own on public.hall_pulse_reports;
create policy hall_pulse_update_own on public.hall_pulse_reports for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_push_subs_user on public.push_subscriptions (user_id);
alter table public.push_subscriptions enable row level security;
drop policy if exists push_subscriptions_select_own on public.push_subscriptions;
create policy push_subscriptions_select_own on public.push_subscriptions for select to authenticated using (user_id = auth.uid());
drop policy if exists push_subscriptions_insert_own on public.push_subscriptions;
create policy push_subscriptions_insert_own on public.push_subscriptions for insert to authenticated with check (user_id = auth.uid());
drop policy if exists push_subscriptions_delete_own on public.push_subscriptions;
create policy push_subscriptions_delete_own on public.push_subscriptions for delete to authenticated using (user_id = auth.uid());

-- Realtime publication additions are guarded to avoid errors on already-added tables.
do $$ begin
  alter publication supabase_realtime add table public.updates;
exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.timetable_entries;
exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.hall_pulse_reports;
exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.waitlist;
exception when duplicate_object then null; when undefined_object then null; end $$;
