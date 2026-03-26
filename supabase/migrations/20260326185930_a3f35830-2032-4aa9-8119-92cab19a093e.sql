
CREATE TABLE public.google_oauth_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  token_expiry timestamp with time zone NOT NULL,
  email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.google_oauth_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage their own tokens"
ON public.google_oauth_tokens
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
