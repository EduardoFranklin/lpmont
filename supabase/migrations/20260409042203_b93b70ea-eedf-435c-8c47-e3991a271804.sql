
-- Consultants table
CREATE TABLE public.schedule_consultants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  email text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  slot_duration_min integer NOT NULL DEFAULT 15,
  buffer_min integer NOT NULL DEFAULT 5,
  advance_hours integer NOT NULL DEFAULT 2,
  max_days_ahead integer NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(email)
);

ALTER TABLE public.schedule_consultants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read consultants" ON public.schedule_consultants FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated can manage consultants" ON public.schedule_consultants FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Availability slots per consultant per weekday
CREATE TABLE public.schedule_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id uuid NOT NULL REFERENCES public.schedule_consultants(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.schedule_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read availability" ON public.schedule_availability FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated can manage availability" ON public.schedule_availability FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Global blocked periods
CREATE TABLE public.schedule_blocked_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  reason text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.schedule_blocked_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read blocked periods" ON public.schedule_blocked_periods FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated can manage blocked periods" ON public.schedule_blocked_periods FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed initial consultant
INSERT INTO public.schedule_consultants (name, email) VALUES ('contato', 'contato@metodomont.com.br');

-- Update triggers
CREATE TRIGGER update_schedule_consultants_updated_at
  BEFORE UPDATE ON public.schedule_consultants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
