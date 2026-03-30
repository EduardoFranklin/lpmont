import { motion } from "framer-motion";
import { useSection, parseJSON } from "@/hooks/useSiteContent";

const BenefitsSection = () => {
  const c = useSection("benefits");
  const gear = parseJSON<{ title: string; desc: string; num: string }[]>(c.items, []);

  return (
    <section className="py-16 sm:py-36 relative">
      <div className="section-container">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="caption-line-h"><div className="caption-line-h-inner" /></div>
            <span className="text-[12px] tracking-[0.2em] uppercase font-medium text-primary/60">{c.caption}</span>
            <div className="caption-line-h" style={{ transform: "scaleX(-1)" }}><div className="caption-line-h-inner" /></div>
          </div>
          <h2 className="text-[2.1rem] sm:text-4xl lg:text-[3.25rem] font-extrabold sm:font-semibold leading-[1.12] sm:leading-[1.2] text-foreground">{c.title}</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gear.map((g, i) => (
            <motion.div key={g.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="gradient-card group">
              <div className="gradient-card-inner p-7 h-full">
                <span className="text-[11px] tracking-[0.15em] uppercase font-bold text-primary/30 block mb-4">{g.num}</span>
                <h3 className="text-base font-medium text-foreground/90 mb-2">{g.title}</h3>
                <p className="text-foreground/30 text-[14px] leading-relaxed">{g.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
