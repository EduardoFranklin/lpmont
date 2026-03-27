import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useSection, parseJSON } from "@/hooks/useSiteContent";

const ProblemSection = () => {
  const c = useSection("problem");
  const obstacles = parseJSON<{ num: string; title: string; desc: string }[]>(c.obstacles, []);

  return (
    <section className="py-28 sm:py-36 relative">
      <div className="section-container relative z-10">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="caption-line-h"><div className="caption-line-h-inner" /></div>
            <span className="text-[12px] tracking-[0.2em] uppercase font-medium text-primary/60">{c.caption}</span>
            <div className="caption-line-h" style={{ transform: "scaleX(-1)" }}><div className="caption-line-h-inner" /></div>
          </div>
          <h2 className="text-[2.1rem] sm:text-4xl lg:text-[3.25rem] font-extrabold sm:font-semibold leading-[1.12] sm:leading-[1.2] text-foreground mb-6">
            {c.title}{" "}
            <span className="text-foreground/40">{c.title_faded}</span>
          </h2>
          <p className="text-foreground/30 text-lg leading-relaxed font-light">{c.description}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
          {obstacles.map((o, i) => (
            <motion.div key={o.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="gradient-card">
              <div className="gradient-card-inner p-7 sm:p-8 h-full">
                <span className="text-[11px] tracking-[0.15em] uppercase font-bold text-primary/40 block mb-5">{o.num}</span>
                <h3 className="text-lg font-medium text-foreground/90 mb-3 leading-snug">{o.title}</h3>
                <p className="text-foreground/35 text-[15px] leading-relaxed">{o.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-24 max-w-3xl mx-auto text-center">
          <div className="trail-divider mb-8" />
          <p className="text-xl sm:text-2xl text-foreground/50 italic leading-relaxed font-light">
            "{c.quote}"
          </p>
          <p className="mt-6 text-sm text-foreground/25">{c.quote_author}</p>
        </motion.div>

        <div className="text-center mt-14">
          <a href={c.cta_url} target="_blank" rel="noopener noreferrer" className="btn-summit w-full sm:w-auto justify-center">
            {c.cta_text} <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
