
CREATE TABLE public.sale_notification_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  phone text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sale_notification_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage sale notification contacts"
  ON public.sale_notification_contacts FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
