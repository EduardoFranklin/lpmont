import { parseJSON } from "@/hooks/useSiteContent";

interface Props {
  instructor: Record<string, string>;
}

const QuizPageInstructor = ({ instructor }: Props) => {
  const name = instructor.name ?? "Prof. Breno Mont'Alverne";
  const bio = parseJSON<string[]>(instructor.bio ?? "[]", []);
  const stats = parseJSON<{ value: string; label: string }[]>(instructor.stats ?? "[]", []);
  const img = instructor.img ?? "";

  const initials = name
    .split(" ")
    .filter((w) => w.length > 2)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-[860px] mx-auto px-5 sm:px-10 pb-5 relative z-[1]">
      <div className="bg-card border border-border rounded-2xl p-8 flex items-center gap-7 flex-wrap">
        <div className="w-[72px] h-[72px] rounded-full flex-shrink-0 bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center overflow-hidden">
          {img ? (
            <img src={img} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-['Bebas_Neue',sans-serif] text-2xl text-primary">{initials}</span>
          )}
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="font-['Bebas_Neue',sans-serif] text-xl tracking-wide mb-1">
            {name.split(" ").map((w, i) => (
              <span key={i}>
                {i > 0 && " "}
                {w.includes("Mont") || w.includes("'") ? (
                  <span className="text-primary">{w}</span>
                ) : (
                  w
                )}
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed font-light">
            {bio.join(" ")}
          </p>
        </div>
        {stats.length > 0 && (
          <div className="flex gap-5 flex-shrink-0 flex-wrap">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <strong className="block font-['Bebas_Neue',sans-serif] text-2xl text-primary leading-none">
                  {s.value}
                </strong>
                <span className="text-[0.66rem] text-muted-foreground uppercase tracking-widest">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPageInstructor;
