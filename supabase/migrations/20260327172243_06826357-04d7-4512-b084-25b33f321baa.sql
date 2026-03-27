
-- Add revenue column to leads
ALTER TABLE public.leads ADD COLUMN revenue numeric DEFAULT 0;

-- Create lead_tags table for tracking Hotmart events
CREATE TABLE public.lead_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  tag text NOT NULL,
  source text NOT NULL DEFAULT 'hotmart',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lead_tags ENABLE ROW LEVEL SECURITY;

-- RLS: anyone can insert (webhook is unauthenticated)
CREATE POLICY "Anyone can insert lead tags" ON public.lead_tags
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- RLS: authenticated can view
CREATE POLICY "Authenticated users can view lead tags" ON public.lead_tags
  FOR SELECT TO authenticated USING (true);

-- RLS: authenticated can delete
CREATE POLICY "Authenticated users can delete lead tags" ON public.lead_tags
  FOR DELETE TO authenticated USING (true);

-- Allow anon to update leads (for webhook to move status/revenue)
CREATE POLICY "Anon can update leads for webhook" ON public.leads
  FOR UPDATE TO anon USING (true);
