import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { moduleSynopsis } from "./moduleSynopsis";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

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
      <DialogContent className="max-w-2xl p-0 gap-0 border-foreground/[0.06] bg-background/95 backdrop-blur-xl overflow-hidden rounded-2xl max-h-[90vh]">
        <DialogTitle className="sr-only">{data.title}</DialogTitle>

        {/* Cinematic header with cover image */}
        <div className="relative h-48 sm:h-56 overflow-hidden flex-shrink-0">
          <img
            src={coverSrc}
            alt={data.title}
            className="w-full h-full object-cover"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />

          {/* Module number badge */}
          <div className="absolute top-4 left-4 altitude-marker !w-10 !h-10">
            <span className="text-[13px] font-bold">{String(moduleNum).padStart(2, "0")}</span>
          </div>

          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background/60 backdrop-blur-sm border border-foreground/10 flex items-center justify-center text-foreground/50 hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

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
        <ScrollArea className="flex-1 max-h-[50vh]">
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SynopsisModal;
