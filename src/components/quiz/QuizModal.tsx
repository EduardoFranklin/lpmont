import { useState, useEffect, useRef, useCallback } from "react";
import { X, Info, ArrowRight, Lock, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { QuizPageData, QuizQuestion } from "@/pages/QuizPage";
import ResultPhase from "./ResultPhase";

interface Props {
  open: boolean;
  onClose: () => void;
  page: QuizPageData;
  questions: QuizQuestion[];
  onShowCoupon: () => void;
}

type Phase = "lead" | "quiz" | "result";

// Brazilian phone mask
const maskPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};


const QuizModal = ({ open, onClose, page, questions, onShowCoupon }: Props) => {
  const [phase, setPhase] = useState<Phase>("lead");
  const [leadStep, setLeadStep] = useState(0);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [travaTrigger, setTravaTrigger] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPhase("lead");
      setLeadStep(0);
      setLeadName("");
      setLeadPhone("");
      setLeadEmail("");
      setQi(0);
      setSelected(null);
      setConfirmed(false);
      setScores([]);
      setTravaTrigger(false);
      setLeadId(null);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open, leadStep, qi]);

  const totalSteps = 3 + questions.length;

  const confirmLead = useCallback(async () => {
    const vals = [leadName, leadPhone, leadEmail];
    if (!vals[leadStep]?.trim()) {
      if (inputRef.current) inputRef.current.style.borderColor = "hsl(var(--destructive))";
      return;
    }
    if (leadStep === 2) {
      try {
        const email = leadEmail.trim().toLowerCase();
        const phone = leadPhone.trim();
        // Upsert lead by email — avoid duplicates
        const { data: upsertData, error } = await supabase.from("leads").upsert({
          name: leadName.trim(),
          email,
          phone,
          treatment: "Dr.",
          uf: "N/A",
          city: "N/A",
          career: "N/A",
          notes: `Quiz: ${page.slug}`,
          quiz_slug: page.slug,
          quiz_started_at: new Date().toISOString(),
          funnel_origin: "quiz",
          status: "novo",
          temperature: "morno",
        } as any, { onConflict: "email", ignoreDuplicates: false }).select("id");

        if (error) {
          console.error("Quiz lead upsert error:", error.message);
        }

        if (upsertData && upsertData[0]?.id) {
          const leadId = upsertData[0].id;
          setLeadId(leadId);
          await supabase.from("lead_tags").upsert(
            { lead_id: leadId, tag: "quiz", source: "quiz" } as any,
            { onConflict: "lead_id,tag" }
          );
          // Trigger F2 automation for new quiz lead
          supabase.functions.invoke("enqueue-automation", {
            body: { lead_id: leadId, funnel: "F2", event: "quiz_lead_capturado" },
          }).catch((err) => console.error("Enqueue automation error:", err));
        }
        localStorage.setItem("lead_email", email);
        localStorage.setItem("lead_phone", phone);
      } catch (err) {
        console.error("Quiz lead save failed:", err);
      }
      setPhase("quiz");
      return;
    }
    setLeadStep((s) => s + 1);
  }, [leadStep, leadName, leadPhone, leadEmail, page.slug]);

  // Helper: check if option is the correct one
  const isCorrectOption = useCallback((q: QuizQuestion, optIndex: number) => {
    const opt = q.options[optIndex];
    if (opt?.correct !== undefined) return opt.correct === true;
    return opt?.points === q.weight;
  }, []);

  const confirmAnswer = useCallback(() => {
    if (selected === null) return;
    const q = questions[qi];
    const pts = q.options[selected]?.points ?? 0;
    const isIdeal = isCorrectOption(q, selected);
    if (q.is_critical && !isIdeal) setTravaTrigger(true);
    setScores((s) => [...s, pts]);
    setConfirmed(true);

    setTimeout(async () => {
      if (qi >= questions.length - 1) {
        setPhase("result");
        // Save quiz score to the lead
        const allScores = [...scores, pts];
        const rawTotal = allScores.reduce((a, b) => a + b, 0);
        const finalTotal = (travaTrigger || (q.is_critical && !isIdeal)) ? Math.min(rawTotal, 70) : rawTotal;
        // Determine diagnostic level code for automation matching
        let diagCode = "C"; // low
        if (finalTotal >= page.result_high_min) diagCode = "A";
        else if (finalTotal >= page.result_mid_min) diagCode = "B";

        if (leadId) {
          try {
            // Update lead with quiz results
            await supabase.from("leads")
              .update({
                quiz_score: finalTotal,
                quiz_slug: page.slug,
                quiz_concluido: true,
                quiz_diagnostico: diagCode,
              } as any)
              .eq("id", leadId);

            // Add quiz_concluido tag
            await supabase.from("lead_tags").upsert(
              { lead_id: leadId, tag: "quiz_concluido", source: "quiz" } as any,
              { onConflict: "lead_id,tag" }
            );
            // Trigger automation for quiz completion
            supabase.functions.invoke("enqueue-automation", {
              body: { lead_id: leadId, funnel: "F2", event: "quiz_concluido" },
            });
          } catch {}
        }
      } else {
        setQi((i) => i + 1);
        setSelected(null);
        setConfirmed(false);
      }
    }, 2200);
  }, [selected, qi, questions]);

  if (!open) return null;

  const rawScore = scores.reduce((a, b) => a + b, 0);
  const finalScore = travaTrigger ? Math.min(rawScore, 70) : rawScore;

  const progress =
    phase === "lead"
      ? ((leadStep / totalSteps) * 100)
      : phase === "quiz"
      ? (((3 + qi) / totalSteps) * 100)
      : 100;

  let nivel = page.result_low_level;
  let titulo = page.result_low_title;
  let diagnostico = page.result_low_diagnostic;
  let emoji = "🟥";
  let cor = "rgba(255,100,100,0.85)";

  if (finalScore >= page.result_high_min) {
    nivel = page.result_high_level;
    titulo = page.result_high_title;
    diagnostico = page.result_high_diagnostic;
    emoji = "🟩";
    cor = "#b0e89a";
  } else if (finalScore >= page.result_mid_min) {
    nivel = page.result_mid_level;
    titulo = page.result_mid_title;
    diagnostico = page.result_mid_diagnostic;
    emoji = "🟨";
    cor = "hsl(var(--brand-gold))";
  }

  const firstName = leadName.split(" ")[0];
  const currentImage = phase === "quiz" && questions[qi] ? (questions[qi] as any).image_url : undefined;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-background flex flex-col"
    >
      {/* Top bar */}
      <div className="flex-shrink-0 relative z-10">
        <div className="flex items-center justify-between px-5 sm:px-8 h-14 sm:h-16 border-b border-border/40">
          <div className="flex items-center gap-3">
            <img src="/images/logo-metodo-mont.svg" alt="Mont'" className="h-5 opacity-50" />
            <span className="text-[0.65rem] font-bold tracking-[0.12em] uppercase text-muted-foreground hidden sm:block">
              {phase === "lead" ? "Identificação" : phase === "quiz" ? "Diagnóstico Clínico" : "Resultado"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {phase === "quiz" && questions[qi] && (
              <span className="text-[0.65rem] font-bold tracking-widest uppercase text-primary bg-primary/10 border border-primary/25 px-2.5 py-1 rounded-full">
                +{questions[qi].weight} pts
              </span>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/50 hover:bg-foreground/10 hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-[3px] bg-foreground/5">
          <motion.div
            className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-r-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full h-full flex flex-col">
          <AnimatePresence mode="wait">
            {/* ==================== LEAD CAPTURE ==================== */}
            {phase === "lead" && (
              <motion.div
                key={`lead-${leadStep}`}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col justify-center px-6 sm:px-12 py-10"
              >
                <div className="text-5xl sm:text-6xl mb-6">{["👋", "📱", "📧"][leadStep]}</div>
                <div className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-primary/60 mb-3">
                  Passo {leadStep + 1} de 3
                </div>
                <div
                  className="text-xl sm:text-2xl font-semibold leading-snug mb-6 text-foreground"
                  dangerouslySetInnerHTML={{
                    __html:
                      leadStep === 0
                        ? page.lead_step1_text || `Vamos testar seu raciocínio clínico.<br/><strong>Qual é o seu nome?</strong>`
                        : leadStep === 1
                        ? (page.lead_step2_text || `Prazer, <strong>${firstName}</strong>!<br/><strong>Qual é o seu WhatsApp?</strong>`).replace("{{nome}}", firstName)
                        : (page.lead_step3_text || `Perfeito, <strong>${firstName}</strong>.<br/><strong>Qual é o seu melhor e-mail?</strong>`).replace("{{nome}}", firstName),
                  }}
                />
                <input
                  ref={inputRef}
                  type={leadStep === 2 ? "email" : leadStep === 1 ? "tel" : "text"}
                  inputMode={leadStep === 1 ? "tel" : leadStep === 2 ? "email" : "text"}
                  value={[leadName, leadPhone, leadEmail][leadStep]}
                  onChange={(e) => {
                    if (leadStep === 1) {
                      setLeadPhone(maskPhone(e.target.value));
                    } else {
                      [setLeadName, setLeadPhone, setLeadEmail][leadStep](e.target.value);
                    }
                    if (inputRef.current) inputRef.current.style.borderColor = "";
                  }}
                  onKeyDown={(e) => e.key === "Enter" && confirmLead()}
                  placeholder={["Dr. João Silva...", "(98) 99999-9999", "joao@clinica.com.br"][leadStep]}
                  className="w-full bg-foreground/[0.03] border-2 border-foreground/10 rounded-2xl px-5 py-4 text-lg text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-primary/[0.03] transition-all"
                />
                <div className="mt-8 flex items-center gap-4">
                  <button
                    onClick={confirmLead}
                    className="btn-summit py-3.5 px-8 text-sm flex items-center gap-2"
                  >
                    {leadStep === 2 ? "Iniciar diagnóstico" : "Continuar"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <span className="text-[0.7rem] text-muted-foreground/50 flex items-center gap-1.5">
                    <Lock className="w-3 h-3" /> Dados seguros
                  </span>
                </div>
              </motion.div>
            )}

            {/* ==================== QUIZ QUESTIONS ==================== */}
            {phase === "quiz" && questions[qi] && (
              <motion.div
                key={`q-${qi}`}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col px-6 sm:px-12 py-6 sm:py-10"
              >
                {/* Question header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[0.68rem] font-bold text-muted-foreground tracking-widest uppercase">
                    Questão {qi + 1} <span className="text-foreground/20">de {questions.length}</span>
                  </span>
                  {questions[qi].is_critical && (
                    <span className="inline-flex items-center gap-1 text-[0.6rem] font-bold tracking-[0.1em] uppercase text-red-400 bg-red-500/8 border border-red-500/25 rounded-full px-2 py-0.5">
                      ⚠️ Trava
                    </span>
                  )}
                </div>

                {/* Clinical image */}
                {currentImage && (
                  <div className="rounded-2xl overflow-hidden mb-5 border border-border/40">
                    <img
                      src={currentImage}
                      alt="Caso clínico"
                      className="w-full h-40 sm:h-52 object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Question text */}
                <h2 className="text-base sm:text-lg font-semibold leading-relaxed mb-5 text-foreground">
                  {questions[qi].question}
                </h2>

                {/* Options */}
                <div className="flex flex-col gap-2.5 flex-1">
                  {questions[qi].options.map((opt, i) => {
                    const letters = ["A", "B", "C", "D", "E"];
                    let borderCls = "border-border/60 hover:border-primary/30";
                    let bgCls = "bg-foreground/[0.02] hover:bg-primary/[0.04]";
                    let textCls = "text-foreground/70 hover:text-foreground";

                    if (confirmed) {
                      const isCorrect = isCorrectOption(questions[qi], i);
                      if (isCorrect) {
                        borderCls = "border-green-500/50";
                        bgCls = "bg-green-500/8";
                        textCls = "text-green-400";
                      } else if (i === selected && opt.points === 0) {
                        borderCls = "border-red-500/40";
                        bgCls = "bg-red-500/5";
                        textCls = "text-red-400/85";
                      } else if (i === selected) {
                        borderCls = "border-primary/40";
                        bgCls = "bg-primary/5";
                        textCls = "text-primary";
                      } else {
                        textCls = "text-foreground/30";
                      }
                    } else if (i === selected) {
                      borderCls = "border-primary/50 ring-1 ring-primary/20";
                      bgCls = "bg-primary/[0.06]";
                      textCls = "text-foreground";
                    }

                    return (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        onClick={() => !confirmed && setSelected(i)}
                        disabled={confirmed}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-[1.5px] text-[0.85rem] transition-all text-left ${borderCls} ${bgCls} ${textCls}`}
                      >
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[0.7rem] font-bold flex-shrink-0 transition-colors ${
                          i === selected && !confirmed
                            ? "bg-primary/15 text-primary border border-primary/30"
                            : confirmed && isCorrectOption(questions[qi], i)
                            ? "bg-green-500/15 text-green-400 border border-green-500/30"
                            : "bg-foreground/5 text-muted-foreground border border-transparent"
                        }`}>
                          {letters[i]}
                        </span>
                        <span className="flex-1">{opt.text}</span>
                        {confirmed && (
                          <span className={`text-[0.72rem] font-bold flex-shrink-0 ${
                            isCorrectOption(questions[qi], i) ? "text-green-400" : opt.points > 0 ? "text-primary" : "text-red-400/50"
                          }`}>
                            {opt.points > 0 ? `+${opt.points}` : "0"}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Explanation */}
                <AnimatePresence>
                  {confirmed && questions[qi].explanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 bg-primary/[0.04] border border-primary/15 rounded-xl flex items-start gap-2.5 text-[0.8rem] text-muted-foreground leading-relaxed font-light"
                    >
                      <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{questions[qi].explanation}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ==================== RESULT ==================== */}
            {phase === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex-1 overflow-y-auto"
              >
                <ResultPhase
                  finalScore={finalScore}
                  rawScore={rawScore}
                  travaTrigger={travaTrigger}
                  nivel={nivel}
                  titulo={titulo}
                  diagnostico={diagnostico}
                  cor={cor}
                  emoji={emoji}
                  firstName={firstName}
                  page={page}
                  onClose={onClose}
                  onShowCoupon={onShowCoupon}
                  onReset={() => { setPhase("lead"); setLeadStep(0); setQi(0); setSelected(null); setConfirmed(false); setScores([]); setTravaTrigger(false); }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom bar for quiz phase */}
      {phase === "quiz" && (
        <div className="flex-shrink-0 border-t border-border/40 px-6 sm:px-12 py-4 flex items-center justify-between bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-[0.7rem] text-muted-foreground font-medium">
              {qi + 1}/{questions.length}
            </span>
            <div className="w-20 h-1.5 bg-foreground/5 rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-primary/60 rounded-full transition-all duration-300"
                style={{ width: `${((qi + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
          <button
            onClick={confirmAnswer}
            disabled={selected === null || confirmed}
            className="btn-summit py-3 px-6 text-sm flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {qi === questions.length - 1 ? "Ver diagnóstico" : "Confirmar"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default QuizModal;
