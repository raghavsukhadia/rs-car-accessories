-- Make is_admin() run as table owner and bypass RLS on admin_allowlist
-- (no DROP needed; just alter in-place)
alter function public.is_admin() SECURITY DEFINER;
alter function public.is_admin() set search_path = public;

-- (optional) if you want to be explicit about owner; skip if it errors
-- alter function public.is_admin() owner to postgres;