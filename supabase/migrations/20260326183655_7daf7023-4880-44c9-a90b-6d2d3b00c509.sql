
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings"
  ON public.site_settings FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage site settings"
  ON public.site_settings FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

INSERT INTO public.site_settings (key, value) VALUES
  ('meta_pixel', ''),
  ('google_tag', ''),
  ('google_analytics', ''),
  ('tiktok_pixel', ''),
  ('custom_head', ''),
  ('custom_body', '');
