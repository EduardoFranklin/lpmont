
-- Add temperature column to leads
CREATE TYPE public.lead_temperature AS ENUM ('frio', 'morno', 'quente');
ALTER TABLE public.leads ADD COLUMN temperature lead_temperature DEFAULT 'frio';

-- Create lead_notes table for multiple notes per lead
CREATE TABLE public.lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view lead notes"
  ON public.lead_notes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert lead notes"
  ON public.lead_notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete lead notes"
  ON public.lead_notes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create messaging_templates table
CREATE TYPE public.message_channel AS ENUM ('email', 'whatsapp');
CREATE TYPE public.funnel_trigger AS ENUM ('novo', 'agendado', 'compareceu', 'nao_compareceu', 'convertido', 'perdido');

CREATE TABLE public.messaging_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel message_channel NOT NULL,
  trigger funnel_trigger NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(channel, trigger)
);

ALTER TABLE public.messaging_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage messaging templates"
  ON public.messaging_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Add trigger for updated_at on messaging_templates
CREATE TRIGGER update_messaging_templates_updated_at
  BEFORE UPDATE ON public.messaging_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-move stale leads to perdido
CREATE OR REPLACE FUNCTION public.auto_move_stale_leads()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.leads
  SET status = 'perdido', updated_at = now()
  WHERE status NOT IN ('convertido', 'perdido')
    AND updated_at < now() - interval '7 days';
END;
$$;
