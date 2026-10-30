INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users WHERE lower(email) = 'kontakt@cylinderhjalpen.se'
ON CONFLICT DO NOTHING;