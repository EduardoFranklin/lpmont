
-- Add wa_sem_resposta_count to leads for anti-ban tracking
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS wa_sem_resposta_count integer DEFAULT 0;

-- Add last_wa_sent_at to prevent < 60s between messages to same lead
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_wa_sent_at timestamptz;

-- Add daily_wa_count and daily_wa_date for rate limiting
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS daily_wa_count integer DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS daily_wa_date date;
