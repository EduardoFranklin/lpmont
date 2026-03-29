import { Gift, Users } from "lucide-react";
import { useSection, parseJSON } from "@/hooks/useSiteContent";

const QuizPageBonuses = () => {
  const c = useSection("pricing");
  const bonuses = parseJSON<string[]>(c.bonuses, []);

  return (
    <section className="max-w-[860px] mx-auto px-5 sm:px-10 py-10 relative z-[1]">
      <p className="text-[0.65rem] font-bold tracking-[0.16em] uppercase text-primary/60 flex items-center gap-2 mb-5">
        <Gift className="w-3.5 h-3.5" /> {c.bonus_label || "Bônus da expedição"}
      </p>

      {/* Main bonus */}
      <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-5 mb-3">
        <p className="text-[0.82rem] font-medium text-foreground/60 mb-1">
          {c.bonus_main_title}
        </p>
        <p className="text-base font-semibold text-primary flex items-center gap-2">
          <Users className="w-4 h-4" /> {c.bonus_main_name}
        </p>
        <p className="text-foreground/30 text-[0.75rem] mt-2 leading-relaxed">
          {c.bonus_main_desc}
        </p>
      </div>

      {/* Extra bonuses */}
      <div className="space-y-2.5">
        {bonuses.map((b) => (
          <div
            key={b}
            className="rounded-xl border border-primary/15 bg-primary/[0.03] px-5 py-4 flex items-center gap-3"
          >
            <Gift className="w-4 h-4 text-primary/50 flex-shrink-0" />
            <p className="text-[0.82rem] font-medium text-foreground/55">{b}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default QuizPageBonuses;
