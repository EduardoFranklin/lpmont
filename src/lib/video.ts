const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&amp;/gi, "&")
    .replace(/&#38;|&#x26;/gi, "&")
    .trim();

export const extractVideoSrc = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) return "";

  const iframeSrcMatch = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeSrcMatch?.[1]) {
    return decodeHtmlEntities(iframeSrcMatch[1]);
  }

  const directUrlMatch = trimmed.match(/https?:\/\/[^\s"'<>]+/i);
  if (directUrlMatch?.[0]) {
    return decodeHtmlEntities(directUrlMatch[0]);
  }

  const textOnly = trimmed.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const fallbackUrlMatch = textOnly.match(/https?:\/\/[^\s"'<>]+/i);

  return fallbackUrlMatch?.[0] ? decodeHtmlEntities(fallbackUrlMatch[0]) : decodeHtmlEntities(textOnly);
};

export const getEmbedVideoSrc = (value: string) => {
  const src = extractVideoSrc(value);

  if (!src) return "";

  if (src.includes("youtube.com/watch")) {
    return src.replace("watch?v=", "embed/") + (src.includes("?") ? "&" : "?") + "autoplay=1";
  }

  if (src.includes("youtu.be/")) {
    const [, videoId = ""] = src.split("youtu.be/");
    const [cleanVideoId] = videoId.split("?");
    return `https://www.youtube.com/embed/${cleanVideoId}?autoplay=1`;
  }

  // PandaVideo: ensure autoplay is present if not already set
  if ((src.includes("pandavideo.com") || src.includes("player-vz-")) && !src.includes("autoplay=")) {
    const separator = src.includes("?") ? "&" : "?";
    return src + separator + "autoplay=1";
  }

  return src;
};

export const isPandaVideo = (value: string) => {
  const src = extractVideoSrc(value);
  return src.includes("pandavideo.com") || src.includes("player-vz-");
};

export const getPandaVideoId = (value: string) => {
  const src = extractVideoSrc(value);
  const queryMatch = src.match(/[?&]v=([a-f0-9-]+)/i);

  if (queryMatch?.[1]) return queryMatch[1];

  const pathMatch = src.match(/\/embed\/(?:\?v=)?([a-f0-9-]+)/i);
  return pathMatch?.[1] ?? null;
};