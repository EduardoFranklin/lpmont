import { ShieldCheck } from "lucide-react";

const QuizPageGuarantee = () => (
  <div className="max-w-[860px] mx-auto px-5 sm:px-10 relative z-[1]">
    <div className="bg-gradient-to-br from-green-500/5 to-transparent border border-green-500/18 rounded-2xl p-7 flex items-center gap-6 flex-wrap">
      <div className="w-[58px] h-[58px] rounded-full bg-green-500/10 border border-green-500/25 flex items-center justify-center flex-shrink-0">
        <ShieldCheck className="w-6 h-6 text-green-400" />
      </div>
      <div className="flex-1 min-w-[200px]">
        <strong className="block text-[0.95rem] font-semibold text-green-400 mb-1">
          Garantia de 15 dias
        </strong>
        <p className="text-[0.81rem] text-muted-foreground leading-relaxed font-light">
          Se em 15 dias você sentir que o treinamento não é para você, devolvemos 100% do investimento. Sem perguntas, sem burocracia.
        </p>
      </div>
    </div>
  </div>
);

export default QuizPageGuarantee;
