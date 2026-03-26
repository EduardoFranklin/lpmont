
-- Create leads status enum
CREATE TYPE public.lead_status AS ENUM ('novo', 'agendado', 'compareceu', 'nao_compareceu', 'convertido', 'perdido');

-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  treatment TEXT NOT NULL DEFAULT 'Dr.',
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  uf TEXT NOT NULL,
  city TEXT NOT NULL,
  career TEXT NOT NULL,
  scheduled_day TEXT,
  scheduled_time TEXT,
  status lead_status NOT NULL DEFAULT 'novo',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policy: only authenticated users can read leads
CREATE POLICY "Authenticated users can view leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (true);

-- Create policy: anyone can insert leads (from the public form)
CREATE POLICY "Anyone can insert leads"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create policy: only authenticated users can update leads
CREATE POLICY "Authenticated users can update leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (true);

-- Create policy: only authenticated users can delete leads
CREATE POLICY "Authenticated users can delete leads"
  ON public.leads FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_leads_status ON public.leads (status);
CREATE INDEX idx_leads_created_at ON public.leads (created_at DESC);
CREATE INDEX idx_leads_email ON public.leads (email);
