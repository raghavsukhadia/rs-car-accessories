-- ===============================
-- 0002_hardening_admin.sql
-- Make access admin-only; add helper; fix email; add completed_at helper
-- ===============================

-- 1) Helper: is_admin()  (uses your existing public.admin_allowlist table)
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.admin_allowlist a
    where a.email = (auth.jwt() ->> 'email')
  );
$$;

-- 2) Replace permissive RLS with admin-only

-- app_config
drop policy if exists "Allow authenticated users to read app_config" on public.app_config;
drop policy if exists "Allow admins to modify app_config" on public.app_config;
do $$ begin
  create policy "admin all app_config"
    on public.app_config
    for all
    using (public.is_admin())
    with check (public.is_admin());
exception
  when duplicate_object then
    null;
end $$;

-- admin_allowlist
drop policy if exists "Allow admins to manage admin_allowlist" on public.admin_allowlist;
do $$ begin
  create policy "admin all admin_allowlist"
    on public.admin_allowlist
    for all
    using (public.is_admin())
    with check (public.is_admin());
exception
  when duplicate_object then
    null;
end $$;

-- call_followups
drop policy if exists "Allow authenticated users to manage call_followups" on public.call_followups;
do $$ begin
  create policy "admin all call_followups"
    on public.call_followups
    for all
    using (public.is_admin())
    with check (public.is_admin());
exception
  when duplicate_object then
    null;
end $$;

-- service_jobs
drop policy if exists "Allow authenticated users to manage service_jobs" on public.service_jobs;
do $$ begin
  create policy "admin all service_jobs"
    on public.service_jobs
    for all
    using (public.is_admin())
    with check (public.is_admin());
exception
  when duplicate_object then
    null;
end $$;

-- service_job_comments
drop policy if exists "Allow authenticated users to manage service_job_comments" on public.service_job_comments;
do $$ begin
  create policy "admin all service_job_comments"
    on public.service_job_comments
    for all
    using (public.is_admin())
    with check (public.is_admin());
exception
  when duplicate_object then
    null;
end $$;

-- requirements
drop policy if exists "Allow authenticated users to manage requirements" on public.requirements;
do $$ begin
  create policy "admin all requirements"
    on public.requirements
    for all
    using (public.is_admin())
    with check (public.is_admin());
exception
  when duplicate_object then
    null;
end $$;

-- requirement_comments
drop policy if exists "Allow authenticated users to manage requirement_comments" on public.requirement_comments;
do $$ begin
  create policy "admin all requirement_comments"
    on public.requirement_comments
    for all
    using (public.is_admin())
    with check (public.is_admin());
exception
  when duplicate_object then
    null;
end $$;

-- attachments
drop policy if exists "Allow authenticated users to manage attachments" on public.attachments;
do $$ begin
  create policy "admin all attachments"
    on public.attachments
    for all
    using (public.is_admin())
    with check (public.is_admin());
exception
  when duplicate_object then
    null;
end $$;

-- 3) Storage: make objects admin-only for the 'attachments' bucket
drop policy if exists "Allow authenticated users to upload attachments" on storage.objects;
drop policy if exists "Allow authenticated users to view attachments" on storage.objects;
drop policy if exists "Allow authenticated users to update attachments" on storage.objects;
drop policy if exists "Allow authenticated users to delete attachments" on storage.objects;

do $$ begin
  create policy "admin all attachments objects"
    on storage.objects
    for all
    using (bucket_id = 'attachments' and public.is_admin())
    with check (bucket_id = 'attachments' and public.is_admin());
exception
  when duplicate_object then
    null;
end $$;

-- 4) Business rule: auto-set completed_at when status becomes 'Completed'
create or replace function public.set_completed_at_on_status()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'Completed' and (old.status is distinct from new.status) then
    if new.completed_at is null then
      new.completed_at := now();
    end if;
  end if;
  return new;
end $$;

do $$ begin
  create trigger service_jobs_complete_time
    before update on public.service_jobs
    for each row execute procedure public.set_completed_at_on_status();
exception
  when duplicate_object then
    null;
end $$;

-- 5) Fix the placeholder admin email safely
insert into public.admin_allowlist (email)
values ('piyush@snkool.in')
on conflict (email) do nothing;

-- remove the example email if it exists
delete from public.admin_allowlist
where email = 'admin@rscaraccessories.com' and email <> 'piyush@snkool.in';
