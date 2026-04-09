import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, ChevronLeft, ChevronRight, Clock, Phone, Trash2 } from "lucide-react";
import { format, addDays, subDays, startOfDay, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Lead } from "@/pages/Dashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  leads: Lead[];
  onRefresh: () => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  pendente: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  confirmada: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  cancelada: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
};

const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 07:00 to 18:00

const parseSlotHour = (scheduled_time: string | null): number | null => {
  if (!scheduled_time) return null;
  const match = scheduled_time.match(/^(\d+)h/);
  return match ? parseInt(match[1]) : null;
};

const parseSlotMinute = (scheduled_time: string | null): number => {
  if (!scheduled_time) return 0;
  const match = scheduled_time.match(/^(\d+)h(\d+)?/);
  return match && match[2] ? parseInt(match[2]) : 0;
};

const DashAgenda = ({ leads, onRefresh }: Props) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(startOfDay(new Date()));

  // All leads with scheduled data (reuniao_data_hora_iso or scheduled_day/time)
  const allScheduledLeads = useMemo(() => {
    return leads.filter(
      (l) => l.scheduled_time && l.status !== "perdido"
    );
  }, [leads]);

  // Get leads for the current date
  const dayLeads = useMemo(() => {
    return allScheduledLeads.filter((l) => {
      if (l.reuniao_data_hora_iso) {
        return isSameDay(new Date(l.reuniao_data_hora_iso), currentDate);
      }
      // Fallback: match by scheduled_day (weekday name)
      const dayName = format(currentDate, "EEEE", { locale: ptBR });
      const normalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      // Map Portuguese day names
      const dayMap: Record<string, string[]> = {
        "Segunda": ["segunda-feira", "Segunda"],
        "Terça": ["terça-feira", "Terça"],
        "Quarta": ["quarta-feira", "Quarta"],
        "Quinta": ["quinta-feira", "Quinta"],
        "Sexta": ["sexta-feira", "Sexta"],
        "Sábado": ["sábado", "Sábado"],
        "Domingo": ["domingo", "Domingo"],
      };
      return Object.entries(dayMap).some(
        ([key, variants]) => l.scheduled_day === key && variants.some((v) => normalizedDay.includes(v))
      );
    });
  }, [allScheduledLeads, currentDate]);

  // Sort by time
  const sortedDayLeads = useMemo(() => {
    return [...dayLeads].sort((a, b) => {
      const hA = parseSlotHour(a.scheduled_time) ?? 0;
      const hB = parseSlotHour(b.scheduled_time) ?? 0;
      if (hA !== hB) return hA - hB;
      return parseSlotMinute(a.scheduled_time) - parseSlotMinute(b.scheduled_time);
    });
  }, [dayLeads]);

  // KPIs
  const todayLeads = useMemo(
    () => allScheduledLeads.filter((l) => {
      if (l.reuniao_data_hora_iso) return isSameDay(new Date(l.reuniao_data_hora_iso), new Date());
      return false;
    }),
    [allScheduledLeads]
  );

  const confirmed = useMemo(
    () => allScheduledLeads.filter((l) => l.reuniao_status === "confirmada").length,
    [allScheduledLeads]
  );

  const pending = useMemo(
    () => allScheduledLeads.filter((l) => l.reuniao_status === "pendente" || !l.reuniao_status).length,
    [allScheduledLeads]
  );

  const showRate = useMemo(() => {
    const attended = leads.filter((l) => l.status === "compareceu" || l.status === "convertido").length;
    const total = allScheduledLeads.length;
    return total > 0 ? Math.round((attended / total) * 100) : 0;
  }, [leads, allScheduledLeads]);

  const goToday = () => setCurrentDate(startOfDay(new Date()));
  const goPrev = () => setCurrentDate((d) => subDays(d, 1));
  const goNext = () => setCurrentDate((d) => addDays(d, 1));

  const isToday = isSameDay(currentDate, new Date());

  const formattedDate = format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const dayOfWeekLabel = format(currentDate, "EEEE", { locale: ptBR }).toUpperCase();
  const dayNumber = format(currentDate, "dd");

  // Build a map of hour → leads
  const leadsByHour = useMemo(() => {
    const map = new Map<number, typeof sortedDayLeads>();
    sortedDayLeads.forEach((l) => {
      const h = parseSlotHour(l.scheduled_time);
      if (h !== null) {
        const arr = map.get(h) || [];
        arr.push(l);
        map.set(h, arr);
      }
    });
    return map;
  }, [sortedDayLeads]);

  const handleDelete = async (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Remover agendamento deste lead?")) return;
    await supabase
      .from("leads")
      .update({
        scheduled_day: null,
        scheduled_time: null,
        reuniao_data_hora_iso: null,
        reuniao_data_extenso: null,
        reuniao_hora_extenso: null,
        status: "novo",
      } as any)
      .eq("id", leadId);
    toast.success("Agendamento removido");
    onRefresh();
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <h2 className="text-lg font-bold flex items-center gap-2">
        <CalendarCheck className="w-5 h-5" /> Agenda
      </h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "HOJE", value: todayLeads.length, color: "text-foreground" },
          { label: "CONFIRMADAS", value: confirmed, color: "text-emerald-400" },
          { label: "PENDENTES", value: pending, color: "text-amber-400" },
          { label: "SHOW RATE", value: `${showRate}%`, color: "text-primary" },
        ].map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">
              {kpi.label}
            </p>
            <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToday}
            className={isToday ? "border-primary/40 text-primary" : ""}
          >
            Hoje
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goPrev}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <span className="text-sm font-medium text-foreground/80">{formattedDate}</span>
        </div>
        <span className="text-xs text-muted-foreground border border-border rounded-md px-2.5 py-1">
          {sortedDayLeads.length} reuniões
        </span>
      </div>

      {/* Day Header */}
      <div className="text-center py-4 border-b border-border">
        <p className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground">
          {dayOfWeekLabel.split("-")[0]}
        </p>
        <p className="text-3xl font-bold text-foreground/90 mt-0.5">{dayNumber}</p>
      </div>

      {/* Time Grid */}
      <div className="relative">
        {HOURS.map((hour) => {
          const hourLeads = leadsByHour.get(hour) || [];
          return (
            <div key={hour} className="relative min-h-[72px] border-t border-border/40">
              {/* Hour label */}
              <span className="absolute -top-3 left-0 text-[11px] text-muted-foreground font-mono bg-background px-1">
                {String(hour).padStart(2, "0")}:00
              </span>

              {/* Appointment cards */}
              <div className="ml-16 sm:ml-20 py-2 space-y-2">
                {hourLeads.map((lead) => {
                  const status = lead.reuniao_status || "pendente";
                  const colors = STATUS_COLORS[status] || STATUS_COLORS.pendente;
                  const slotMin = parseSlotMinute(lead.scheduled_time);
                  const timeStr = `${String(hour).padStart(2, "0")}:${String(slotMin).padStart(2, "0")}`;

                  return (
                    <div
                      key={lead.id}
                      onClick={() => navigate(`/dash/lead/${lead.id}`)}
                      className="group relative flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 border-l-primary/70 bg-primary/5 hover:bg-primary/10 cursor-pointer transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground/90 truncate">
                          {lead.treatment} {lead.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {timeStr}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {lead.phone}
                          </span>
                          <span
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${colors.bg} ${colors.text}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDelete(lead.id, e)}
                        className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity p-1.5 rounded hover:bg-destructive/10"
                        title="Remover agendamento"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashAgenda;
