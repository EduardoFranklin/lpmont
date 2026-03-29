
-- 1. Add missing columns to leads table for full automation support
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS funnel_origin TEXT DEFAULT 'F2',
  ADD COLUMN IF NOT EXISTS quiz_diagnostico TEXT,
  ADD COLUMN IF NOT EXISTS quiz_concluido BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS quiz_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reuniao_data_hora_iso TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reuniao_data_extenso TEXT,
  ADD COLUMN IF NOT EXISTS reuniao_hora_extenso TEXT,
  ADD COLUMN IF NOT EXISTS reuniao_link_google_meet TEXT,
  ADD COLUMN IF NOT EXISTS reuniao_link_google_calendar TEXT,
  ADD COLUMN IF NOT EXISTS reuniao_consultor TEXT,
  ADD COLUMN IF NOT EXISTS reuniao_status TEXT DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS reuniao_notas TEXT,
  ADD COLUMN IF NOT EXISTS hotmart_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS hotmart_status TEXT,
  ADD COLUMN IF NOT EXISTS hotmart_offer_code TEXT,
  ADD COLUMN IF NOT EXISTS data_compra TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS valor_pago NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS forma_pagamento TEXT,
  ADD COLUMN IF NOT EXISTS cupom_usado_compra TEXT,
  ADD COLUMN IF NOT EXISTS link_onboarding TEXT;

-- 2. Automation sequences table (all funnel steps pre-configured)
CREATE TABLE IF NOT EXISTS public.automation_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel TEXT NOT NULL,
  step_order INTEGER NOT NULL DEFAULT 0,
  step_key TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email')),
  delay_minutes INTEGER NOT NULL DEFAULT 0,
  delay_description TEXT NOT NULL DEFAULT 'Imediato',
  subject TEXT,
  body TEXT NOT NULL DEFAULT '',
  conditions JSONB DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(funnel, step_key, channel)
);

ALTER TABLE public.automation_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sequences" ON public.automation_sequences
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated can manage sequences" ON public.automation_sequences
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Message queue table
CREATE TABLE IF NOT EXISTS public.message_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  sequence_id UUID REFERENCES public.automation_sequences(id) ON DELETE SET NULL,
  funnel TEXT NOT NULL,
  step_key TEXT NOT NULL,
  channel TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL DEFAULT '',
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.message_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can manage queue" ON public.message_queue
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_message_queue_pending ON public.message_queue (scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_message_queue_lead ON public.message_queue (lead_id);

-- 4. Message history table
CREATE TABLE IF NOT EXISTS public.message_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  funnel TEXT,
  step_key TEXT,
  channel TEXT NOT NULL,
  subject TEXT,
  body_preview TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  external_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.message_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view history" ON public.message_history
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anon can insert history" ON public.message_history
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX idx_message_history_lead ON public.message_history (lead_id);

-- 5. Trigger for updated_at on automation_sequences
CREATE TRIGGER set_updated_at_automation_sequences
  BEFORE UPDATE ON public.automation_sequences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Enable realtime for queue monitoring
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_queue;
