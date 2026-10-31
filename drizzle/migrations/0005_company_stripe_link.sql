ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS stripe_subscription_id text UNIQUE;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS environment text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS org_number text CHECK (org_number IS NULL OR char_length(org_number) <= 20);
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS admin_user_id uuid;