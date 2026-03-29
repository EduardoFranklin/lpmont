import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent, parseJSON } from "@/hooks/useSiteContent";
import QuizNavBar from "@/components/quiz/QuizNavBar";
import QuizPageHero from "@/components/quiz/QuizPageHero";
import QuizPageTabs from "@/components/quiz/QuizPageTabs";
import QuizPageTrail from "@/components/quiz/QuizPageTrail";
import QuizPageInstructor from "@/components/quiz/QuizPageInstructor";
import QuizPageTestimonials from "@/components/quiz/QuizPageTestimonials";
import QuizPageGuarantee from "@/components/quiz/QuizPageGuarantee";
import QuizPageBonuses from "@/components/quiz/QuizPageBonuses";
import QuizPageStickyFooter from "@/components/quiz/QuizPageStickyFooter";
import QuizModal from "@/components/quiz/QuizModal";
import VideoModal from "@/components/quiz/VideoModal";
import UnlockModal from "@/components/quiz/UnlockModal";
import CouponModal from "@/components/quiz/CouponModal";

export interface QuizPageData {
  id: string;
  slug: string;
  hero_label: string;
  hero_title: string;
  hero_message: string;
  hero_author_name: string;
  hero_author_role: string;
  lesson_tag: string;
  lesson_number: string;
  lesson_title: string;
  lesson_desc: string;
  lesson_duration: string;
  lesson_phase: string;
  lesson_video_url: string;
  lesson_thumbnail: string;
  quiz_icon: string;
  quiz_tag: string;
  quiz_number: string;
  quiz_title: string;
  quiz_desc: string;
  quiz_question_count: number;
  quiz_duration: string;
  lead_step1_text: string;
  lead_step2_text: string;
  lead_step3_text: string;
  result_high_min: number;
  result_high_level: string;
  result_high_title: string;
  result_high_diagnostic: string;
  result_mid_min: number;
  result_mid_level: string;
  result_mid_title: string;
  result_mid_diagnostic: string;
  result_low_level: string;
  result_low_title: string;
  result_low_diagnostic: string;
  result_closing_text: string;
  coupon_code: string;
  coupon_discount: string;
  coupon_timer_minutes: number;
  cta_url: string;
}

export interface QuizQuestion {
  id: string;
  sort_order: number;
  label: string;
  question: string;
  is_critical: boolean;
  weight: number;
  explanation: string;
  options: { text: string; points: number }[];
}

const QuizPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<QuizPageData | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { content } = useSiteContent();

  // Modal states
  const [showUnlock, setShowUnlock] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const [unlocked, setUnlocked] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      const { data: pageData } = await supabase
        .from("quiz_pages")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (!pageData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setPage(pageData as QuizPageData);

      const { data: qData } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_page_id", pageData.id)
        .order("sort_order", { ascending: true });

      if (qData) {
        setQuestions(
          qData.map((q: any) => ({
            ...q,
            options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
          }))
        );
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  // Parse site content for reusable sections
  const instructor = content.instructor ?? {};
  const testimonials = parseJSON<any[]>(content.testimonials?.items ?? "[]", []);
  const pricing = content.pricing ?? {};

  const handleUnlock = () => {
    setUnlocked(true);
    setShowUnlock(false);
  };

  const handleOpenVideo = useCallback(() => {
    setShowVideo(true);
  }, []);

  const handleOpenQuiz = useCallback(() => {
    setShowQuiz(true);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Página não encontrada</h1>
          <a href="/" className="text-primary hover:underline">Voltar ao início</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <QuizNavBar ctaUrl={page.cta_url} />

      <QuizPageHero page={page} />

      <QuizPageTabs
        page={page}
        unlocked={unlocked}
        onOpenVideo={handleOpenVideo}
        onOpenQuiz={handleOpenQuiz}
        onUnlock={() => setShowUnlock(true)}
      />

      <QuizPageTrail content={content} ctaUrl={page.cta_url} />

      <QuizPageBonuses />

      <QuizPageInstructor instructor={instructor} />

      <QuizPageTestimonials testimonials={testimonials} />

      <QuizPageGuarantee />

      {/* Footer */}
      <footer className="py-14 border-t border-foreground/[0.04] mt-16">
        <div className="max-w-[860px] mx-auto px-5 sm:px-10 text-center">
          <img src="/images/logo-metodo-mont.svg" alt="Método Mont'" className="h-5 opacity-25 mx-auto mb-3" loading="lazy" />
          <p className="text-foreground/15 text-xs">
            © {new Date().getFullYear()} Método Mont'. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      <QuizPageStickyFooter ctaUrl={page.cta_url} />

      {/* Modals */}
      <UnlockModal
        open={showUnlock}
        onClose={() => setShowUnlock(false)}
        onUnlock={handleUnlock}
        page={page}
      />

      <VideoModal
        open={showVideo}
        onClose={() => setShowVideo(false)}
        page={page}
      />

      <QuizModal
        open={showQuiz}
        onClose={() => setShowQuiz(false)}
        page={page}
        questions={questions}
        onShowCoupon={() => setShowCoupon(true)}
      />

      <CouponModal
        open={showCoupon}
        onClose={() => setShowCoupon(false)}
        page={page}
      />
    </div>
  );
};

export default QuizPage;
