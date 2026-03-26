import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const phone = "5598991426777";
  const message = encodeURIComponent("Quero saber mais sobre o Treinamento Mont'Alverne");
  const url = `https://wa.me/${phone}?text=${message}`;

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BD5A] shadow-lg shadow-[#25D366]/30 flex items-center justify-center transition-colors duration-200"
          aria-label="Fale conosco no WhatsApp"
        >
          <MessageCircle className="w-6 h-6 text-white fill-white" />
        </motion.a>
      )}
    </AnimatePresence>
  );
};

export default WhatsAppButton;
