import { useState } from "react";
import { X, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { QuizPageData } from "@/pages/QuizPage";

interface Props {
  open: boolean;
  onClose: () => void;
  onUnlock: () => void;
  page: QuizPageData;
}

const UnlockModal = ({ open, onClose, onUnlock, page }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    // Save lead
    try {
      await supabase.from("leads").insert({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        treatment: "Dr.",
        uf: "N/A",
        city: "N/A",
        career: "N/A",
        notes: `Quiz page: ${page.slug}`,
        quiz_slug: page.slug,
      } as any);
    } catch {}

    setSuccess(true);
  };

  const handleGo = () => {
    onUnlock();
    setSuccess(false);
    setName("");
    setEmail("");
    setPhone("");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-5 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border/60 rounded-2xl w-full max-w-[440px] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-[34px] h-[34px] rounded-full bg-foreground/7 flex items-center justify-center text-foreground hover:bg-foreground/14 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {!success ? (
          <>
            <div className="p-9 pb-6 border-b border-border bg-gradient-to-br from-primary/5 to-transparent text-center">
              <div className="w-[62px] h-[62px] rounded-full mx-auto mb-4 bg-primary/10 border border-primary/25 flex items-center justify-center text-3xl">
                🎬
              </div>
              <h3 className="font-['Bebas_Neue',sans-serif] text-2xl tracking-wide mb-1.5">
                Desbloquear Aula
              </h3>
              <p className="text-sm text-muted-foreground font-light">
                Preencha seus dados para liberar o acesso gratuito a este conteúdo.
              </p>
            </div>
            <div className="p-9 pt-6 space-y-3">
              <div>
                <label className="text-[0.7rem] font-semibold tracking-widest uppercase text-muted-foreground mb-1 block">
                  Nome completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. João Silva"
                  className="w-full bg-foreground/[0.04] border border-foreground/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 focus:bg-primary/[0.04] transition-colors"
                />
              </div>
              <div>
                <label className="text-[0.7rem] font-semibold tracking-widest uppercase text-muted-foreground mb-1 block">
                  E-mail profissional
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="joao@clinica.com.br"
                  className="w-full bg-foreground/[0.04] border border-foreground/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 focus:bg-primary/[0.04] transition-colors"
                />
              </div>
              <div>
                <label className="text-[0.7rem] font-semibold tracking-widest uppercase text-muted-foreground mb-1 block">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(98) 99999-9999"
                  className="w-full bg-foreground/[0.04] border border-foreground/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 focus:bg-primary/[0.04] transition-colors"
                />
              </div>
              <button
                onClick={handleSubmit}
                className={`w-full bg-primary text-primary-foreground py-3.5 rounded-xl text-sm font-semibold tracking-wide uppercase flex items-center justify-center gap-2 hover:brightness-110 transition-all mt-1 ${
                  shake ? "animate-[shake_0.4s_ease]" : ""
                }`}
              >
                Desbloquear agora <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <p className="text-[0.7rem] text-muted-foreground text-center">
                Sem spam. Seus dados são usados apenas para liberar o acesso.
              </p>
            </div>
          </>
        ) : (
          <div className="p-12 flex flex-col items-center text-center gap-3">
            <div className="w-[62px] h-[62px] rounded-full bg-green-500/12 border border-green-500/30 flex items-center justify-center text-3xl mb-1">
              ✅
            </div>
            <h3 className="font-['Bebas_Neue',sans-serif] text-2xl tracking-wide text-green-400">
              Desbloqueado!
            </h3>
            <p className="text-sm text-muted-foreground">Acesso liberado. Bons estudos!</p>
            <button
              onClick={handleGo}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-semibold tracking-wide uppercase mt-2 hover:brightness-110 transition-all"
            >
              Acessar agora →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnlockModal;
