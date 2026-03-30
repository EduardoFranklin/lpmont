import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useSection, parseJSON } from "@/hooks/useSiteContent";

type Testimonial = { name: string; text: string; role: string; avatar: string };

const ITEMS_PER_PAGE = 3;

const TestimonialCard = ({ t }: { t: Testimonial }) => (
  <div className="gradient-card">
    <div className="gradient-card-inner p-7 h-full flex flex-col">
      <div className="flex gap-0.5 mb-4">
        {[...Array(5)].map((_, s) => (
          <Star key={s} className="w-3.5 h-3.5 fill-primary text-primary" />
        ))}
      </div>
      <p className="text-foreground/40 text-[14px] leading-relaxed italic mb-6 flex-1">"{t.text}"</p>
      <div className="flex items-center gap-3 pt-4 border-t border-foreground/[0.04]">
        <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-foreground/[0.06]" loading="lazy" decoding="async" width={40} height={40} />
        <div>
          <p className="font-medium text-foreground/70 text-sm">{t.name}</p>
          <p className="text-[11px] text-foreground/20">{t.role}</p>
        </div>
      </div>
    </div>
  </div>
);

const TestimonialsSection = () => {
  const c = useSection("testimonials");
  const testimonials = parseJSON<Testimonial[]>(c.items, []);
  const totalPages = Math.ceil(testimonials.length / ITEMS_PER_PAGE);
  const [page, setPage] = useState(0);
  const touchStart = useRef(0);

  const nextPage = () => setPage((p) => (p + 1) % totalPages);
  const prevPage = () => setPage((p) => (p - 1 + totalPages) % totalPages);
  const currentItems = testimonials.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <section className="py-16 sm:py-36 relative">
      <div className="section-container">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="caption-line-h"><div className="caption-line-h-inner" /></div>
            <span className="text-[12px] tracking-[0.2em] uppercase font-medium text-primary/60">{c.caption}</span>
            <div className="caption-line-h" style={{ transform: "scaleX(-1)" }}><div className="caption-line-h-inner" /></div>
          </div>
          <h2 className="text-[2.1rem] sm:text-4xl lg:text-[3.25rem] font-extrabold sm:font-semibold leading-[1.12] sm:leading-[1.2] text-foreground mb-5">{c.title}</h2>
          <p className="text-foreground/30 text-lg font-light">{c.subtitle}</p>
        </motion.div>

        {/* Mobile: paginated */}
        <div className="sm:hidden max-w-6xl mx-auto" onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }} onTouchEnd={(e) => { const diff = touchStart.current - e.changedTouches[0].clientX; if (diff > 50) nextPage(); else if (diff < -50) prevPage(); }}>
          <div className="space-y-4">
            {currentItems.map((t, i) => (
              <motion.div key={`${page}-${i}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <TestimonialCard t={t} />
              </motion.div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-8">
            <button onClick={prevPage} className="w-9 h-9 rounded-full flex items-center justify-center border border-foreground/10 text-foreground/40 hover:border-primary/30 hover:text-primary transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i)} className="w-2 h-2 rounded-full transition-all duration-300" style={{ background: i === page ? "linear-gradient(135deg, hsl(38 100% 55%), hsl(30 80% 45%))" : "rgba(255,255,255,0.1)" }} />
              ))}
            </div>
            <button onClick={nextPage} className="w-9 h-9 rounded-full flex items-center justify-center border border-foreground/10 text-foreground/40 hover:border-primary/30 hover:text-primary transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Desktop: grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <TestimonialCard t={t} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
