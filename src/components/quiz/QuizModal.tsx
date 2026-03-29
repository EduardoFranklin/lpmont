import { useState, useEffect, useRef } from "react";
import { X, Info, ArrowRight } from "lucide-react";
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
    }
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open, leadStep, qi]);

  if (!open) return null;

  const totalSteps = 3 + questions.length;

  const confirmLead = () => {
    const vals = [leadName, leadPhone, leadEmail];
    if (!vals[leadStep]?.trim()) {
      if (inputRef.current) inputRef.current.style.borderColor = "rgba(255,100,100,0.5)";
      return;
    }
    if (leadStep === 2) {
      // Save lead
      try {
        supabase.from("leads").insert({
          name: leadName.trim(),
          email: leadEmail.trim(),
          phone: leadPhone.trim(),
          treatment: "Dr.",
          uf: "N/A",
          city: "N/A",
          career: "N/A",
          notes: `Quiz: ${page.slug}`,
        });
      } catch {}
      setPhase("quiz");
      return;
    }
    setLeadStep((s) => s + 1);
  };

  const confirmAnswer = () => {
    if (selected === null) return;
    const q = questions[qi];
    const pts = q.options[selected]?.points ?? 0;
    const isIdeal = pts === q.weight;
    if (q.is_critical && !isIdeal) setTravaTrigger(true);
    setScores((s) => [...s, pts]);
    setConfirmed(true);

    setTimeout(() => {
      if (qi >= questions.length - 1) {
        setPhase("result");
      } else {
        setQi((i) => i + 1);
        setSelected(null);
        setConfirmed(false);
      }
    }, 2000);
  };

  const rawScore = scores.reduce((a, b) => a + b, 0);
  const finalScore = travaTrigger ? Math.min(rawScore, 70) : rawScore;

  const progress =
    phase === "lead"
      ? ((leadStep / totalSteps) * 100).toFixed(0)
      : phase === "quiz"
      ? (((3 + qi) / totalSteps) * 100).toFixed(0)
      : "100";

  // Determine result level
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

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/92 backdrop-blur-sm flex items-center justify-center p-5 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border/60 rounded-2xl w-full max-w-[620px] overflow-hidden relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-[34px] h-[34px] rounded-full bg-foreground/7 flex items-center justify-center text-foreground hover:bg-foreground/14 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with progress */}
        <div className="px-7 pt-5 pb-3.5 bg-gradient-to-br from-blue-500/6 to-transparent border-b border-border">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-[0.68rem] font-bold tracking-[0.1em] uppercase text-muted-foreground">
              {phase === "lead" ? `Passo ${leadStep + 1} de 3` : phase === "quiz" ? questions[qi]?.label : "Resultado"}
            </span>
            {phase === "quiz" && questions[qi] && (
              <span className="text-[0.68rem] font-bold tracking-widest uppercase text-primary bg-primary/10 border border-primary/25 px-2 py-0.5 rounded-full">
                +{questions[qi].weight} pts
              </span>
            )}
          </div>
          <div className="h-[3px] bg-foreground/7 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Lead capture */}
        {phase === "lead" && (
          <div>
            <div className="px-7 py-6">
              <div className="text-4xl mb-3.5">{["👋", "📱", "📧"][leadStep]}</div>
              <div
                className="text-[0.97rem] font-medium leading-relaxed mb-4"
                dangerouslySetInnerHTML={{
                  __html:
                    leadStep === 0
                      ? page.lead_step1_text || `Você acabou de ver uma reconstrução. Agora vamos testar seu raciocínio clínico. Primeiro: <strong>qual é o seu nome?</strong>`
                      : leadStep === 1
                      ? (page.lead_step2_text || `Prazer, <strong>${firstName}</strong>! <strong>Qual é o seu WhatsApp?</strong>`).replace("{{nome}}", firstName)
                      : (page.lead_step3_text || `Perfeito, <strong>${firstName}</strong>. <strong>Qual é o seu melhor e-mail?</strong>`).replace("{{nome}}", firstName),
                }}
              />
              <input
                ref={inputRef}
                type={leadStep === 2 ? "email" : leadStep === 1 ? "tel" : "text"}
                value={[leadName, leadPhone, leadEmail][leadStep]}
                onChange={(e) => {
                  [setLeadName, setLeadPhone, setLeadEmail][leadStep](e.target.value);
                  if (inputRef.current) inputRef.current.style.borderColor = "";
                }}
                onKeyDown={(e) => e.key === "Enter" && confirmLead()}
                placeholder={["Dr. João Silva...", "(98) 99999-9999", "joao@clinica.com.br"][leadStep]}
                className="w-full bg-foreground/5 border-[1.5px] border-foreground/12 rounded-xl px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:bg-primary/[0.04] transition-colors"
              />
            </div>
            <div className="flex items-center justify-between px-7 py-4 border-t border-border">
              <span className="text-[0.72rem] text-muted-foreground">Suas respostas ficam seguras</span>
              <button
                onClick={confirmLead}
                className="bg-blue-500 text-white px-5 py-2.5 rounded-xl text-[0.78rem] font-semibold tracking-wide uppercase hover:bg-blue-400 transition-colors"
              >
                {leadStep === 2 ? "Iniciar diagnóstico →" : "Continuar →"}
              </button>
            </div>
          </div>
        )}

        {/* Quiz questions */}
        {phase === "quiz" && questions[qi] && (
          <div>
            <div className="px-7 py-5">
              <div className="text-[0.7rem] font-bold text-muted-foreground tracking-widest uppercase mb-2.5">
                Questão {qi + 1} <span className="text-foreground/20">de {questions.length}</span>
              </div>
              {questions[qi].is_critical && (
                <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-bold tracking-[0.1em] uppercase text-red-400 bg-red-500/8 border border-red-500/25 rounded px-2 py-0.5 mb-2.5">
                  ⚠️ Trava clínica
                </span>
              )}
              <div className="text-[0.97rem] font-medium leading-relaxed mb-4">{questions[qi].question}</div>
              <div className="flex flex-col gap-2">
                {questions[qi].options.map((opt, i) => {
                  const letters = ["A", "B", "C", "D", "E"];
                  let cls = "border-border bg-foreground/[0.03] text-muted-foreground hover:border-blue-500/30 hover:text-foreground hover:bg-blue-500/5";
                  if (confirmed) {
                    if (opt.points === questions[qi].weight) cls = "border-green-500/50 bg-green-500/10 text-green-400";
                    else if (i === selected && opt.points === 0) cls = "border-red-500/40 bg-red-500/7 text-red-400/85";
                    else if (i === selected) cls = "border-primary/40 bg-primary/7 text-primary";
                  } else if (i === selected) {
                    cls = "border-blue-500/50 bg-blue-500/10 text-foreground";
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => !confirmed && setSelected(i)}
                      disabled={confirmed}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-[0.83rem] transition-all text-left ${cls}`}
                    >
                      <span className="w-[22px] h-[22px] rounded-md bg-foreground/6 flex items-center justify-center text-[0.67rem] font-bold text-muted-foreground flex-shrink-0">
                        {letters[i]}
                      </span>
                      <span className="flex-1">{opt.text}</span>
                      {confirmed && (
                        <span className={`text-[0.7rem] font-bold flex-shrink-0 ${opt.points === questions[qi].weight ? "text-green-400" : opt.points > 0 ? "text-primary" : "text-red-400/60"}`}>
                          {opt.points > 0 ? `+${opt.points}` : "0"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {confirmed && questions[qi].explanation && (
                <div className="mt-3 p-3 bg-blue-500/7 border border-blue-500/20 rounded-lg flex items-start gap-2 text-[0.78rem] text-muted-foreground leading-relaxed font-light">
                  <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                  {questions[qi].explanation}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between px-7 py-4 border-t border-border">
              <span className="text-[0.72rem] text-muted-foreground uppercase tracking-widest">
                {qi + 1} / {questions.length}
              </span>
              <button
                onClick={confirmAnswer}
                disabled={selected === null || confirmed}
                className="bg-blue-500 text-white px-5 py-2.5 rounded-xl text-[0.78rem] font-semibold tracking-wide uppercase disabled:opacity-35 disabled:cursor-not-allowed hover:bg-blue-400 transition-colors"
              >
                {qi === questions.length - 1 ? "Ver diagnóstico →" : "Próxima →"}
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {phase === "result" && (
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
        )}
      </div>
    </div>
  );
};

export default QuizModal;
