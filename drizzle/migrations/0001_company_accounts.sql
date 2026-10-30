CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.my_email()
RETURNS text LANGUAGE sql STABLE AS $$ SELECT lower(coalesce(auth.jwt() ->> 'email', '')) $$;

CREATE TABLE public.company_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL CHECK (char_length(company_name) BETWEEN 2 AND 120),
  org_number text CHECK (org_number IS NULL OR char_length(org_number) <= 20),
  contact_name text NOT NULL CHECK (char_length(contact_name) BETWEEN 2 AND 100),
  phone text NOT NULL CHECK (char_length(phone) BETWEEN 5 AND 30),
  email text NOT NULL CHECK (char_length(email) BETWEEN 5 AND 255),
  seats integer NOT NULL CHECK (seats BETWEEN 1 AND 500),
  message text CHECK (message IS NULL OR char_length(message) <= 1000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.company_applications TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.company_applications TO authenticated;
GRANT ALL ON public.company_applications TO service_role;
ALTER TABLE public.company_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can apply" ON public.company_applications FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending');
CREATE POLICY "admin read" ON public.company_applications FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin update" ON public.company_applications FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete" ON public.company_applications FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  admin_email text NOT NULL,
  seats integer NOT NULL DEFAULT 5 CHECK (seats BETWEEN 1 AND 500),
  plan text NOT NULL DEFAULT 'beta',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.company_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, email)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.company_members TO authenticated;
GRANT ALL ON public.companies, public.company_members TO service_role;

CREATE OR REPLACE FUNCTION public.is_company_admin(_company uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.companies WHERE id = _company AND lower(admin_email) = public.my_email())
$$;
CREATE OR REPLACE FUNCTION public.is_company_member(_company uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.company_members WHERE company_id = _company AND lower(email) = public.my_email())
$$;

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company read" ON public.companies FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_company_admin(id) OR public.is_company_member(id));
CREATE POLICY "platform admin insert" ON public.companies FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "platform admin update" ON public.companies FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "platform admin delete" ON public.companies FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "member read" ON public.company_members FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_company_admin(company_id) OR lower(email) = public.my_email());
CREATE POLICY "company admin add" ON public.company_members FOR INSERT TO authenticated
  WITH CHECK ((public.has_role(auth.uid(), 'admin') OR public.is_company_admin(company_id)) AND email = lower(trim(email)) AND char_length(email) BETWEEN 5 AND 255);
CREATE POLICY "company admin remove" ON public.company_members FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_company_admin(company_id));

CREATE OR REPLACE FUNCTION public.enforce_company_seats()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT count(*) FROM public.company_members WHERE company_id = NEW.company_id) >= (SELECT seats FROM public.companies WHERE id = NEW.company_id) THEN
    RAISE EXCEPTION 'Alla licenser är använda';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER company_seats BEFORE INSERT ON public.company_members FOR EACH ROW EXECUTE FUNCTION public.enforce_company_seats();