-- Update admin email to correct address
-- Remove any incorrect emails and add the correct one

-- Remove the old incorrect email
delete from public.admin_allowlist where email = 'Piyush@sunkool.in';

-- Add the correct admin email
insert into public.admin_allowlist (email)
values ('piyush@snkool.in')
on conflict (email) do nothing;
