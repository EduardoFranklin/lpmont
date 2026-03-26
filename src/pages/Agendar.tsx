import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, BookOpen, Radio, Users, Tag, CheckCircle2, MessageCircle, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useTrackingScripts from "@/hooks/useTrackingScripts";
import useUtmCapture from "@/hooks/useUtmCapture";

const UFS = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA",
  "PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"
];

const getCareers = (treatment: string) => [
  { label: "Sou Dentista", value: "dentista" },
  { label: treatment === "Dra." ? "Sou Dona de Clínica" : "Sou Dono de Clínica", value: "dono_clinica" },
  { label: "Sou Estudante", value: "estudante" },
];

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const ALL_SLOTS = ["9h às 9h30", "10h às 10h30", "11h às 11h30", "14h às 14h30", "15h às 15h30", "16h às 16h30"];

// Generate slots for today + next 3 days (skip weekends)
const generateTimeSlots = () => {
  const result: { day: string; date: string; slots: string[]; unavailable: string[] }[] = [];
  const now = new Date();
  let d = new Date(now);
  while (result.length < 4) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      // Pseudo-random unavailable based on date seed
      const seed = d.getDate() * 7 + d.getMonth() * 13;
      const unavailable = ALL_SLOTS.filter((_, i) => (seed + i * 3) % 5 === 0);
      result.push({
        day: WEEKDAYS[dow],
        date: `${dd}/${mm}`,
        slots: [...ALL_SLOTS],
        unavailable,
      });
    }
    d = new Date(d.getTime() + 86400000);
  }
  return result;
};

const TIME_SLOTS = generateTimeSlots();

// Parse start hour from slot label like "9h às 9h30" → 9
const parseSlotHour = (slot: string): number => {
  const match = slot.match(/^(\d+)h/);
  return match ? parseInt(match[1], 10) : 0;
};

// Check if a slot is too soon (less than 2h from now)
const isSlotTooSoon = (date: string, slot: string): boolean => {
  const now = new Date();
  const [dd, mm] = date.split("/").map(Number);
  const year = now.getFullYear();
  const slotDate = new Date(year, mm - 1, dd, parseSlotHour(slot), 0, 0);
  const minTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  return slotDate < minTime;
};

const benefits = [
  { icon: BookOpen, label: "Biblioteca de Cursos" },
  { icon: Radio, label: "Mentorias Ao Vivo" },
  { icon: Users, label: "Grupo de WhatsApp" },
  { icon: Tag, label: "Descontos em Cursos Presenciais" },
];

const ADMIN_EMAIL = "mktmetodomont@gmail.com";

// Generate Google Calendar URL with Meet
const buildGoogleCalendarUrl = (
  title: string,
  description: string,
  dateStr: string, // "dd/mm"
  timeSlot: string, // "9h às 9h30"
  guestEmail: string
): string => {
  const [dd, mm] = dateStr.split("/").map(Number);
  const year = new Date().getFullYear();
  const timeMatch = timeSlot.match(/^(\d+)h/);
  const startHour = timeMatch ? parseInt(timeMatch[1]) : 9;

  // Build start and end dates in local time (São Paulo = UTC-3)
  const start = new Date(year, mm - 1, dd, startHour, 0, 0);
  const end = new Date(year, mm - 1, dd, startHour, 30, 0);

  const fmt = (d: Date) =>
    d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0") +
    "T" +
    String(d.getHours()).padStart(2, "0") +
    String(d.getMinutes()).padStart(2, "0") +
    "00";

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: description,
    add: `${guestEmail},${ADMIN_EMAIL}`,
    ctz: "America/Sao_Paulo",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const Agendar = () => {
  useTrackingScripts();
  const utmParams = useUtmCapture();
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
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; date: string; time: string } | null>(null);
  const [dynamicUnavailable, setDynamicUnavailable] = useState<{ day: string; time: string } | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);

  // Cache cities per UF to avoid repeated API calls
  const citiesCacheRef = useRef<Record<string, string[]>>({});

  // Fetch cities from IBGE API when UF changes
  useEffect(() => {
    if (!form.uf) {
      setCities([]);
      return;
    }

    handleChange("city", "");
    setCitySearch("");

    // Use cache if available
    if (citiesCacheRef.current[form.uf]) {
      const cached = citiesCacheRef.current[form.uf];
      setCities(cached);
      if (cached.length > 0) handleChange("city", cached[0]);
      return;
    }

    setLoadingCities(true);
    const controller = new AbortController();

    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${form.uf}/municipios?orderBy=nome`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data: { nome: string }[]) => {
        const names = data.map((c) => c.nome);
        citiesCacheRef.current[form.uf] = names;
        setCities(names);
        if (names.length > 0) handleChange("city", names[0]);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setCities([]);
      })
      .finally(() => setLoadingCities(false));

    return () => controller.abort();
  }, [form.uf]);

  // Close city dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const normalize = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filteredCities = citySearch
    ? cities.filter((c) => normalize(c).includes(normalize(citySearch)))
    : cities;

  const progress = step === 1 ? 50 : step === 2 ? 90 : 100;

  const isStep1Valid = form.name && form.phone && form.email && form.uf && form.city && form.career;

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits.length ? `(${digits}` : "";
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const goToStep2 = () => {
    if (isStep1Valid) {
      setStep(2);
      setDynamicUnavailable(null);
      // After 3s, mark a random available slot as unavailable
      setTimeout(() => {
        const available: { day: string; time: string }[] = [];
        TIME_SLOTS.forEach((d) => {
          d.slots.forEach((t) => {
            if (!d.unavailable?.includes(t) && !isSlotTooSoon(d.date, t)) available.push({ day: d.day, time: t });
          });
        });
        if (available.length > 0) {
          setDynamicUnavailable(available[Math.floor(Math.random() * available.length)]);
        }
      }, 3000);
    }
  };

  const goToStep3 = async () => {
    if (!selectedSlot) return;
    try {
      await supabase.from("leads").insert({
        treatment: form.treatment,
        name: form.name,
        phone: form.phone,
        email: form.email,
        uf: form.uf,
        city: form.city,
        career: form.career,
        scheduled_day: selectedSlot.day,
        scheduled_time: selectedSlot.time,
        status: "agendado",
        utm_source: utmParams.utm_source || null,
        utm_medium: utmParams.utm_medium || null,
        utm_campaign: utmParams.utm_campaign || null,
        utm_term: utmParams.utm_term || null,
        utm_content: utmParams.utm_content || null,
      } as any);

      // Send welcome email with calendar info (fire-and-forget)
      supabase.functions.invoke("send-welcome-email", {
        body: {
          recipientEmail: form.email,
          recipientName: form.name,
          treatment: form.treatment,
          scheduledDay: selectedSlot.day,
          scheduledDate: selectedSlot.date,
          scheduledTime: selectedSlot.time,
        },
      }).catch((err) => console.error("Welcome email error:", err));
    } catch (err) {
      console.error("Erro ao salvar lead:", err);
    }
    setStep(3);
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

      <div className="flex-1 section-container py-5 pb-4 max-w-lg mx-auto w-full">
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
                <h1 className="text-[1.4rem] font-extrabold text-foreground/95 leading-[1.2] mb-2">
                  Você está há <span className="summit-text">1 passo</span> de falar com a nossa equipe.
                </h1>
                <p className="text-[13px] text-foreground/35 leading-relaxed">
                  Em 30 minutos, vamos mostrar como o treinamento pode conduzir sua carreira até o topo.
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
                    <Label className="text-[12px] text-foreground/60 font-medium mb-1.5 block">Tratamento <span className="text-primary">*</span></Label>
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
                    <Label className="text-[12px] text-foreground/60 font-medium mb-1.5 block">Seu nome <span className="text-primary">*</span></Label>
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
                  <Label className="text-[12px] text-foreground/60 font-medium mb-1.5 block">Telefone <span className="text-primary">*</span></Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => handleChange("phone", formatPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    type="tel"
                    maxLength={15}
                    className="border-foreground/20 bg-foreground/[0.06] text-foreground/80 placeholder:text-foreground/25"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label className="text-[12px] text-foreground/60 font-medium mb-1.5 block">Email <span className="text-primary">*</span></Label>
                  <Input
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value.toLowerCase())}
                    placeholder="seu@email.com"
                    type="email"
                    className="border-foreground/20 bg-foreground/[0.06] text-foreground/80 placeholder:text-foreground/25 lowercase"
                  />
                </div>

                {/* UF + City */}
                <div className="flex gap-2">
                  <div className="w-[80px] flex-shrink-0">
                    <Label className="text-[12px] text-foreground/60 font-medium mb-1.5 block">UF <span className="text-primary">*</span></Label>
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
                  <div className="flex-1 relative" ref={cityRef}>
                    <Label className="text-[12px] text-foreground/60 font-medium mb-1.5 block">Cidade <span className="text-primary">*</span></Label>
                    <Input
                      value={form.city || citySearch}
                      onChange={(e) => {
                        setCitySearch(e.target.value);
                        setCityDropdownOpen(true);
                        if (form.city) handleChange("city", "");
                      }}
                      onFocus={() => setCityDropdownOpen(true)}
                      placeholder={loadingCities ? "Carregando..." : form.uf ? "Digite para buscar" : "Selecione o UF"}
                      disabled={!form.uf || loadingCities}
                      className="border-foreground/20 bg-foreground/[0.06] text-foreground/80 placeholder:text-foreground/25"
                    />
                    {cityDropdownOpen && filteredCities.length > 0 && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg border border-foreground/15 bg-card shadow-xl">
                        {filteredCities.slice(0, 50).map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => {
                              handleChange("city", city);
                              setCitySearch("");
                              setCityDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-foreground/70 hover:bg-foreground/[0.06] transition-colors"
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Career */}
                <div>
                  <Label className="text-[12px] text-foreground/60 font-medium mb-1.5 block">Carreira <span className="text-primary">*</span></Label>
                  <div className="flex gap-2">
                    {getCareers(form.treatment).map((c) => (
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

              {/* CTA - inline on desktop */}
              <button
                onClick={goToStep2}
                disabled={!isStep1Valid}
                className="btn-summit w-full justify-center text-sm py-3.5 mt-5 disabled:opacity-40 disabled:pointer-events-none hidden sm:inline-flex"
              >
                Escolher Horário <ArrowRight className="w-4 h-4" />
              </button>

              {/* Spacer for floating button on mobile */}
              <div className="h-16 sm:hidden" />
            </motion.div>
          )}

          {/* ===== STEP 2: TIME SLOTS ===== */}
          {step === 2 && (
            <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
              <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-[13px] text-foreground/40 hover:text-foreground/60 transition-colors mb-4">
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar
              </button>

              <h2 className="text-[1.4rem] font-extrabold text-foreground/95 leading-[1.2] mb-1">
                Escolha o melhor <span className="summit-text">horário</span>
              </h2>
              <p className="text-[13px] text-foreground/35 mb-5">
                Reunião online de 30 min com nosso consultor.
              </p>

              <div className="space-y-4">
                {TIME_SLOTS.map((day) => (
                  <div key={day.day}>
                    <p className="text-[12px] font-semibold text-foreground/30 mb-2">
                      {day.day} · <span className="text-foreground/20">{day.date}</span>
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {day.slots.map((time) => {
                        const isUnavailable = day.unavailable?.includes(time) || (dynamicUnavailable?.day === day.day && dynamicUnavailable?.time === time) || isSlotTooSoon(day.date, time);
                        const isSelected = !isUnavailable && selectedSlot?.day === day.day && selectedSlot?.time === time;
                        return (
                          <button
                            key={`${day.day}-${time}`}
                            onClick={() => !isUnavailable && setSelectedSlot((prev) => prev?.day === day.day && prev?.time === time ? null : { day: day.day, date: day.date, time })}
                            disabled={isUnavailable}
                            className={`py-2.5 rounded-lg text-[13px] font-medium border transition-all duration-200 ${
                              isUnavailable
                                ? "border-foreground/[0.04] bg-foreground/[0.02] text-foreground/15 line-through cursor-not-allowed"
                                : isSelected
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
                className="btn-summit w-full justify-center text-sm py-3.5 mt-6 disabled:opacity-40 disabled:pointer-events-none hidden sm:inline-flex"
              >
                Confirmar Agendamento <ArrowRight className="w-4 h-4" />
              </button>

              {/* Spacer for floating button on mobile */}
              <div className="h-20 sm:hidden" />
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

              <h2 className="text-[1.4rem] font-extrabold text-foreground/95 leading-[1.2] mb-2">
                Agendamento <span className="summit-text">confirmado!</span>
              </h2>
              <p className="text-[14px] text-foreground/40 leading-relaxed max-w-xs mb-2">
                {form.treatment} {form.name}, sua reunião está marcada para:
              </p>
              <div className="rounded-xl border border-primary/15 bg-primary/[0.04] px-6 py-4 mb-4">
                <p className="text-base font-semibold text-foreground/70">
                  {selectedSlot?.day} · {selectedSlot?.date} · {selectedSlot?.time}
                </p>
                <p className="text-[12px] text-foreground/30 mt-1">30 minutos · Online</p>
              </div>

              {/* Google Calendar button */}
              {selectedSlot && (
                <a
                  href={buildGoogleCalendarUrl(
                    `Reunião Método Mont' - ${form.treatment} ${form.name}`,
                    `Reunião online de 30 min com a equipe do Método Mont'.\n\nParticipantes:\n- ${form.treatment} ${form.name} (${form.email})\n- Equipe Método Mont' (${ADMIN_EMAIL})`,
                    selectedSlot.date,
                    selectedSlot.time,
                    form.email
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-summit w-full justify-center text-sm py-3.5 gap-2"
                >
                  <Calendar className="w-5 h-5" /> Adicionar ao Google Calendar
                </a>
              )}

              <a href="/" className="text-[13px] text-foreground/30 hover:text-foreground/50 transition-colors mt-4">
                Voltar ao site
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating CTA on mobile */}
      {step === 1 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 p-3 backdrop-blur-2xl border-t border-foreground/[0.04] sm:hidden"
          style={{ backgroundColor: "hsl(var(--background) / 0.85)" }}
        >
          <button
            onClick={goToStep2}
            disabled={!isStep1Valid}
            className="btn-summit w-full justify-center text-sm py-3.5 disabled:opacity-40 disabled:pointer-events-none"
          >
            Escolher Horário <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
      {step === 2 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 p-3 backdrop-blur-2xl border-t border-foreground/[0.04] sm:hidden"
          style={{ backgroundColor: "hsl(var(--background) / 0.85)" }}
        >
          <button
            onClick={goToStep3}
            disabled={!selectedSlot}
            className="btn-summit w-full justify-center text-sm py-3.5 disabled:opacity-40 disabled:pointer-events-none"
          >
            Confirmar Agendamento <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Agendar;
