import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

const FloatingCTA = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-popover/90 backdrop-blur-xl border-t border-border sm:hidden"
        >
          <a href="#preco" className="btn-cta w-full justify-center text-sm py-3">
            Garantir minha vaga <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingCTA;
