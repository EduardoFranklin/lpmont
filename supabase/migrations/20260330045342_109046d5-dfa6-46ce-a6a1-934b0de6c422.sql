-- Remove duplicate leads keeping the most recent one per email
DELETE FROM public.leads a
USING public.leads b
WHERE a.email = b.email
  AND a.created_at < b.created_at;

-- Now add unique constraint
ALTER TABLE public.leads ADD CONSTRAINT leads_email_unique UNIQUE (email);