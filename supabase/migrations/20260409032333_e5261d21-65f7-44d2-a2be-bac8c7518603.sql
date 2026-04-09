
CREATE TABLE public.team_automation_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_status TEXT NOT NULL,
  step_order INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL DEFAULT '',
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  delay_minutes INTEGER NOT NULL DEFAULT 0,
  delay_description TEXT NOT NULL DEFAULT 'Imediato',
  subject TEXT,
  body TEXT NOT NULL DEFAULT '',
  recipient_phones JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.team_automation_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can manage team sequences"
ON public.team_automation_sequences
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
