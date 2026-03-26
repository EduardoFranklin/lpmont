
CREATE TABLE public.reminder_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  timing_value integer NOT NULL DEFAULT 1,
  timing_unit text NOT NULL CHECK (timing_unit IN ('horas', 'dias')) DEFAULT 'dias',
  subject text,
  body text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reminder_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage reminder templates"
  ON public.reminder_templates FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE TRIGGER update_reminder_templates_updated_at
  BEFORE UPDATE ON public.reminder_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
