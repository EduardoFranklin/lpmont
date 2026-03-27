import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import defaults, { type SectionContent, type AllContent } from "@/lib/siteContentDefaults";

let cachedContent: AllContent | null = null;
let fetchPromise: Promise<AllContent> | null = null;

async function fetchAllContent(): Promise<AllContent> {
  const { data } = await supabase
    .from("site_content")
    .select("section, content_key, content_value");

  // Start with defaults
  const merged: AllContent = JSON.parse(JSON.stringify(defaults));

  if (data && data.length > 0) {
    for (const row of data) {
      if (!merged[row.section]) merged[row.section] = {};
      merged[row.section][row.content_key] = row.content_value;
    }
  }

  cachedContent = merged;
  return merged;
}

export function useSiteContent(): { content: AllContent; loading: boolean } {
  const [content, setContent] = useState<AllContent>(cachedContent ?? defaults);
  const [loading, setLoading] = useState(!cachedContent);

  useEffect(() => {
    if (cachedContent) {
      setContent(cachedContent);
      setLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = fetchAllContent();
    }

    fetchPromise.then((c) => {
      setContent(c);
      setLoading(false);
    });
  }, []);

  return { content, loading };
}

// Helper to get a section's content with type safety
export function useSection(section: string): SectionContent {
  const { content } = useSiteContent();
  return content[section] ?? defaults[section] ?? {};
}

// Helper to parse JSON fields safely
export function parseJSON<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// Invalidate cache (call after saving in dashboard)
export function invalidateSiteContentCache() {
  cachedContent = null;
  fetchPromise = null;
}
