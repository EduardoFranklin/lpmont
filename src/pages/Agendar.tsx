import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, BookOpen, Radio, Users, Tag, CheckCircle2, MessageCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const UFS = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA",
  "PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"
];

const CAREERS = [
  { label: "Sou Estudante", value: "estudante" },
  { label: "Sou Dentista", value: "dentista" },
  { label: "Sou Dono de Clínica", value: "dono_clinica" },
];

const TIME_SLOTS = [
  { day: "Segunda", date: "31/03", slots: ["09:00", "10:00", "14:00", "15:00"] },
  { day: "Terça", date: "01/04", slots: ["09:00", "10:00", "14:00", "16:00"] },
  { day: "Quarta", date: "02/04", slots: ["09:00", "11:00", "14:00", "15:00"] },
  { day: "Quinta", date: "03/04", slots: ["09:00", "10:00", "14:00", "16:00"] },
  { day: "Sexta", date: "04/04", slots: ["09:00", "10:00", "14:00", "15:00"] },
];

const benefits = [
  { icon: BookOpen, label: "Biblioteca de Cursos" },
  { icon: Radio, label: "Mentorias Ao Vivo" },
  { icon: Users, label: "Grupo de WhatsApp" },
  { icon: Tag, label: "Descontos em Cursos Presenciais" },
];

const Agendar = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    treatment: "Dr.",
    name: "",
    phone: "",
    email: "",
    uf: "",
    city: "",
    career: "",
  });
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; time: string } | null>(null);

  const progress = step === 1 ? 50 : step === 2 ? 90 : 100;

  const isStep1Valid = form.name && form.phone && form.email && form.uf && form.city && form.career;

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const goToStep2 = () => {
    if (isStep1Valid) setStep(2);
  };

  const goToStep3 = () => {
    if (selectedSlot) setStep(3);
  };

  const stepVariants = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-foreground/[0.04]">
        <div className="section-container flex items-center justify-between h-14">
          <a href="/" className="flex items-center gap-2">
            <img src="/images/logo-metodo-mont.svg" alt="Método Mont'" className="h-7" decoding="async" />
          </a>
          {step < 3 && (
            <span className="text-[11px] tracking-[0.15em] uppercase font-medium text-foreground/30">
              Passo {step} de 2
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 section-container py-5 pb-8 max-w-lg mx-auto w-full">
        {/* Progress */}
        <div className="mb-4">
          <Progress value={progress} className="h-1.5 bg-foreground/[0.06]" />
        </div>

        <AnimatePresence mode="wait">
          {/* ===== STEP 1: FORM ===== */}
          {step === 1 && (
            <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
              {/* Intro text */}
              <div className="mb-5">
                <h1 className="text-lg font-bold text-foreground/90 leading-snug mb-2">
                  Você está há <span className="summit-text">1 passo</span> de falar com a nossa equipe.
                </h1>
                <p className="text-[13px] text-foreground/35 leading-relaxed">
                  Em 20 minutos, vamos mostrar como o treinamento pode conduzir sua carreira até o topo.
                </p>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {benefits.map((b) => {
                  const Icon = b.icon;
                  return (
                    <div key={b.label} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-foreground/[0.03] border border-foreground/[0.06]">
                      <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span className="text-[11px] text-foreground/50 font-medium leading-tight">{b.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Form */}
              <div className="space-y-3">
                <p className="text-[12px] font-semibold tracking-[0.1em] uppercase text-foreground/25">
                  Preencha o formulário
                </p>

                {/* Treatment + Name */}
                <div className="flex gap-2">
                  <div className="w-[90px] flex-shrink-0">
                    <Label className="text-[12px] text-foreground/60 font-medium mb-1.5 block">Tratamento</Label>
                    <select
                      value={form.treatment}
                      onChange={(e) => handleChange("treatment", e.target.value)}
                      className="w-full h-10 rounded-md border border-foreground/20 bg-foreground/[0.06] px-2 text-sm text-foreground/80 focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/40"
                    >
                      <option value="Dr.">Dr.</option>
                      <option value="Dra.">Dra.</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-[12px] text-foreground/60 font-medium mb-1.5 block">Seu nome</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Nome completo"
                      className="border-foreground/20 bg-foreground/[0.06] text-foreground/80 placeholder:text-foreground/25"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <Label className="text-[12px] text-foreground/60 font-medium mb-1.5 block">Telefone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="(00) 00000-0000"
                    type="tel"
                    className="border-foreground/20 bg-foreground/[0.06] text-foreground/80 placeholder:text-foreground/25"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label className="text-[12px] text-foreground/60 font-medium mb-1.5 block">Email</Label>
                  <Input
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="seu@email.com"
                    type="email"
                    className="border-foreground/20 bg-foreground/[0.06] text-foreground/80 placeholder:text-foreground/25"
                  />
                </div>

                {/* UF + City */}
                <div className="flex gap-2">
                  <div className="w-[80px] flex-shrink-0">
                    <Label className="text-[12px] text-foreground/60 font-medium mb-1.5 block">UF</Label>
                    <select
                      value={form.uf}
                      onChange={(e) => handleChange("uf", e.target.value)}
                      className="w-full h-10 rounded-md border border-foreground/20 bg-foreground/[0.06] px-2 text-sm text-foreground/80 focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/40"
                    >
                      <option value="">UF</option>
                      {UFS.map((uf) => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-[12px] text-foreground/60 font-medium mb-1.5 block">Cidade</Label>
                    <Input
                      value={form.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      placeholder="Sua cidade"
                      className="border-foreground/20 bg-foreground/[0.06] text-foreground/80 placeholder:text-foreground/25"
                    />
                  </div>
                </div>

                {/* Career */}
                <div>
                  <Label className="text-[12px] text-foreground/60 font-medium mb-1.5 block">Carreira</Label>
                  <div className="flex gap-2">
                    {CAREERS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => handleChange("career", c.value)}
                        className={`flex-1 py-2.5 rounded-lg text-[12px] font-medium border transition-all duration-200 ${
                          form.career === c.value
                            ? "border-primary/50 bg-primary/15 text-primary"
                            : "border-foreground/15 bg-foreground/[0.06] text-foreground/50 hover:border-foreground/25"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={goToStep2}
                disabled={!isStep1Valid}
                className="btn-summit w-full justify-center text-sm py-3.5 mt-5 disabled:opacity-40 disabled:pointer-events-none"
              >
                Escolher Horário <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* ===== STEP 2: TIME SLOTS ===== */}
          {step === 2 && (
            <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
              <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-[13px] text-foreground/40 hover:text-foreground/60 transition-colors mb-4">
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar
              </button>

              <h2 className="text-lg font-bold text-foreground/90 leading-snug mb-1">
                Escolha o melhor <span className="summit-text">horário</span>
              </h2>
              <p className="text-[13px] text-foreground/35 mb-5">
                Reunião online de 20 min com nosso especialista.
              </p>

              <div className="space-y-4">
                {TIME_SLOTS.map((day) => (
                  <div key={day.day}>
                    <p className="text-[12px] font-semibold text-foreground/30 mb-2">
                      {day.day} · <span className="text-foreground/20">{day.date}</span>
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {day.slots.map((time) => {
                        const isSelected = selectedSlot?.day === day.day && selectedSlot?.time === time;
                        return (
                          <button
                            key={`${day.day}-${time}`}
                            onClick={() => setSelectedSlot({ day: day.day, time })}
                            className={`py-2.5 rounded-lg text-[13px] font-medium border transition-all duration-200 ${
                              isSelected
                                ? "border-primary/50 bg-primary/15 text-primary"
                                : "border-foreground/[0.08] bg-foreground/[0.03] text-foreground/45 hover:border-foreground/[0.15]"
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={goToStep3}
                disabled={!selectedSlot}
                className="btn-summit w-full justify-center text-sm py-3.5 mt-6 disabled:opacity-40 disabled:pointer-events-none"
              >
                Confirmar Agendamento <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* ===== STEP 3: SUCCESS ===== */}
          {step === 3 && (
            <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="flex flex-col items-center justify-center text-center pt-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{ background: "linear-gradient(135deg, hsl(var(--brand-gold) / 0.15), hsl(var(--brand-gold) / 0.05))", border: "1px solid hsl(var(--brand-gold) / 0.2)" }}
              >
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </motion.div>

              <h2 className="text-xl font-bold text-foreground/90 mb-2">
                Agendamento <span className="summit-text">confirmado!</span>
              </h2>
              <p className="text-[14px] text-foreground/40 leading-relaxed max-w-xs mb-2">
                {form.treatment} {form.name}, sua reunião está marcada para:
              </p>
              <div className="rounded-xl border border-primary/15 bg-primary/[0.04] px-6 py-4 mb-6">
                <p className="text-base font-semibold text-foreground/70">
                  {selectedSlot?.day} · {selectedSlot?.time}
                </p>
                <p className="text-[12px] text-foreground/30 mt-1">20 minutos · Online</p>
              </div>

              <p className="text-[13px] text-foreground/35 mb-6 max-w-xs">
                Enquanto isso, entre no nosso grupo do WhatsApp para receber lembretes e conteúdos exclusivos.
              </p>

              <a
                href="https://wa.me/5500000000000?text=Ol%C3%A1%2C%20acabei%20de%20agendar%20uma%20reuni%C3%A3o!"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-summit w-full justify-center text-sm py-3.5 gap-2"
              >
                <MessageCircle className="w-4 h-4" /> Falar com a Equipe
              </a>

              <a href="/" className="text-[13px] text-foreground/30 hover:text-foreground/50 transition-colors mt-4">
                Voltar ao site
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Agendar;
