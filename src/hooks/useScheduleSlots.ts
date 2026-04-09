import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

interface ScheduleConfig {
  slot_duration_min: number;
  buffer_min: number;
  advance_hours: number;
  max_days_ahead: number;
}

interface AvailabilitySlot {
  day_of_week: number;
  start_time: string; // "HH:MM:SS"
  end_time: string;
}

interface BlockedPeriod {
  start_at: string;
  end_at: string;
}

export interface DaySlots {
  day: string;
  date: string; // "dd/mm"
  isoDate: string; // "YYYY-MM-DD"
  slots: string[]; // e.g. ["9h às 9h25", "9h30 às 9h55"]
}

const pad2 = (n: number) => String(n).padStart(2, "0");

const formatHourMin = (h: number, m: number) => {
  if (m === 0) return `${h}h`;
  return `${h}h${pad2(m)}`;
};

const buildSlotLabel = (startH: number, startM: number, endH: number, endM: number) =>
  `${formatHourMin(startH, startM)} às ${formatHourMin(endH, endM)}`;

const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};

const isWithinBlocked = (isoDate: string, slotStartMin: number, blocked: BlockedPeriod[]) => {
  for (const b of blocked) {
    const bStart = new Date(b.start_at);
    const bEnd = new Date(b.end_at);
    const [y, mo, d] = isoDate.split("-").map(Number);
    const slotDate = new Date(y, mo - 1, d, Math.floor(slotStartMin / 60), slotStartMin % 60);
    if (slotDate >= bStart && slotDate < bEnd) return true;
  }
  return false;
};

export const useScheduleSlots = () => {
  const [daySlots, setDaySlots] = useState<DaySlots[]>([]);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<ScheduleConfig>({
    slot_duration_min: 15,
    buffer_min: 5,
    advance_hours: 2,
    max_days_ahead: 3,
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);

    const [consultantsRes, availRes, blockedRes] = await Promise.all([
      supabase.from("schedule_consultants").select("*").eq("active", true),
      supabase.from("schedule_availability").select("*"),
      supabase.from("schedule_blocked_periods").select("*"),
    ]);

    const consultants = (consultantsRes.data || []) as any[];
    const availability = (availRes.data || []) as AvailabilitySlot[];
    const blocked = (blockedRes.data || []) as BlockedPeriod[];

    if (consultants.length === 0) {
      setDaySlots([]);
      setLoading(false);
      return;
    }

    // Use first active consultant's config (will support round-robin later)
    const c = consultants[0];
    const slotDuration = c.slot_duration_min || 15;
    const buffer = c.buffer_min || 5;
    const advanceHours = c.advance_hours || 2;
    const maxDays = c.max_days_ahead || 3;

    setConfig({ slot_duration_min: slotDuration, buffer_min: buffer, advance_hours: advanceHours, max_days_ahead: maxDays });

    // Build availability map: day_of_week → [{start, end}]
    const availByDay = new Map<number, { start: number; end: number }[]>();
    for (const a of availability) {
      const entries = availByDay.get(a.day_of_week) || [];
      entries.push({ start: timeToMinutes(a.start_time), end: timeToMinutes(a.end_time) });
      availByDay.set(a.day_of_week, entries);
    }

    // Generate days
    const now = new Date();
    const minTime = new Date(now.getTime() + advanceHours * 60 * 60 * 1000);
    const result: DaySlots[] = [];
    let d = new Date(now);
    let daysChecked = 0;

    while (result.length < maxDays && daysChecked < maxDays + 10) {
      const dow = d.getDay();
      const periods = availByDay.get(dow);

      if (periods && periods.length > 0) {
        const dd = pad2(d.getDate());
        const mm = pad2(d.getMonth() + 1);
        const yyyy = d.getFullYear();
        const isoDate = `${yyyy}-${mm}-${dd}`;
        const dateLabel = `${dd}/${mm}`;

        const slots: string[] = [];

        // Sort periods by start time
        const sortedPeriods = [...periods].sort((a, b) => a.start - b.start);

        for (const period of sortedPeriods) {
          let cursor = period.start;
          while (cursor + slotDuration <= period.end) {
            const startH = Math.floor(cursor / 60);
            const startM = cursor % 60;
            const endMin = cursor + slotDuration;
            const endH = Math.floor(endMin / 60);
            const endM = endMin % 60;

            // Check advance time
            const slotDate = new Date(yyyy, d.getMonth(), d.getDate(), startH, startM);
            const isTooSoon = slotDate < minTime;

            // Check blocked periods
            const isBlocked = isWithinBlocked(isoDate, cursor, blocked);

            if (!isTooSoon && !isBlocked) {
              slots.push(buildSlotLabel(startH, startM, endH, endM));
            }

            cursor += slotDuration + buffer;
          }
        }

        if (slots.length > 0) {
          result.push({ day: WEEKDAYS[dow], date: dateLabel, isoDate, slots });
        }
      }

      d = new Date(d.getTime() + 86400000);
      daysChecked++;
    }

    // Fetch booked slots
    if (result.length > 0) {
      const minIso = result[0].isoDate + "T00:00:00";
      const maxIso = result[result.length - 1].isoDate + "T23:59:59";

      const { data: leads } = await supabase
        .from("leads")
        .select("reuniao_data_hora_iso, scheduled_time")
        .not("reuniao_data_hora_iso", "is", null)
        .gte("reuniao_data_hora_iso", minIso)
        .lte("reuniao_data_hora_iso", maxIso)
        .not("status", "eq", "perdido");

      if (leads) {
        const booked = new Set<string>();
        leads.forEach((lead: any) => {
          if (lead.reuniao_data_hora_iso && lead.scheduled_time) {
            const dt = new Date(lead.reuniao_data_hora_iso);
            const dateKey = `${pad2(dt.getDate())}/${pad2(dt.getMonth() + 1)}`;
            booked.add(`${dateKey}|${lead.scheduled_time}`);
          }
        });
        setBookedSlots(booked);
      }
    }

    setDaySlots(result);
    setLoading(false);
  };

  const isSlotBooked = (date: string, time: string) => bookedSlots.has(`${date}|${time}`);

  return { daySlots, bookedSlots, isSlotBooked, loading, config, WEEKDAYS };
};

export const buildSlotKey = (date: string, time: string) => `${date}|${time}`;

// Parse start hour/min from slot label like "9h às 9h25" → { hour: 9, min: 0 }
export const parseSlotStart = (slot: string): { hour: number; min: number } => {
  const match = slot.match(/^(\d+)h(\d+)?/);
  return { hour: match ? parseInt(match[1]) : 9, min: match && match[2] ? parseInt(match[2]) : 0 };
};
