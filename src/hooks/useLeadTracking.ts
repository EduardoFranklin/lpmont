import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tracks lead events by calling the track-lead-event edge function.
 * Identifies lead by email stored in localStorage from form submissions.
 */
export function useLeadTracking(event: "site_visit" | "checkout_started") {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;

    const email = localStorage.getItem("lead_email");
    const phone = localStorage.getItem("lead_phone");
    if (!email) return;

    sent.current = true;

    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    fetch(`https://${projectId}.supabase.co/functions/v1/track-lead-event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ email, phone, event }),
    }).catch(() => {
      // Silent fail — tracking should never break UX
    });
  }, [event]);
}
