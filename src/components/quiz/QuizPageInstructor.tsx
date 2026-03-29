import { motion } from "framer-motion";
import { Mountain, Users, GraduationCap, BookOpen } from "lucide-react";
import { parseJSON } from "@/hooks/useSiteContent";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = { Mountain, Users, GraduationCap, BookOpen };

interface Props {
  instructor: Record<string, string>;
}

const QuizPageInstructor = ({ instructor }: Props) => {
  const name = instructor.name ?? "Prof. Breno Mont'Alverne";
  const bio = parseJSON<string[]>(instructor.bio ?? "[]", []);
  const stats = parseJSON<{ value: string; label: string; icon: string }[]>(instructor.stats ?? "[]", []);
  const caption = instructor.caption ?? "Seu guia de trilha";
  const titleFirst = instructor.title_first ?? "Prof. Breno";
  const titleLast = instructor.title_last ?? "Mont'Alverne";

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="glow-gold" style={{ width: 600, height: 600, top: "20%", right: "-20%", opacity: 0.3 }} />
      <div className="max-w-[860px] mx-auto px-5 sm:px-10 relative z-10">
        <div className="grid md:grid-cols-[auto_1fr] gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative flex justify-center"
          >
            <div className="relative">
              <div className="absolute -inset-10 rounded-full bg-primary/5 blur-[80px]" />
              <div className="gradient-card rounded-3xl overflow-hidden">
                <img
                  src="/images/thumbs/breno-thumb.webp"
                  alt={name}
                  className="relative w-full max-w-[240px]"
                  loading="lazy"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="caption-line-h"><div className="caption-line-h-inner" /></div>
              <span className="text-[11px] tracking-[0.2em] uppercase font-medium text-primary/60">{caption}</span>
            </div>

            <h2 className="text-[1.8rem] sm:text-3xl font-extrabold sm:font-semibold text-foreground mb-5 leading-tight">
              {titleFirst}{" "}
              <span className="summit-text font-medium">{titleLast}</span>
            </h2>

            <div className="space-y-3 text-foreground/35 text-[14px] leading-relaxed">
              {bio.map((p, i) => (
                <p key={i} dangerouslySetInnerHTML={{
                  __html: p
                    .replace(/Doutor em Ciências Odontológicas/, '<span class="text-foreground/70 font-medium">Doutor em Ciências Odontológicas</span>')
                    .replace(/Mestre em Dentística/, '<span class="text-foreground/70 font-medium">Mestre em Dentística</span>')
                }} />
              ))}
            </div>

            {stats.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-8">
                {stats.map((s) => {
                  const Icon = iconMap[(s as any).icon] || Mountain;
                  return (
                    <div key={s.label} className="gradient-card">
                      <div className="gradient-card-inner p-4 text-center">
                        <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
                        <p className="text-base font-medium summit-text">{s.value}</p>
                        <p className="text-[10px] text-foreground/30 mt-0.5">{s.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default QuizPageInstructor;
