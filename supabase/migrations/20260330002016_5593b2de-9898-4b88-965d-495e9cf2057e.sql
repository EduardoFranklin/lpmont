
-- Add unique constraint for upsert on lead_tags (lead_id + tag)
ALTER TABLE public.lead_tags ADD CONSTRAINT lead_tags_lead_id_tag_unique UNIQUE (lead_id, tag);
