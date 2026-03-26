import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches site_settings from the database and injects
 * the tracking scripts into the <head> and <body>.
 * Runs once on mount for public pages.
 */
const useTrackingScripts = () => {
  useEffect(() => {
    let cancelled = false;

    const inject = async () => {
      const { data } = await supabase.from("site_settings").select("key, value");
      if (cancelled || !data) return;

      const settings: Record<string, string> = {};
      (data as any[]).forEach((row: any) => {
        if (row.value) settings[row.key] = row.value;
      });

      // Head scripts
      const headScripts = [
        settings.meta_pixel,
        settings.google_tag,
        settings.google_analytics,
        settings.tiktok_pixel,
        settings.custom_head,
      ]
        .filter(Boolean)
        .join("\n");

      if (headScripts) {
        const container = document.createElement("div");
        container.id = "lovable-tracking-head";
        container.innerHTML = headScripts;
        // Move child nodes into head
        while (container.firstChild) {
          document.head.appendChild(container.firstChild);
        }
      }

      // Body scripts
      const bodyScripts = settings.custom_body;
      if (bodyScripts) {
        const container = document.createElement("div");
        container.id = "lovable-tracking-body";
        container.innerHTML = bodyScripts;
        while (container.firstChild) {
          document.body.appendChild(container.firstChild);
        }
      }
    };

    inject();

    return () => {
      cancelled = true;
      // Clean up injected elements
      document.querySelectorAll("#lovable-tracking-head, #lovable-tracking-body").forEach((el) => el.remove());
    };
  }, []);
};

export default useTrackingScripts;
