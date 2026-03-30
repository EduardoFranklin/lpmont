import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { QuizPageData } from "@/pages/QuizPage";
import VideoEmbed from "@/components/video/VideoEmbed";

interface Props {
  open: boolean;
  onClose: () => void;
  page: QuizPageData;
}

const VideoModal = ({ open, onClose, page }: Props) => {
  if (!open) return null;

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
          <VideoEmbed value={page.lesson_video_url} title={page.lesson_title} className="absolute inset-0 w-full h-full border-0" />
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
