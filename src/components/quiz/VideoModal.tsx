import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { QuizPageData } from "@/pages/QuizPage";

interface Props {
  open: boolean;
  onClose: () => void;
  page: QuizPageData;
}

const VideoModal = ({ open, onClose, page }: Props) => {
  if (!open) return null;

  // Support Panda Video embed URLs
  const isPanda = page.lesson_video_url.includes("pandavideo.com");
  const embedUrl = isPanda
    ? page.lesson_video_url + (page.lesson_video_url.includes("?") ? "&" : "?") + "playOpensFullscreenNative=true"
    : page.lesson_video_url.includes("youtube.com/watch")
    ? page.lesson_video_url.replace("watch?v=", "embed/") + "?autoplay=1"
    : page.lesson_video_url.includes("youtu.be/")
    ? `https://www.youtube.com/embed/${page.lesson_video_url.split("youtu.be/")[1]}?autoplay=1`
    : page.lesson_video_url;

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-5 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border/60 rounded-2xl w-full max-w-[680px] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-[34px] h-[34px] rounded-full bg-foreground/7 flex items-center justify-center text-foreground hover:bg-foreground/14 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="relative pb-[56.25%] bg-black">
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full border-0"
            allowFullScreen
            allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture"
          />
        </div>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-1.5">{page.lesson_title}</h3>
          <p className="text-sm text-muted-foreground font-light leading-relaxed">{page.lesson_desc}</p>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
