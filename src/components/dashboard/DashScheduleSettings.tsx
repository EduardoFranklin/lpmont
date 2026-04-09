import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarCog, Plus, Trash2, User, Save, ShieldBan, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface Consultant {
  id: string;
  name: string;
  email: string;
  active: boolean;
  slot_duration_min: number;
  buffer_min: number;
  advance_hours: number;
  max_days_ahead: number;
}

interface Availability {
  id: string;
  consultant_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface BlockedPeriod {
  id: string;
  start_at: string;
  end_at: string;
  reason: string;
}

const formatTimeForDisplay = (t: string) => t?.slice(0, 5) || "";

const DashScheduleSettings = () => {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [blocked, setBlocked] = useState<BlockedPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New consultant form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);

  // New blocked period
  const [newBlockStart, setNewBlockStart] = useState("");
  const [newBlockEnd, setNewBlockEnd] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [c, a, b] = await Promise.all([
      supabase.from("schedule_consultants").select("*").order("created_at"),
      supabase.from("schedule_availability").select("*").order("day_of_week"),
      supabase.from("schedule_blocked_periods").select("*").order("start_at"),
    ]);
    setConsultants((c.data as Consultant[]) || []);
    setAvailability((a.data as Availability[]) || []);
    setBlocked((b.data as BlockedPeriod[]) || []);
    setLoading(false);
  };

  const addConsultant = async () => {
    if (!newEmail.trim()) { toast.error("Email obrigatório"); return; }
    const { error } = await supabase.from("schedule_consultants").insert({ name: newName.trim() || newEmail.split("@")[0], email: newEmail.trim() });
    if (error) { toast.error("Erro: " + error.message); return; }
    setNewName(""); setNewEmail(""); setShowNewForm(false);
    toast.success("Consultor adicionado!");
    fetchAll();
  };

  const deleteConsultant = async (id: string) => {
    if (!confirm("Remover este consultor e sua disponibilidade?")) return;
    await supabase.from("schedule_consultants").delete().eq("id", id);
    toast.success("Consultor removido");
    fetchAll();
  };

  const updateConsultantField = (id: string, field: keyof Consultant, value: any) => {
    setConsultants(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const toggleDay = (consultantId: string, dayIdx: number) => {
    const existing = availability.filter(a => a.consultant_id === consultantId && a.day_of_week === dayIdx);
    if (existing.length > 0) {
      setAvailability(prev => prev.filter(a => !(a.consultant_id === consultantId && a.day_of_week === dayIdx)));
    } else {
      setAvailability(prev => [...prev, {
        id: `new-${Date.now()}-${dayIdx}`,
        consultant_id: consultantId,
        day_of_week: dayIdx,
        start_time: "08:00:00",
        end_time: "12:00:00",
      }]);
    }
  };

  const getSlots = (consultantId: string) => {
    const days = new Set(availability.filter(a => a.consultant_id === consultantId).map(a => a.day_of_week));
    return days;
  };

  const getSlotsByDay = (consultantId: string, dayIdx: number) => {
    return availability.filter(a => a.consultant_id === consultantId && a.day_of_week === dayIdx);
  };

  const addSlotToDay = (consultantId: string, dayIdx: number) => {
    setAvailability(prev => [...prev, {
      id: `new-${Date.now()}-${Math.random()}`,
      consultant_id: consultantId,
      day_of_week: dayIdx,
      start_time: "13:00:00",
      end_time: "18:00:00",
    }]);
  };

  const removeSlot = (slotId: string) => {
    setAvailability(prev => prev.filter(a => a.id !== slotId));
  };

  const updateSlot = (slotId: string, field: "start_time" | "end_time" | "day_of_week", value: string | number) => {
    setAvailability(prev => prev.map(a => a.id === slotId ? { ...a, [field]: field === "day_of_week" ? value : value + ":00" } : a));
  };

  const addBlockedPeriod = async () => {
    if (!newBlockStart || !newBlockEnd) { toast.error("Preencha início e fim"); return; }
    const { error } = await supabase.from("schedule_blocked_periods").insert({
      start_at: newBlockStart,
      end_at: newBlockEnd,
      reason: newBlockReason,
    });
    if (error) { toast.error(error.message); return; }
    setNewBlockStart(""); setNewBlockEnd(""); setNewBlockReason("");
    toast.success("Período bloqueado adicionado");
    fetchAll();
  };

  const removeBlocked = async (id: string) => {
    await supabase.from("schedule_blocked_periods").delete().eq("id", id);
    toast.success("Período removido");
    fetchAll();
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      // Save consultant configs
      for (const c of consultants) {
        await supabase.from("schedule_consultants").update({
          name: c.name,
          email: c.email,
          active: c.active,
          slot_duration_min: c.slot_duration_min,
          buffer_min: c.buffer_min,
          advance_hours: c.advance_hours,
          max_days_ahead: c.max_days_ahead,
        }).eq("id", c.id);
      }

      // Rebuild availability: delete all, re-insert
      const consultantIds = consultants.map(c => c.id);
      for (const cid of consultantIds) {
        await supabase.from("schedule_availability").delete().eq("consultant_id", cid);
      }
      const toInsert = availability.map(a => ({
        consultant_id: a.consultant_id,
        day_of_week: a.day_of_week,
        start_time: a.start_time,
        end_time: a.end_time,
      }));
      if (toInsert.length > 0) {
        const { error } = await supabase.from("schedule_availability").insert(toInsert);
        if (error) throw error;
      }

      toast.success("Configurações da agenda salvas!");
    } catch (err: any) {
      toast.error("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-muted-foreground text-sm">Carregando agenda...</p>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarCog className="w-4 h-4" /> Configurações da Agenda
            </CardTitle>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setShowNewForm(!showNewForm)}>
              <Plus className="w-3.5 h-3.5" /> Nova Configuração
            </Button>
          </div>
          <CardDescription className="text-xs">
            Cada consultor tem sua própria disponibilidade. Leads são atribuídos automaticamente por round-robin entre os consultores disponíveis no horário escolhido.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showNewForm && (
            <div className="rounded-lg border border-dashed border-primary/30 p-3 space-y-2 bg-primary/5">
              <p className="text-xs font-medium text-foreground/70">Novo Consultor</p>
              <div className="flex gap-2">
                <Input placeholder="Nome" value={newName} onChange={e => setNewName(e.target.value)} className="text-sm" />
                <Input placeholder="email@exemplo.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="text-sm" />
                <Button size="sm" onClick={addConsultant}>Adicionar</Button>
              </div>
            </div>
          )}

          {consultants.map(consultant => {
            const activeDays = getSlots(consultant.id);

            return (
              <div key={consultant.id} className="rounded-lg border p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{consultant.name}</span>
                    <span className="text-xs text-muted-foreground">{consultant.email}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => deleteConsultant(consultant.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* Day toggles */}
                <div className="flex gap-1.5 flex-wrap">
                  {DAYS.map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleDay(consultant.id, idx)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        activeDays.has(idx)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                {/* Time slots grouped by day */}
                <div className="space-y-2">
                  {DAYS.map((dayLabel, dayIdx) => {
                    if (!activeDays.has(dayIdx)) return null;
                    const daySlots = getSlotsByDay(consultant.id, dayIdx);
                    return (
                      <div key={dayIdx} className="flex items-start gap-2">
                        <span className="text-xs font-medium text-muted-foreground w-8 pt-2 shrink-0">{dayLabel}</span>
                        <div className="flex flex-col gap-1 flex-1">
                          {daySlots.map(slot => (
                            <div key={slot.id} className="flex items-center gap-1.5">
                              <Input
                                type="time"
                                value={formatTimeForDisplay(slot.start_time)}
                                onChange={e => updateSlot(slot.id, "start_time", e.target.value)}
                                className="w-24 text-xs h-7"
                              />
                              <span className="text-xs text-muted-foreground">às</span>
                              <Input
                                type="time"
                                value={formatTimeForDisplay(slot.end_time)}
                                onChange={e => updateSlot(slot.id, "end_time", e.target.value)}
                                className="w-24 text-xs h-7"
                              />
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeSlot(slot.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                          <Button variant="ghost" size="sm" className="text-[10px] gap-1 h-5 w-fit px-1.5 text-muted-foreground" onClick={() => addSlotToDay(consultant.id, dayIdx)}>
                            <Plus className="w-2.5 h-2.5" /> período
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Config row */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1 border-t">
                  <label className="flex items-center gap-1">
                    <span>Duração</span>
                    <Input
                      type="number"
                      min={5}
                      value={consultant.slot_duration_min}
                      onChange={e => updateConsultantField(consultant.id, "slot_duration_min", parseInt(e.target.value) || 15)}
                      className="w-14 h-7 text-xs text-center"
                    />
                    <span>min</span>
                  </label>
                  <span className="text-muted-foreground/40">•</span>
                  <label className="flex items-center gap-1">
                    <span>Buffer</span>
                    <Input
                      type="number"
                      min={0}
                      value={consultant.buffer_min}
                      onChange={e => updateConsultantField(consultant.id, "buffer_min", parseInt(e.target.value) || 0)}
                      className="w-14 h-7 text-xs text-center"
                    />
                    <span>min</span>
                  </label>
                  <span className="text-muted-foreground/40">•</span>
                  <label className="flex items-center gap-1">
                    <span>Antecedência</span>
                    <Input
                      type="number"
                      min={0}
                      value={consultant.advance_hours}
                      onChange={e => updateConsultantField(consultant.id, "advance_hours", parseInt(e.target.value) || 0)}
                      className="w-14 h-7 text-xs text-center"
                    />
                    <span>h</span>
                  </label>
                  <span className="text-muted-foreground/40">•</span>
                  <label className="flex items-center gap-1">
                    <span>Máx</span>
                    <Input
                      type="number"
                      min={1}
                      value={consultant.max_days_ahead}
                      onChange={e => updateConsultantField(consultant.id, "max_days_ahead", parseInt(e.target.value) || 3)}
                      className="w-14 h-7 text-xs text-center"
                    />
                    <span>dias</span>
                  </label>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Blocked periods */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldBan className="w-4 h-4" /> Períodos Bloqueados (global)
          </CardTitle>
          <CardDescription className="text-xs">
            Bloqueie intervalos para impedir agendamentos para todos os consultores.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {blocked.map(b => (
            <div key={b.id} className="flex items-center gap-2 text-xs">
              <Badge variant="secondary" className="font-mono">
                {new Date(b.start_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
              </Badge>
              <span className="text-muted-foreground">→</span>
              <Badge variant="secondary" className="font-mono">
                {new Date(b.end_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
              </Badge>
              {b.reason && <span className="text-muted-foreground">{b.reason}</span>}
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => removeBlocked(b.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}

          <div className="flex items-end gap-2 pt-1">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">Início</label>
              <Input type="datetime-local" value={newBlockStart} onChange={e => setNewBlockStart(e.target.value)} className="text-xs h-8 w-44" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">Fim</label>
              <Input type="datetime-local" value={newBlockEnd} onChange={e => setNewBlockEnd(e.target.value)} className="text-xs h-8 w-44" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">Motivo (opcional)</label>
              <Input value={newBlockReason} onChange={e => setNewBlockReason(e.target.value)} placeholder="Ex: Feriado" className="text-xs h-8 w-32" />
            </div>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={addBlockedPeriod}>
              <Plus className="w-3 h-3" /> Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveAll} disabled={saving} className="gap-1.5">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Salvando..." : "Salvar Agenda"}
        </Button>
      </div>
    </div>
  );
};

export default DashScheduleSettings;
