import { useState } from "react";
import { Play, Lock, Clock, Eye, CheckSquare, ArrowRight, BookOpen, Brain } from "lucide-react";
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
            Vídeo
          </span>
          Aula 01
        </button>
        <button
          onClick={() => setActiveTab(2)}
          className={`flex-1 flex flex-col items-center gap-1 px-4 py-3 rounded-t-xl border border-b-0 transition-all text-sm font-medium ${
            activeTab === 2
              ? "bg-card text-foreground border-border/60 z-[2] relative"
              : "bg-foreground/[0.02] text-muted-foreground border-border hover:bg-foreground/[0.04]"
          }`}
        >
          <span className="text-[0.58rem] font-bold tracking-[0.12em] uppercase px-1.5 py-0.5 rounded bg-primary/12 text-primary border border-primary/20">
            Quiz
          </span>
          Checkpoint
        </button>
      </div>

      {/* Panel 1: Lesson */}
      {activeTab === 1 && (
        <div className="bg-card border border-border/60 rounded-b-2xl rounded-tr-xl overflow-hidden">
          {/* Panda Video Embed */}
          <div className="relative w-full" style={{ paddingBottom: "50%" }}>
            <iframe
              id="panda-7e77bfe0-d52a-46a0-a868-b27391b245ed"
              src="https://player-vz-8aa69477-53f.tv.pandavideo.com.br/embed/?v=7e77bfe0-d52a-46a0-a868-b27391b245ed&playOpensFullscreenNative=true"
              style={{ border: "none" }}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture"
              allowFullScreen
              fetchPriority="high"
            />
          </div>

          {/* Info */}
          <div className="p-6 sm:p-7">
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="text-[0.63rem] font-bold tracking-[0.12em] uppercase px-2 py-0.5 rounded border border-primary/30 bg-primary/7 text-primary">
                Vídeo
              </span>
              <span className="ml-auto text-[0.63rem] font-semibold tracking-[0.1em] uppercase px-2.5 py-0.5 rounded-full bg-green-500/12 text-green-400">
                Disponível
              </span>
            </div>
            <h2 className="text-xl font-semibold leading-tight mb-2.5">{page.lesson_title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-light mb-4">{page.lesson_desc}</p>
          </div>
        </div>
      )}

      {/* Panel 2: Quiz */}
      {activeTab === 2 && (
        <div className="bg-card border border-border/60 rounded-b-2xl rounded-tl-xl overflow-hidden">
          <div className="relative overflow-hidden">
            {/* Cover image */}
            <div className="relative w-full aspect-[16/7] bg-black overflow-hidden">
              <img
                src="/images/quiz/pino1.jpg"
                alt="Quiz"
                className="w-full h-full object-cover opacity-60"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
            </div>
            <div className="relative -mt-16 px-8 sm:px-10 pb-8 sm:pb-10">
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
              <div className="flex items-center gap-4 pt-4 border-t border-border mb-4">
                <span className="flex items-center gap-1.5 text-[0.73rem] text-muted-foreground">
                  <CheckSquare className="w-3.5 h-3.5" /> {page.quiz_question_count} questões
                </span>
                <span className="flex items-center gap-1.5 text-[0.73rem] text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" /> {page.quiz_duration}
                </span>
              </div>
              <button
                onClick={onOpenQuiz}
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold tracking-wide uppercase py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-[0_4px_20px_hsl(var(--brand-gold)/0.35)]"
              >
                Iniciar Quiz <ArrowRight className="w-4 h-4" />
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
