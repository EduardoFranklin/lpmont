import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SCRIPT_KEYS = ["meta_pixel", "google_tag", "google_analytics", "tiktok_pixel", "custom_head", "custom_body"];

/**
 * Fetches script settings from site_settings and injects them into the DOM.
 * Properly creates <script> elements so they execute (innerHTML doesn't run scripts).
 */
const useTrackingScripts = () => {
  const { data: scripts } = useQuery({
    queryKey: ["site-scripts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", SCRIPT_KEYS);
      if (error) throw error;
      const map: Record<string, string> = {};
      data?.forEach((r: any) => {
        if (r.value) map[r.key] = r.value;
      });
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!scripts) return;

    const injectedElements: HTMLElement[] = [];

    const injectHTML = (html: string, target: "head" | "body", idPrefix: string) => {
      if (!html.trim()) return;

      // Remove any previous injections with same prefix
      document.querySelectorAll(`[data-injected-group="${idPrefix}"]`).forEach((el) => el.remove());

      // Parse the HTML
      const temp = document.createElement("div");
      temp.innerHTML = html;

      const parent = target === "head" ? document.head : document.body;

      // Process each child node — recreate <script> elements so they execute
      Array.from(temp.childNodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) return;

        let el: HTMLElement;

        if (node.nodeName === "SCRIPT") {
          const origScript = node as HTMLScriptElement;
          const newScript = document.createElement("script");
          Array.from(origScript.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });
          if (origScript.textContent) {
            newScript.textContent = origScript.textContent;
          }
          el = newScript;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          el = node.cloneNode(true) as HTMLElement;
        } else {
          return;
        }

        el.setAttribute("data-injected-group", idPrefix);
        parent.appendChild(el);
        injectedElements.push(el);
      });
    };

    // Head scripts
    injectHTML(scripts.meta_pixel || "", "head", "injected-meta-pixel");
    injectHTML(scripts.google_tag || "", "head", "injected-google-tag");
    injectHTML(scripts.google_analytics || "", "head", "injected-google-analytics");
    injectHTML(scripts.tiktok_pixel || "", "head", "injected-tiktok-pixel");
    injectHTML(scripts.custom_head || "", "head", "injected-custom-head");

    // Body scripts
    injectHTML(scripts.custom_body || "", "body", "injected-custom-body");

    return () => {
      injectedElements.forEach((el) => el.remove());
    };
  }, [scripts]);
};

export default useTrackingScripts;
