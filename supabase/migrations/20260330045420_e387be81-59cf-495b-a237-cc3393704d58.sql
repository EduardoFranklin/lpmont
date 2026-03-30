CREATE POLICY "Anon can select leads by email for quiz upsert"
ON public.leads
FOR SELECT
TO anon
USING (true);