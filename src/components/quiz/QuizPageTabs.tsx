import { useState } from "react";
import { Play, Lock, Clock, Eye, CheckSquare, ArrowRight, BookOpen, Brain } from "lucide-react";
import type { QuizPageData } from "@/pages/QuizPage";
import VideoEmbed from "@/components/video/VideoEmbed";

interface Props {
  page: QuizPageData;
  unlocked: boolean;
  onOpenVideo: () => void;
  onOpenQuiz: () => void;
  onUnlock: () => void;
}

const QuizPageTabs = ({ page, unlocked, onOpenVideo, onOpenQuiz, onUnlock }: Props) => {
  const pageType = (page as any).page_type || "video_quiz";
  const hasVideo = pageType !== "quiz_only";
  const hasQuiz = pageType !== "video_only";
  const videoFirst = (page as any).video_first ?? true;
  const [activeTab, setActiveTab] = useState(videoFirst ? (hasVideo ? 1 : 2) : (hasQuiz ? 2 : 1));

  return (
    <div className="max-w-[860px] mx-auto px-0 sm:px-10 z-[1] relative">
      {/* Tab Bar - only show if both types */}
      {hasVideo && hasQuiz && (() => {
        const videoTab = (
          <button
            key="video"
            onClick={() => setActiveTab(1)}
            className={`flex-1 flex flex-col items-center gap-1 px-4 py-3 rounded-t-xl border border-b-0 transition-all text-sm font-medium ${
              activeTab === 1
                ? "bg-primary/10 text-foreground border-primary/30 z-[2] relative"
                : "bg-foreground/[0.02] text-muted-foreground border-border hover:bg-foreground/[0.04]"
            }`}
          >
            <span className="text-[0.58rem] font-bold tracking-[0.12em] uppercase px-1.5 py-0.5 rounded bg-primary/12 text-primary border border-primary/20">
              Vídeo
            </span>
            Aula 01
          </button>
        );
        const quizTab = (
          <button
            key="quiz"
            onClick={() => setActiveTab(2)}
            className={`flex-1 flex flex-col items-center gap-1 px-4 py-3 rounded-t-xl border border-b-0 transition-all text-sm font-medium ${
              activeTab === 2
                ? "bg-primary/10 text-foreground border-primary/30 z-[2] relative"
                : "bg-foreground/[0.02] text-muted-foreground border-border hover:bg-foreground/[0.04]"
            }`}
          >
            <span className="text-[0.58rem] font-bold tracking-[0.12em] uppercase px-1.5 py-0.5 rounded bg-primary/12 text-primary border border-primary/20">
              Quiz
            </span>
            Checkpoint
          </button>
        );
        return (
          <div className="flex gap-2">
            {videoFirst ? [videoTab, quizTab] : [quizTab, videoTab]}
          </div>
        );
      })()}

      {/* Panel 1: Lesson */}
      {hasVideo && activeTab === 1 && (
        <div className={`bg-card border border-border/60 overflow-hidden ${hasVideo && hasQuiz ? "rounded-b-2xl rounded-tr-xl" : "rounded-2xl"}`}>
          {/* Video - locked overlay */}
          {(page as any).video_locked && !unlocked ? (
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-foreground/5">
                {page.lesson_thumbnail ? (
                  <img src={page.lesson_thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                ) : null}
                <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
                <div className="relative z-10 flex flex-col items-center gap-3 text-center px-6">
                  <Lock className="w-8 h-8 text-primary/60" />
                  <p className="text-sm font-medium text-foreground/70">Conteúdo bloqueado</p>
                  <button
                    onClick={onUnlock}
                    className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                  >
                    Desbloquear agora <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              {page.lesson_video_url ? (
                <VideoEmbed value={page.lesson_video_url} title={page.lesson_title} className="absolute inset-0 w-full h-full" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/5 text-muted-foreground text-sm">
                  Vídeo não configurado
                </div>
              )}
            </div>
          )}

          {/* Info */}
          <div className="p-6 sm:p-7">
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="text-[0.63rem] font-bold tracking-[0.12em] uppercase px-2 py-0.5 rounded border border-primary/30 bg-primary/7 text-primary">
                Vídeo
              </span>
              <span className={`ml-auto text-[0.63rem] font-semibold tracking-[0.1em] uppercase px-2.5 py-0.5 rounded-full ${
                (page as any).video_locked && !unlocked ? "bg-muted text-muted-foreground" : "bg-green-500/12 text-green-400"
              }`}>
                {(page as any).video_locked && !unlocked ? "Bloqueado" : "Disponível"}
              </span>
            </div>
            <h2 className="text-xl font-semibold leading-tight mb-2.5">{page.lesson_title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-light mb-4">{page.lesson_desc}</p>
          </div>
        </div>
      )}

      {/* Panel 2: Quiz */}
      {hasQuiz && activeTab === 2 && (
        <div className={`bg-card border border-border/60 overflow-hidden ${hasVideo && hasQuiz ? "rounded-b-2xl rounded-tl-xl" : "rounded-2xl"}`}>
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
