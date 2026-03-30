import { useEffect, useMemo, useRef } from "react";
import { getEmbedVideoSrc, getPandaVideoId, isPandaVideo } from "@/lib/video";

declare global {
  interface Window {
    PandaPlayer?: new (
      playerId: string,
      options: {
        onReady?: () => void;
      }
    ) => {
      loadWindowScreen?: (options: { panda_id_player: string }) => void;
    };
    pandascripttag?: Array<() => void>;
  }
}

interface VideoEmbedProps {
  value: string;
  title: string;
  className?: string;
  allow?: string;
  iframeId?: string;
}

const DEFAULT_ALLOW = "accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture";
const PANDA_SCRIPT_SRC = "https://player.pandavideo.com.br/api.v2.js";

const VideoEmbed = ({ value, title, className, allow = DEFAULT_ALLOW, iframeId }: VideoEmbedProps) => {
  const initializedRef = useRef(false);
  const embedUrl = useMemo(() => getEmbedVideoSrc(value), [value]);
  const pandaVideoId = useMemo(() => getPandaVideoId(value), [value]);
  const panda = useMemo(() => isPandaVideo(value) && !!pandaVideoId, [pandaVideoId, value]);
  const playerId = iframeId ?? (pandaVideoId ? `panda-${pandaVideoId}` : undefined);

  useEffect(() => {
    initializedRef.current = false;
  }, [playerId, embedUrl]);

  useEffect(() => {
    if (!panda || !playerId || !embedUrl || initializedRef.current) return;

    const initializePlayer = () => {
      if (!window.PandaPlayer || initializedRef.current) return;

      initializedRef.current = true;

      const player = new window.PandaPlayer(playerId, {
        onReady() {
          player.loadWindowScreen?.({ panda_id_player: playerId });
        },
      });
    };

    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${PANDA_SCRIPT_SRC}"]`);

    if (window.PandaPlayer) {
      initializePlayer();
      return;
    }

    window.pandascripttag = window.pandascripttag || [];
    window.pandascripttag.push(initializePlayer);

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = PANDA_SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
  }, [embedUrl, panda, playerId]);

  if (!embedUrl) return null;

  return (
    <iframe
      id={playerId}
      src={embedUrl}
      title={title}
      className={className}
      style={{ border: "none" }}
      allow={allow}
      allowFullScreen
      // @ts-ignore
      fetchPriority="high"
    />
  );
};

export default VideoEmbed;