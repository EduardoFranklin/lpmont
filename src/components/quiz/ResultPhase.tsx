import { useState, useEffect, useCallback } from "react";
import { ArrowRight, Clock, Flame, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import type { QuizPageData } from "@/pages/QuizPage";

interface Props {
  finalScore: number;
  rawScore: number;
  travaTrigger: boolean;
  nivel: string;
  titulo: string;
  diagnostico: string;
  cor: string;
  emoji: string;
  firstName: string;
  page: QuizPageData;
  onClose: () => void;
  onShowCoupon: () => void;
  onReset: () => void;
}

const ResultPhase = ({
  finalScore, rawScore, travaTrigger, nivel, titulo, diagnostico,
  cor, emoji, firstName, page, onClose, onShowCoupon, onReset,
}: Props) => {
  const totalSeconds = (page.coupon_timer_minutes || 10) * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(page.coupon_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [page.coupon_code]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const pct = (secondsLeft / totalSeconds) * 100;
  const urgent = pct < 30;

  return (
    <div>
      {/* Score reveal */}
      <div className="p-8 text-center bg-gradient-to-b from-primary/8 to-transparent border-b border-border relative overflow-hidden">
        {/* Background glow */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="w-[300px] h-[300px] rounded-full blur-[100px] opacity-20" style={{ background: cor }} />
        </motion.div>

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          className="relative z-10"
        >
          <div className="text-[0.72rem] font-bold tracking-[0.12em] uppercase mb-3" style={{ color: cor }}>
            {emoji} {nivel}
          </div>
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: "spring", bounce: 0.5 }}
            className="font-['Bebas_Neue',sans-serif] text-8xl leading-none tracking-wide mb-1"
            style={{ color: cor }}
          >
            {finalScore}<span className="text-3xl ml-1 opacity-70">pts</span>
          </motion.div>
        </motion.div>

        {travaTrigger && rawScore > 70 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-[0.72rem] text-red-400/80 bg-red-500/7 border border-red-500/20 rounded-lg px-3 py-1.5 inline-block mt-2 mb-2 relative z-10"
          >
            ⚠️ Trava clínica aplicada — pontuação limitada a 70
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-[0.95rem] font-semibold mt-2 relative z-10"
        >
          {titulo}
        </motion.div>
      </div>

      {/* Diagnostic with Breno avatar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="px-7 py-5 border-b border-border"
      >
        <div className="flex items-center gap-3 text-[0.68rem] font-bold tracking-[0.1em] uppercase text-muted-foreground mb-3.5">
          <div className="w-[36px] h-[36px] rounded-full overflow-hidden border-2 border-primary/30 flex-shrink-0">
            <img src="/images/avatar-breno.webp" alt="Dr. Breno" className="w-full h-full object-cover" />
          </div>
          Seu diagnóstico, {firstName}
        </div>
        <blockquote className="text-[0.86rem] text-foreground/65 leading-relaxed italic font-light">
          {diagnostico}
        </blockquote>
        {page.result_closing_text && (
          <div
            className="mt-4 p-3.5 bg-foreground/[0.03] border-l-[3px] border-primary rounded-r-lg text-[0.83rem] text-muted-foreground leading-relaxed italic"
            dangerouslySetInnerHTML={{ __html: page.result_closing_text }}
          />
        )}
      </motion.div>

      {/* Coupon with countdown */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="px-7 py-6 flex flex-col items-center text-center gap-4"
      >
        {/* Coupon card */}
        <div className="w-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/25 rounded-2xl p-5 relative overflow-hidden">
          {/* Subtle shimmer */}
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
            className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-primary/10 to-transparent skew-x-12 pointer-events-none"
          />

          <div className="flex items-center justify-center gap-2 mb-3">
            <Flame className={`w-4 h-4 ${urgent ? "text-red-400 animate-pulse" : "text-primary"}`} />
            <span className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-primary">
              Oferta exclusiva do diagnóstico
            </span>
            <Flame className={`w-4 h-4 ${urgent ? "text-red-400 animate-pulse" : "text-primary"}`} />
          </div>

          <div className="flex items-center justify-center gap-3 mb-3">
            <button
              onClick={handleCopy}
              className="group relative flex items-center gap-2 font-['Bebas_Neue',sans-serif] text-3xl tracking-wider text-primary border-2 border-dashed border-primary/40 rounded-lg px-4 py-1 hover:border-primary/60 hover:bg-primary/5 transition-all cursor-pointer"
            >
              {page.coupon_code}
              <span className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-primary" />}
              </span>
              {copied && (
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[0.6rem] text-green-400 font-sans font-medium whitespace-nowrap"
                >
                  Copiado!
                </motion.span>
              )}
            </button>
            <span className="text-lg font-bold text-foreground">
              {page.coupon_discount} OFF
            </span>
          </div>

          {/* Countdown timer bar */}
          <div className="mt-3">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <Clock className={`w-3.5 h-3.5 ${urgent ? "text-red-400" : "text-muted-foreground"}`} />
              <span className={`text-[0.72rem] font-semibold tracking-wide ${urgent ? "text-red-400" : "text-muted-foreground"}`}>
                Expira em{" "}
                <span className={`font-mono font-bold ${urgent ? "text-red-400" : "text-foreground"}`}>
                  {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                </span>
              </span>
            </div>
            <div className="h-[5px] bg-foreground/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full transition-colors duration-500 ${
                  urgent
                    ? "bg-gradient-to-r from-red-500 to-red-400"
                    : "bg-gradient-to-r from-primary to-primary/70"
                }`}
                initial={{ width: "100%" }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </div>
            {urgent && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-[0.65rem] text-red-400/80 mt-1.5 font-medium"
              >
                ⚠️ Últimos minutos — cupom prestes a expirar
              </motion.p>
            )}
          </div>
        </div>

        <a
          href={page.cta_url}
          onClick={() => { onClose(); setTimeout(onShowCoupon, 300); }}
          className="w-full bg-primary text-primary-foreground py-4 rounded-xl text-sm font-bold tracking-wide uppercase flex items-center justify-center gap-2 shadow-[0_4px_20px_hsl(var(--brand-gold)/0.35)] hover:shadow-[0_6px_28px_hsl(var(--brand-gold)/0.5)] hover:scale-[1.02] transition-all"
        >
          Garantir acesso com {page.coupon_discount} off <ArrowRight className="w-3.5 h-3.5" />
        </a>

        <a
          href="/#falar-equipe"
          onClick={onClose}
          className="text-[0.78rem] text-muted-foreground hover:text-foreground/60 transition-colors font-medium flex items-center justify-center gap-1.5"
        >
          Falar com a Equipe <ArrowRight className="w-3 h-3" />
        </a>
      </motion.div>
    </div>
  );
};

export default ResultPhase;
