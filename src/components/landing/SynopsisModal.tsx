import { useRef, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { moduleSynopsis } from "./moduleSynopsis";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SynopsisModalProps {
  moduleNum: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SynopsisModal = ({ moduleNum, open, onOpenChange }: SynopsisModalProps) => {
  if (!moduleNum) return null;
  const data = moduleSynopsis[moduleNum];
  if (!data) return null;

  const coverSrc = `/images/capa${moduleNum}.webp`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 border-foreground/[0.06] bg-background/95 backdrop-blur-xl overflow-hidden rounded-2xl max-h-[90vh] [&>button]:z-30 [&>button]:bg-background/60 [&>button]:backdrop-blur-sm [&>button]:rounded-full [&>button]:w-8 [&>button]:h-8 [&>button]:border [&>button]:border-foreground/10 [&>button]:opacity-100 [&>button]:hover:opacity-100 [&>button]:right-3 [&>button]:top-3 [&>button]:flex [&>button]:items-center [&>button]:justify-center">
        <DialogTitle className="sr-only">{data.title}</DialogTitle>

        <SynopsisContent data={data} coverSrc={coverSrc} moduleNum={moduleNum} />
      </DialogContent>
    </Dialog>
  );
};

function SynopsisContent({ data, coverSrc, moduleNum }: { data: { title: string; tagline: string; content: string[] }; coverSrc: string; moduleNum: number }) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setScrollTop(scrollRef.current.scrollTop);
    }
  }, []);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="overflow-y-auto max-h-[90vh]"
    >
      {/* Cinematic header with cover image + parallax */}
      <div className="relative h-56 sm:h-72 overflow-hidden flex-shrink-0">
        <div
          className="absolute inset-0 will-change-transform"
          style={{ transform: `translateY(${scrollTop * 0.4}px) scale(1.15)` }}
        >
          <img
            src={coverSrc}
            alt={data.title}
            className="w-full h-full object-cover object-center"
            decoding="async"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />

        {/* Module number badge */}
        <div className="absolute top-4 left-4 altitude-marker !w-10 !h-10">
          <span className="text-[13px] font-bold">{String(moduleNum).padStart(2, "0")}</span>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
          <p className="text-[11px] tracking-[0.2em] uppercase font-medium text-primary/70 mb-1">
            Sinopse — Acampamento {String(moduleNum).padStart(2, "0")}
          </p>
          <h3 className="text-xl sm:text-2xl font-medium text-foreground/95 leading-tight">
            {data.title}
          </h3>
          <p className="text-[13px] text-foreground/40 mt-1 italic">
            {data.tagline}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-4">
        {data.content.map((paragraph, i) => (
          <p
            key={i}
            className="text-foreground/40 text-[14px] leading-[1.8] whitespace-pre-line"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}

export default SynopsisModal;
