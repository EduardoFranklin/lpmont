
-- Replace the simple stale leads function with a full lifecycle orchestrator
CREATE OR REPLACE FUNCTION public.auto_move_stale_leads()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- 1) Leads with "abandonou_checkout" tag → temperature = quente
  UPDATE public.leads l
  SET temperature = 'quente', updated_at = now()
  WHERE l.status NOT IN ('convertido', 'perdido')
    AND l.temperature IS DISTINCT FROM 'quente'
    AND EXISTS (
      SELECT 1 FROM public.lead_tags lt
      WHERE lt.lead_id = l.id AND lt.tag = 'abandonou_checkout'
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.lead_tags lt
      WHERE lt.lead_id = l.id AND lt.tag IN ('pagou', 'comprador')
    );

  -- 2) Leads with "visitou_site" tag (but no checkout/purchase) → temperature = morno
  UPDATE public.leads l
  SET temperature = 'morno', updated_at = now()
  WHERE l.status NOT IN ('convertido', 'perdido')
    AND l.temperature IS DISTINCT FROM 'morno'
    AND l.temperature IS DISTINCT FROM 'quente'
    AND EXISTS (
      SELECT 1 FROM public.lead_tags lt
      WHERE lt.lead_id = l.id AND lt.tag = 'visitou_site'
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.lead_tags lt
      WHERE lt.lead_id = l.id AND lt.tag IN ('pagou', 'comprador', 'abandonou_checkout')
    );

  -- 3) Leads older than 7 days without purchase tag → temperature = frio
  UPDATE public.leads l
  SET temperature = 'frio', updated_at = now()
  WHERE l.status NOT IN ('convertido', 'perdido')
    AND l.temperature IS DISTINCT FROM 'frio'
    AND l.updated_at < now() - interval '7 days'
    AND NOT EXISTS (
      SELECT 1 FROM public.lead_tags lt
      WHERE lt.lead_id = l.id AND lt.tag IN ('pagou', 'comprador')
    );

  -- 4) Leads older than 15 days without purchase → status = perdido
  UPDATE public.leads l
  SET status = 'perdido', temperature = 'frio', updated_at = now()
  WHERE l.status NOT IN ('convertido', 'perdido')
    AND l.created_at < now() - interval '15 days'
    AND NOT EXISTS (
      SELECT 1 FROM public.lead_tags lt
      WHERE lt.lead_id = l.id AND lt.tag IN ('pagou', 'comprador')
    );
END;
$function$;
