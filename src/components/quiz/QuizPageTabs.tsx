import { useState } from "react";
import { Play, Lock, Clock, Eye, CheckSquare, ArrowRight } from "lucide-react";
import type { QuizPageData } from "@/pages/QuizPage";

interface Props {
  page: QuizPageData;
  unlocked: boolean;
  onOpenVideo: () => void;
  onOpenQuiz: () => void;
  onUnlock: () => void;
}

const QuizPageTabs = ({ page, unlocked, onOpenVideo, onOpenQuiz, onUnlock }: Props) => {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <div className="max-w-[860px] mx-auto px-5 sm:px-10 z-[1] relative">
      {/* Tab Bar */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab(1)}
          className={`flex-1 flex flex-col items-center gap-1 px-4 py-3 rounded-t-xl border border-b-0 transition-all text-sm font-medium ${
            activeTab === 1
              ? "bg-card text-foreground border-border/60 z-[2] relative"
              : "bg-foreground/[0.02] text-muted-foreground border-border hover:bg-foreground/[0.04]"
          }`}
        >
          <span className="text-[0.58rem] font-bold tracking-[0.12em] uppercase px-1.5 py-0.5 rounded bg-primary/12 text-primary border border-primary/20">
            {page.lesson_tag}
          </span>
          {page.lesson_number} — {page.lesson_title.split(" ").slice(0, 2).join(" ")}
        </button>
        <button
          onClick={() => setActiveTab(2)}
          className={`flex-1 flex flex-col items-center gap-1 px-4 py-3 rounded-t-xl border border-b-0 transition-all text-sm font-medium ${
            activeTab === 2
              ? "bg-card text-foreground border-border/60 z-[2] relative"
              : "bg-foreground/[0.02] text-muted-foreground border-border hover:bg-foreground/[0.04]"
          }`}
        >
          <span className="text-[0.58rem] font-bold tracking-[0.12em] uppercase px-1.5 py-0.5 rounded bg-blue-500/12 text-blue-400 border border-blue-500/20">
            {page.quiz_tag}
          </span>
          Checkpoint
        </button>
      </div>

      {/* Panel 1: Lesson */}
      {activeTab === 1 && (
        <div className="bg-card border border-border/60 rounded-b-2xl rounded-tr-xl overflow-hidden">
          {/* Thumbnail */}
          <div
            className="relative w-full aspect-[16/7] bg-black overflow-hidden cursor-pointer group"
            onClick={unlocked ? onOpenVideo : onUnlock}
          >
            {page.lesson_thumbnail ? (
              <img
                src={page.lesson_thumbnail}
                alt=""
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
                  !unlocked ? "blur-sm brightness-[0.3] saturate-[0.4]" : ""
                }`}
              />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}

            {!unlocked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-black/55 backdrop-blur-sm hover:bg-black/35 transition-colors">
                <div className="w-14 h-14 rounded-full border border-foreground/15 bg-foreground/5 flex items-center justify-center hover:border-primary/55 hover:bg-primary/10 transition-colors">
                  <Lock className="w-5 h-5 text-foreground/40" />
                </div>
                <span className="text-[0.63rem] font-semibold tracking-[0.14em] uppercase text-foreground/35">
                  Bloqueado
                </span>
              </div>
            )}

            {unlocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-[68px] h-[68px] rounded-full bg-primary/95 flex items-center justify-center shadow-[0_6px_32px_rgba(232,160,32,0.5)] group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 text-primary-foreground fill-current" />
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6 sm:p-7">
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="text-[0.63rem] font-bold tracking-[0.12em] uppercase px-2 py-0.5 rounded border border-primary/30 bg-primary/7 text-primary">
                Vídeo
              </span>
              <span className={`ml-auto text-[0.63rem] font-semibold tracking-[0.1em] uppercase px-2.5 py-0.5 rounded-full ${
                unlocked
                  ? "bg-green-500/12 text-green-400"
                  : "bg-foreground/5 text-muted-foreground"
              }`}>
                {unlocked ? "Disponível" : "Bloqueado"}
              </span>
            </div>
            <h2 className="text-xl font-semibold leading-tight mb-2.5">{page.lesson_title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-light mb-4">{page.lesson_desc}</p>
            <div className="flex items-center gap-4 pt-4 border-t border-border">
              <span className="flex items-center gap-1.5 text-[0.73rem] text-muted-foreground">
                <Eye className="w-3.5 h-3.5" /> {page.lesson_phase}
              </span>
              <button
                onClick={unlocked ? onOpenVideo : onUnlock}
                className={`ml-auto flex items-center gap-1.5 text-[0.72rem] font-semibold tracking-wide uppercase px-3.5 py-1.5 rounded-lg border transition-all ${
                  unlocked
                    ? "text-primary bg-primary/8 border-primary/20 hover:bg-primary/15 hover:border-primary/40"
                    : "text-muted-foreground bg-foreground/[0.03] border-border"
                }`}
              >
                {unlocked ? (
                  <>Assistir <ArrowRight className="w-3 h-3" /></>
                ) : (
                  <><Lock className="w-3 h-3" /> Desbloquear</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel 2: Quiz */}
      {activeTab === 2 && (
        <div className="bg-card border border-border/60 rounded-b-2xl rounded-tl-xl overflow-hidden">
          <div className="relative p-8 sm:p-10 bg-gradient-to-br from-blue-500/5 to-transparent flex items-center gap-7 flex-wrap min-h-[260px]">
            <div className="text-6xl flex-shrink-0">{page.quiz_icon}</div>
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-[0.63rem] font-bold tracking-[0.12em] uppercase px-2 py-0.5 rounded border border-blue-500/30 bg-blue-500/7 text-blue-400">
                  {page.quiz_tag}
                </span>
                <span className="font-['Bebas_Neue',sans-serif] text-base text-muted-foreground tracking-wide">
                  {page.quiz_number}
                </span>
                <span className="text-[0.63rem] font-semibold tracking-[0.1em] uppercase px-2.5 py-0.5 rounded-full bg-green-500/12 text-green-400">
                  Disponível
                </span>
              </div>
              <h2 className="text-xl font-semibold leading-tight mb-1.5">{page.quiz_title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-light mb-4">{page.quiz_desc}</p>
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <span className="flex items-center gap-1.5 text-[0.73rem] text-muted-foreground">
                  <CheckSquare className="w-3.5 h-3.5" /> {page.quiz_question_count} questões
                </span>
                <span className="flex items-center gap-1.5 text-[0.73rem] text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" /> {page.quiz_duration}
                </span>
                <button
                  onClick={onOpenQuiz}
                  className="ml-auto flex items-center gap-1.5 text-[0.72rem] font-semibold tracking-wide uppercase px-3.5 py-1.5 rounded-lg border text-blue-400 bg-blue-500/8 border-blue-500/20 hover:bg-blue-500/15 hover:border-blue-500/40 transition-all"
                >
                  Iniciar quiz <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="p-5 border border-t-0 border-border bg-card rounded-b-2xl -mt-px">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[0.72rem] text-muted-foreground font-medium tracking-wide uppercase">
            Conteúdos gratuitos
          </span>
          <strong className="text-sm text-primary">
            {unlocked ? "1" : "0"} / 1 concluído
          </strong>
        </div>
        <div className="h-1 bg-foreground/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary rounded-full transition-all duration-[1.4s] shadow-[0_0_12px_hsl(var(--brand-gold)/0.5)]"
            style={{ width: unlocked ? "100%" : "0%" }}
          />
        </div>
      </div>
    </div>
  );
};

export default QuizPageTabs;
