import { useState, useEffect, useRef } from "react";
import { X, ArrowRight, Copy, Check } from "lucide-react";
import type { QuizPageData } from "@/pages/QuizPage";

interface Props {
  open: boolean;
  onClose: () => void;
  page: QuizPageData;
}

const CouponModal = ({ open, onClose, page }: Props) => {
  const [timeLeft, setTimeLeft] = useState(page.coupon_timer_minutes * 60);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (open) {
      setTimeLeft(page.coupon_timer_minutes * 60);
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [open, page.coupon_timer_minutes]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(page.coupon_code);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!open) return null;

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const expired = timeLeft <= 0;

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/92 backdrop-blur-sm flex items-center justify-center p-5 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-card border border-primary/25 rounded-2xl w-full max-w-[420px] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold top bar */}
        <div className="h-[3px] bg-gradient-to-r from-primary via-primary to-primary" />

        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-[34px] h-[34px] rounded-full bg-foreground/7 flex items-center justify-center text-foreground hover:bg-foreground/14 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top */}
        <div className="p-8 pb-5 text-center bg-gradient-to-b from-primary/7 to-transparent">
          <div className="text-4xl mb-2">🔥</div>
          <div className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-primary mb-2.5">
            Oferta exclusiva para você
          </div>
          <h2 className="font-['Bebas_Neue',sans-serif] text-4xl tracking-wide leading-tight mb-2.5">
            {page.coupon_discount} de desconto<br />
            <span className="text-primary">no Método Mont'</span>
          </h2>
          <p className="text-[0.81rem] text-muted-foreground font-light leading-relaxed max-w-[300px] mx-auto">
            Garanta o acesso completo agora com condição especial — válida apenas pelos próximos
          </p>
        </div>

        {/* Timer */}
        <div className="px-8 py-5 border-y border-border bg-black/15">
          <div className="flex items-center justify-center gap-1.5">
            <div className="flex flex-col items-center gap-0.5">
              <span className="font-['Bebas_Neue',sans-serif] text-5xl text-primary tracking-wider leading-none min-w-[70px] text-center">
                {mins}
              </span>
              <span className="text-[0.58rem] font-bold tracking-[0.14em] uppercase text-muted-foreground">min</span>
            </div>
            <span className="font-['Bebas_Neue',sans-serif] text-4xl text-muted-foreground leading-none mb-3.5 animate-pulse">:</span>
            <div className="flex flex-col items-center gap-0.5">
              <span className="font-['Bebas_Neue',sans-serif] text-5xl text-primary tracking-wider leading-none min-w-[70px] text-center">
                {secs}
              </span>
              <span className="text-[0.58rem] font-bold tracking-[0.14em] uppercase text-muted-foreground">seg</span>
            </div>
          </div>
        </div>

        {!expired ? (
          <>
            {/* Code */}
            <div className="px-8 py-4">
              <div className="text-[0.66rem] font-bold tracking-[0.12em] uppercase text-muted-foreground mb-2">Seu cupom</div>
              <div className="flex items-center justify-between bg-primary/7 border-[1.5px] border-dashed border-primary/40 rounded-xl px-4 py-3 gap-3">
                <span className="font-['Bebas_Neue',sans-serif] text-2xl text-primary tracking-[0.12em]">
                  {page.coupon_code}
                </span>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 bg-primary/12 border border-primary/30 rounded-lg px-3 py-1.5 text-[0.72rem] font-semibold tracking-wide uppercase transition-all whitespace-nowrap ${
                    copied ? "text-green-400 border-green-500/40 bg-green-500/10" : "text-primary hover:bg-primary/22"
                  }`}
                >
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copiado!</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="px-8 pb-7 flex flex-col gap-2.5">
              <a
                href={page.cta_url}
                onClick={onClose}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl text-sm font-bold tracking-wide uppercase flex items-center justify-center gap-2 shadow-[0_4px_20px_hsl(var(--brand-gold)/0.35)] hover:shadow-[0_6px_28px_hsl(var(--brand-gold)/0.5)] transition-all"
              >
                Garantir com {page.coupon_discount} de desconto <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={onClose}
                className="text-[0.72rem] text-muted-foreground underline underline-offset-[3px] hover:text-foreground/60 transition-colors text-center"
              >
                Não, prefiro pagar o preço cheio
              </button>
            </div>
          </>
        ) : (
          <div className="px-8 py-6 text-center text-sm text-muted-foreground">
            ⏰ Cupom expirado.{" "}
            <a href={page.cta_url} className="text-primary hover:underline">
              Ver condições normais →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponModal;
