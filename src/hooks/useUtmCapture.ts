import { useEffect } from "react";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
const STORAGE_KEY = "lovable_utm";

export type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>;

/**
 * Captures UTM params from the URL on first visit and persists them
 * in sessionStorage so they survive navigation to /agendar.
 */
const useUtmCapture = (): UtmParams => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utms: UtmParams = {};
    let hasAny = false;
    for (const key of UTM_KEYS) {
      const val = params.get(key);
      if (val) {
        utms[key] = val;
        hasAny = true;
      }
    }
    // Only overwrite if URL has UTMs (preserves earlier capture)
    if (hasAny) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utms));
    }
  }, []);

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export default useUtmCapture;
