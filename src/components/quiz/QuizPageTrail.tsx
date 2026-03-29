import { Lock } from "lucide-react";
import { parseJSON } from "@/hooks/useSiteContent";
import type { AllContent } from "@/lib/siteContentDefaults";

interface Props {
  content: AllContent;
  ctaUrl: string;
}

const phases = [
  { key: "Base", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { key: "Ascensão", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  { key: "Altitude", color: "bg-primary/10 text-primary border-primary/20" },
  { key: "Crista", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  { key: "Cume", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
];

interface Camp {
  num: string;
  title: string;
  desc?: string;
  altitude?: string;
  phase?: string;
  img?: string;
}

const QuizPageTrail = ({ content, ctaUrl }: Props) => {
  const camps = parseJSON<Camp[]>(content.modules?.camps ?? "[]", []);

  // Group camps by phase
  const grouped: Record<string, Camp[]> = {};
  camps.forEach((c) => {
    const phase = c.phase || "Base";
    if (!grouped[phase]) grouped[phase] = [];
    grouped[phase].push(c);
  });

  return (
    <>
      {/* Separator */}
      <div className="max-w-[860px] mx-auto px-5 sm:px-10 pt-12 relative z-[1]">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-foreground/8 to-transparent" />
          <div className="flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-muted-foreground bg-card border border-border rounded-full px-4 py-1.5 whitespace-nowrap">
            <Lock className="w-3.5 h-3.5" />
            O método completo começa aqui embaixo
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-foreground/8 to-transparent" />
        </div>
      </div>

      {/* Trail */}
      <section className="max-w-[860px] mx-auto px-5 sm:px-10 py-12 relative z-[1]">
        <div className="text-center mb-11">
          <div className="inline-flex items-center gap-2.5 text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-primary mb-4">
            <span className="block w-7 h-px bg-primary/40" />
            Acesso completo
            <span className="block w-7 h-px bg-primary/40" />
          </div>
          <h2 className="font-['Bebas_Neue',sans-serif] text-[clamp(2.2rem,5vw,3.6rem)] leading-none tracking-wide mb-3">
            O que você ainda não viu.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed font-light">
            13 acampamentos, 5 Hands-On com casos reais e bônus exclusivos.
          </p>
        </div>

        {phases.map(({ key, color }) => {
          const phaseCamps = grouped[key];
          if (!phaseCamps?.length) return null;
          return (
            <div key={key} className="mb-2.5">
              <div className="flex items-center gap-2.5 mb-2 px-1">
                <span className={`text-[0.6rem] font-extrabold tracking-[0.16em] uppercase px-2 py-0.5 rounded border ${color}`}>
                  {key}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
              {phaseCamps.map((camp) => {
                const campImgMap: Record<string, string> = {
                  "01": "/images/thumbs/freepik_1-thumb.webp",
                  "02": "/images/thumbs/freepik_2-thumb.webp",
                  "03": "/images/thumbs/freepik_3-thumb.webp",
                  "04": "/images/thumbs/freepik_4-thumb.webp",
                  "05": "/images/thumbs/freepik_5-thumb.webp",
                  "06": "/images/thumbs/freepik_6-thumb.webp",
                  "07": "/images/thumbs/freepik_7-thumb.webp",
                  "08": "/images/thumbs/freepik_8-thumb.webp",
                  "09": "/images/thumbs/freepik_9-thumb.webp",
                  "10": "/images/thumbs/freepik_10-thumb.webp",
                  "11": "/images/thumbs/freepik_11-thumb.webp",
                  "12": "/images/thumbs/freepik_11-thumb.webp",
                  "13": "/images/thumbs/freepik_12-thumb.webp",
                };
                const imgSrc = campImgMap[camp.number] || "/images/thumbs/freepik_1-thumb.webp";
                return (
                  <div
                    key={camp.number}
                    className="flex items-center border border-border bg-card rounded-xl overflow-hidden mb-1 hover:border-foreground/12 transition-colors"
                  >
                    <div className="w-[72px] h-[52px] flex-shrink-0 relative overflow-hidden border-r border-border">
                      <img
                        src={imgSrc}
                        alt={camp.title}
                        className="w-full h-full object-cover brightness-[0.35] saturate-[0.3]"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="w-3.5 h-3.5 text-foreground/30" />
                      </div>
                    </div>
                    {camp.altitude && (
                      <div className="hidden sm:flex w-[68px] flex-shrink-0 items-center justify-center text-[0.62rem] font-semibold text-muted-foreground border-r border-border">
                        {camp.altitude}
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-center px-5 py-3.5 gap-0.5">
                      <div className="text-sm font-medium text-foreground/60">{camp.title}</div>
                      {camp.teaser && (
                        <div className="text-[0.74rem] text-muted-foreground font-light leading-snug">
                          {camp.teaser}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* CTA */}
        <div className="mt-8 bg-gradient-to-br from-primary/8 to-primary/4 border border-primary/20 rounded-2xl p-8 flex items-center justify-between gap-6 flex-wrap">
          <div>
            <h3 className="font-['Bebas_Neue',sans-serif] text-2xl tracking-wide mb-1">
              Acesso completo ao método
            </h3>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              Cada semana sem o método é uma restauração entregue abaixo do que você poderia entregar.
            </p>
          </div>
          <a href={ctaUrl} className="btn-summit text-sm flex-shrink-0 whitespace-nowrap">
            Quero Acesso Completo →
          </a>
        </div>
      </section>
    </>
  );
};

export default QuizPageTrail;
