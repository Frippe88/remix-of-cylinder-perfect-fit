CREATE TABLE public.company_invites (
  company_id uuid PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
  token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.company_invites TO authenticated;
GRANT ALL ON public.company_invites TO service_role;
ALTER TABLE public.company_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company admin read invite" ON public.company_invites FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_company_admin(company_id));
CREATE POLICY "company admin create invite" ON public.company_invites FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_company_admin(company_id));
CREATE POLICY "company admin reset invite" ON public.company_invites FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_company_admin(company_id))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_company_admin(company_id));

CREATE OR REPLACE FUNCTION public.enforce_company_seats()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Lock the company row so simultaneous joins via a shared link cannot exceed the seat limit.
  PERFORM 1 FROM public.companies WHERE id = NEW.company_id FOR UPDATE;
  IF (SELECT count(*) FROM public.company_members WHERE company_id = NEW.company_id) >= (SELECT seats FROM public.companies WHERE id = NEW.company_id) THEN
    RAISE EXCEPTION 'Alla licenser är använda';
  END IF;
  RETURN NEW;
END $$;