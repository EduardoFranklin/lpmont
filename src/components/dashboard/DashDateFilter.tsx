import { useState } from "react";
import { format, startOfDay, startOfWeek, startOfMonth, startOfYear, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type DatePreset = "tudo" | "hoje" | "7dias" | "semana" | "mes" | "ano" | "periodo";

const PRESETS: { value: DatePreset; label: string }[] = [
  { value: "tudo", label: "Tudo" },
  { value: "hoje", label: "Hoje" },
  { value: "7dias", label: "Últimos 7 dias" },
  { value: "semana", label: "Esta semana" },
  { value: "mes", label: "Este mês" },
  { value: "ano", label: "Este ano" },
  { value: "periodo", label: "Período" },
];

export interface DateRange {
  from: Date;
  to: Date;
}

export const getDateRange = (preset: DatePreset, customRange?: { from?: Date; to?: Date }): DateRange => {
  const now = new Date();
  const todayStart = startOfDay(now);

  switch (preset) {
    case "tudo":
      return { from: new Date(2020, 0, 1), to: now };
    case "hoje":
      return { from: todayStart, to: now };
    case "7dias":
      return { from: startOfDay(subDays(now, 6)), to: now };
    case "semana":
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: now };
    case "mes":
      return { from: startOfMonth(now), to: now };
    case "ano":
      return { from: startOfYear(now), to: now };
    case "periodo":
      return {
        from: customRange?.from || startOfDay(subDays(now, 30)),
        to: customRange?.to || now,
      };
    default:
      return { from: todayStart, to: now };
  }
};

interface DashDateFilterProps {
  preset: DatePreset;
  onPresetChange: (preset: DatePreset) => void;
  customRange: { from?: Date; to?: Date };
  onCustomRangeChange: (range: { from?: Date; to?: Date }) => void;
}

const DashDateFilter = ({ preset, onPresetChange, customRange, onCustomRangeChange }: DashDateFilterProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const range = getDateRange(preset, customRange);

  const handlePreset = (p: DatePreset) => {
    onPresetChange(p);
    if (p !== "periodo") setCalendarOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.filter((p) => p.value !== "periodo").map((p) => (
        <Button
          key={p.value}
          variant={preset === p.value ? "default" : "outline"}
          size="sm"
          className="text-xs h-8"
          onClick={() => handlePreset(p.value)}
        >
          {p.label}
        </Button>
      ))}

      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={preset === "periodo" ? "default" : "outline"}
            size="sm"
            className={cn("text-xs h-8 gap-1.5", preset === "periodo" && "min-w-[200px]")}
            onClick={() => {
              if (preset !== "periodo") onPresetChange("periodo");
            }}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            {preset === "periodo" && customRange.from && customRange.to
              ? `${format(customRange.from, "dd/MM", { locale: ptBR })} — ${format(customRange.to, "dd/MM", { locale: ptBR })}`
              : "Período"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={{ from: customRange.from, to: customRange.to }}
            onSelect={(range) => {
              onCustomRangeChange({ from: range?.from, to: range?.to });
              onPresetChange("periodo");
            }}
            numberOfMonths={2}
            locale={ptBR}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      <span className="text-xs text-muted-foreground ml-1">
        {format(range.from, "dd/MM/yyyy", { locale: ptBR })} — {format(range.to, "dd/MM/yyyy", { locale: ptBR })}
      </span>
    </div>
  );
};

export default DashDateFilter;
